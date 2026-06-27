import { createHmac } from "node:crypto";
import prisma from "@/prisma/client";
import { portfolioAgentConfig } from "./config";

type WindowKind = "minute" | "day";

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

export function hashRateLimitKey(
  value: string,
  secret = process.env.PORTFOLIO_AGENT_RATE_LIMIT_SECRET ?? "",
): string {
  if (!secret) throw new Error("PORTFOLIO_AGENT_RATE_LIMIT_SECRET is required");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function getWindow(now: Date, kind: WindowKind) {
  const start = new Date(now);
  if (kind === "minute") {
    start.setUTCSeconds(0, 0);
    return { start, expiresAt: new Date(start.getTime() + 60_000) };
  }
  start.setUTCHours(0, 0, 0, 0);
  return {
    start,
    expiresAt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
  };
}

async function consumeBucket({
  keyHash,
  scope,
  kind,
  limit,
  now,
}: {
  keyHash: string;
  scope: string;
  kind: WindowKind;
  limit: number;
  now: Date;
}) {
  const { start, expiresAt } = getWindow(now, kind);
  const id = `${scope}:${keyHash}:${start.toISOString()}`;
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "PortfolioAgentRateLimitBucket"
      ("id", "keyHash", "scope", "windowStart", "count", "expiresAt")
    VALUES
      (${id}, ${keyHash}, ${scope}, ${start}, 1, ${expiresAt})
    ON CONFLICT ("id")
    DO UPDATE SET "count" = "PortfolioAgentRateLimitBucket"."count" + 1
    RETURNING "count"
  `;
  return rows[0].count <= limit;
}

export async function checkPortfolioAgentRateLimits({
  headers,
  conversationId,
  now = new Date(),
}: {
  headers: Headers;
  conversationId: string;
  now?: Date;
}): Promise<boolean> {
  const ipHash = hashRateLimitKey(getClientIp(headers));
  const conversationHash = hashRateLimitKey(conversationId);
  const [ipMinute, ipDay, conversationMinute] = await Promise.all([
    consumeBucket({
      keyHash: ipHash,
      scope: "ip-minute",
      kind: "minute",
      limit: portfolioAgentConfig.rateLimits.ipPerMinute,
      now,
    }),
    consumeBucket({
      keyHash: ipHash,
      scope: "ip-day",
      kind: "day",
      limit: portfolioAgentConfig.rateLimits.ipPerDay,
      now,
    }),
    consumeBucket({
      keyHash: conversationHash,
      scope: "conversation-minute",
      kind: "minute",
      limit: portfolioAgentConfig.rateLimits.conversationPerMinute,
      now,
    }),
  ]);

  return ipMinute && ipDay && conversationMinute;
}
