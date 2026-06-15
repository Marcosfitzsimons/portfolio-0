import { NextResponse } from "next/server";
import { deleteExpiredPortfolioAgentData } from "@/lib/ai/portfolio-agent/persistence";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteExpiredPortfolioAgentData();
  return NextResponse.json({ ok: true, deleted });
}
