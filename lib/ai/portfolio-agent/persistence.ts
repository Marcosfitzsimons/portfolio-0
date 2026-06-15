import type { PortfolioAgentMessage, PublicTraceEvent, RoutingProfile, Specialist } from "./schemas";
import { portfolioAgentConfig } from "./config";
import prisma from "@/prisma/client";
import { Prisma } from "@prisma/client";

export class ConversationBusyError extends Error {
  constructor() {
    super("Conversation already has an active run");
    this.name = "ConversationBusyError";
  }
}

export function buildConversationWindow(
  previousMessages: PortfolioAgentMessage[],
  currentMessage: PortfolioAgentMessage,
  limit = portfolioAgentConfig.historyMessages,
): PortfolioAgentMessage[] {
  return [...previousMessages.slice(-(limit - 1)), currentMessage];
}

export function getRetentionExpiry(
  now = new Date(),
  days = portfolioAgentConfig.retentionDays,
): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function loadConversationMessages(
  conversationId: string,
): Promise<PortfolioAgentMessage[]> {
  if (!portfolioAgentConfig.features.persistence) return [];
  const conversation = await prisma.portfolioAgentConversation.findUnique({
    where: { id: conversationId },
    select: { messages: true },
  });

  return (conversation?.messages ?? []) as unknown as PortfolioAgentMessage[];
}

export async function beginRun({
  conversationId,
  runId,
}: {
  conversationId: string;
  runId: string;
}): Promise<void> {
  if (!portfolioAgentConfig.features.persistence) return;
  await prisma.$transaction(async transaction => {
    await transaction.portfolioAgentConversation.upsert({
      where: { id: conversationId },
      create: {
        id: conversationId,
        messages: [],
        expiresAt: getRetentionExpiry(),
      },
      update: { expiresAt: getRetentionExpiry() },
    });

    const lock = await transaction.portfolioAgentConversation.updateMany({
      where: { id: conversationId, activeRunId: null },
      data: { activeRunId: runId },
    });

    if (lock.count !== 1) throw new ConversationBusyError();

    await transaction.portfolioAgentRun.create({
      data: {
        id: runId,
        conversationId,
        status: "running",
      },
    });
  });
}

export async function saveRoutingProfile({
  runId,
  routingProfile,
  routingMode,
}: {
  runId: string;
  routingProfile: RoutingProfile;
  routingMode: "deterministic" | "orchestrator";
}): Promise<void> {
  if (!portfolioAgentConfig.features.persistence) return;
  await prisma.portfolioAgentRun.update({
    where: { id: runId },
    data: {
      routingProfile: routingProfile as unknown as Prisma.InputJsonValue,
      routingMode,
    },
  });
}

export async function startSpecialistRun({
  runId,
  specialist,
  model,
  sourceIds,
}: {
  runId: string;
  specialist: Specialist;
  model: string;
  sourceIds: string[];
}): Promise<void> {
  if (!portfolioAgentConfig.features.persistence) return;
  await prisma.portfolioAgentSpecialistRun.create({
    data: {
      runId,
      specialist,
      model,
      sourceIds,
      status: "running",
    },
  });
}

export async function finishSpecialistRun({
  runId,
  specialist,
  status,
  evidence,
  errorCode,
  durationMs,
}: {
  runId: string;
  specialist: Specialist;
  status: "completed" | "failed" | "cancelled";
  evidence?: unknown;
  errorCode?: string;
  durationMs: number;
}): Promise<void> {
  if (!portfolioAgentConfig.features.persistence) return;
  await prisma.portfolioAgentSpecialistRun.update({
    where: { runId_specialist: { runId, specialist } },
    data: {
      status,
      evidence:
        evidence == null
          ? undefined
          : (evidence as Prisma.InputJsonValue),
      errorCode,
      durationMs,
      completedAt: new Date(),
    },
  });
}

export async function appendTraceEvent({
  runId,
  sequence,
  event,
}: {
  runId: string;
  sequence: number;
  event: PublicTraceEvent;
}): Promise<void> {
  if (!portfolioAgentConfig.features.persistence) return;
  const {
    id,
    type,
    label,
    durationMs,
    sourceLabels = [],
    timestamp: _timestamp,
    ...publicData
  } = event;

  await prisma.portfolioAgentTraceEvent.create({
    data: {
      id,
      runId,
      sequence,
      type,
      publicLabel: label,
      publicData: publicData as Prisma.InputJsonValue,
      sourceLabels,
      durationMs,
    },
  });
}

export async function finishRun({
  conversationId,
  runId,
  messages,
  status,
  orchestratorModel,
  usage,
  errorCode,
  durationMs,
}: {
  conversationId: string;
  runId: string;
  messages: PortfolioAgentMessage[];
  status: "completed" | "failed" | "cancelled";
  orchestratorModel?: string;
  usage?: unknown;
  errorCode?: string;
  durationMs: number;
}): Promise<void> {
  if (!portfolioAgentConfig.features.persistence) return;
  await prisma.$transaction([
    prisma.portfolioAgentConversation.updateMany({
      where: { id: conversationId, activeRunId: runId },
      data: {
        activeRunId: null,
        messages: messages as unknown as Prisma.InputJsonValue,
        expiresAt: getRetentionExpiry(),
      },
    }),
    prisma.portfolioAgentRun.update({
      where: { id: runId },
      data: {
        status,
        orchestratorModel,
        usage:
          usage == null ? undefined : (usage as Prisma.InputJsonValue),
        errorCode,
        durationMs,
        completedAt: new Date(),
      },
    }),
  ]);
}

export async function releaseRunLock({
  conversationId,
  runId,
}: {
  conversationId: string;
  runId: string;
}): Promise<void> {
  if (!portfolioAgentConfig.features.persistence) return;
  await prisma.portfolioAgentConversation.updateMany({
    where: { id: conversationId, activeRunId: runId },
    data: { activeRunId: null },
  });
}

export async function deleteExpiredPortfolioAgentData(
  now = new Date(),
): Promise<{ conversations: number; rateLimitBuckets: number }> {
  if (!portfolioAgentConfig.features.persistence)
    return { conversations: 0, rateLimitBuckets: 0 };
  const [conversations, rateLimitBuckets] = await prisma.$transaction([
    prisma.portfolioAgentConversation.deleteMany({
      where: { expiresAt: { lt: now }, activeRunId: null },
    }),
    prisma.portfolioAgentRateLimitBucket.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
  ]);

  return {
    conversations: conversations.count,
    rateLimitBuckets: rateLimitBuckets.count,
  };
}
