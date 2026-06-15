import { generateId } from "ai";
import type { PublicTraceEvent } from "./schemas";
import { publicTraceEventSchema } from "./schemas";
import { appendTraceEvent } from "./persistence";
import { portfolioAgentConfig } from "./config";

type TraceInput = Omit<PublicTraceEvent, "id" | "timestamp">;

export function createTracePublisher({
  runId,
  write,
  persist = appendTraceEvent,
  now = () => new Date(),
  id = generateId,
}: {
  runId: string;
  write: (part: {
    type: "data-trace";
    id: string;
    data: PublicTraceEvent;
  }) => void;
  persist?: typeof appendTraceEvent;
  now?: () => Date;
  id?: () => string;
}) {
  let sequence = 0;

  return async (input: TraceInput): Promise<PublicTraceEvent> => {
    const event = publicTraceEventSchema.parse({
      ...input,
      id: id(),
      timestamp: now().toISOString(),
    });

    if (portfolioAgentConfig.features.publicTrace) {
      write({ type: "data-trace", id: event.id, data: event });
    }
    sequence += 1;
    try {
      await persist({ runId, sequence, event });
    } catch (error) {
      // Trace persistence is best-effort: a transient DB write failure must
      // never reject the turn (and must not break the SDK flush when called
      // from inside onFinish/onError/onAbort).
      console.error("portfolio-agent: trace persistence failed", error);
    }
    return event;
  };
}
