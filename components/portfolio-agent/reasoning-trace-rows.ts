import type { PublicTraceEvent, Specialist } from "@/lib/ai/portfolio-agent/schemas";

export type SpecialistStatus = "running" | "done" | "failed";

export type TraceRow =
  | { kind: "op"; key: string; label: string; status: "running" | "done" | "failed" }
  | { kind: "specialist"; key: string; specialist: Specialist; status: SpecialistStatus; durationMs?: number };

export const SPECIALIST_META: Record<
  Specialist,
  { label: string; accent: string; soft: string; icon: string }
> = {
  ai: { label: "AI", accent: "#a78bfa", soft: "rgba(167,139,250,0.14)", icon: "✦" },
  cloud: { label: "Cloud", accent: "#22d3ee", soft: "rgba(34,211,238,0.14)", icon: "☁" },
  product: { label: "Product", accent: "#34d399", soft: "rgba(52,211,153,0.14)", icon: "◆" },
  mobile: { label: "Mobile", accent: "#fbbf24", soft: "rgba(251,191,36,0.14)", icon: "▣" },
};

const TERMINAL_TYPES = new Set([
  "answer.completed",
  "answer.failed",
  "request.cancelled",
]);

export function hasTerminalEvent(events: PublicTraceEvent[]): boolean {
  return events.some((e) => TERMINAL_TYPES.has(e.type));
}

export function buildRows(events: PublicTraceEvent[]): TraceRow[] {
  const rows: TraceRow[] = [];

  const received = events.find((e) => e.type === "request.received");
  if (received) rows.push({ kind: "op", key: "received", label: received.label, status: "done" });

  const classified = events.find((e) => e.type === "classification.completed");
  if (classified) rows.push({ kind: "op", key: "classified", label: classified.label, status: "done" });

  // Group specialist events by specialist, preserving first-seen order.
  const order: Specialist[] = [];
  const byId: Record<string, { status: SpecialistStatus; durationMs?: number }> = {};
  for (const e of events) {
    const sp = e.specialist;
    if (!sp) continue;
    if (!byId[sp]) {
      order.push(sp);
      byId[sp] = { status: "running" };
    }
    if (e.type === "specialist.completed") byId[sp] = { status: "done", durationMs: e.durationMs };
    else if (e.type === "specialist.failed") byId[sp] = { status: "failed", durationMs: e.durationMs };
  }
  for (const sp of order) {
    rows.push({ kind: "specialist", key: `sp-${sp}`, specialist: sp, status: byId[sp].status, durationMs: byId[sp].durationMs });
  }

  const synthesis = events.find((e) => e.type === "synthesis.started");
  if (synthesis) {
    rows.push({ kind: "op", key: "synthesis", label: synthesis.label, status: hasTerminalEvent(events) ? "done" : "running" });
  }

  const terminal = events.find((e) => e.type === "answer.failed" || e.type === "request.cancelled");
  if (terminal) {
    rows.push({ kind: "op", key: "terminal", label: terminal.label, status: "failed" });
  }

  return rows;
}

export function computeReasonedSeconds(events: PublicTraceEvent[]): number | null {
  const start = events.find((e) => e.type === "request.received");
  const end = events.find((e) => TERMINAL_TYPES.has(e.type));
  if (!start || !end) return null;
  const ms = new Date(end.timestamp).getTime() - new Date(start.timestamp).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  return ms / 1000;
}
