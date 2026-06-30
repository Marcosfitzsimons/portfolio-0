import {
  consumeStream,
  convertToModelMessages,
  createIdGenerator,
  generateId,
  createUIMessageStream,
  createUIMessageStreamResponse,
  validateUIMessages,
  type Tool,
} from "ai";
import { NextResponse } from "next/server";
import {
  beginRun,
  ConversationBusyError,
  loadConversationMessages,
  finishRun,
} from "@/lib/ai/portfolio-agent/persistence";
import { checkPortfolioAgentRateLimits } from "@/lib/ai/portfolio-agent/rate-limit";
import { createPortfolioAgentRuntime } from "@/lib/ai/portfolio-agent/runtime";
import {
  chatRequestSchema,
  publicTraceEventSchema,
  type PortfolioAgentMessage,
} from "@/lib/ai/portfolio-agent/schemas";
import { specialistValidationTools } from "@/lib/ai/portfolio-agent/specialists";

export const maxDuration = 30;

const runtime = createPortfolioAgentRuntime();
const generateMessageId = createIdGenerator({ prefix: "msg", size: 16 });

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ messages: [] });
  const messages = await loadConversationMessages(id);
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const parsed = chatRequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });
  }

  const previousMessages = await loadConversationMessages(parsed.data.id);
  const validationTools = specialistValidationTools as Record<string, Tool<unknown, unknown>>;
  const messages = await validateUIMessages<PortfolioAgentMessage>({
    messages: [...previousMessages.slice(-7), parsed.data.message],
    dataSchemas: { trace: publicTraceEventSchema },
    tools: validationTools,
  });
  const modelMessages = await convertToModelMessages(messages, {
    tools: validationTools,
    ignoreIncompleteToolCalls: true,
  });

  if (
    !(await checkPortfolioAgentRateLimits({
      headers: req.headers,
      conversationId: parsed.data.id,
    }))
  ) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const runId = generateId();
  try {
    await beginRun({ conversationId: parsed.data.id, runId });
  } catch (error) {
    if (error instanceof ConversationBusyError) {
      return NextResponse.json(
        { error: "A request is already running" },
        { status: 409 },
      );
    }
    throw error;
  }

  let orchestratorModel = "";
  let usage: Record<string, unknown> = {};
  const startedAt = Date.now();
  let terminalPersisted = false;

  const persistTerminal = async ({
    completedMessages,
    status,
    errorCode,
  }: {
    completedMessages: PortfolioAgentMessage[];
    status: "completed" | "failed" | "cancelled";
    errorCode?: string;
  }) => {
    if (terminalPersisted) return;
    terminalPersisted = true;
    await finishRun({
      conversationId: parsed.data.id,
      runId,
      messages: completedMessages,
      status,
      orchestratorModel,
      usage,
      errorCode,
      durationMs: Date.now() - startedAt,
    });
  };

  try {
    const stream = createUIMessageStream<PortfolioAgentMessage>({
      originalMessages: messages,
      generateId: generateMessageId,
      execute: async ({ writer }) => {
        // Open the assistant message BEFORE the runtime writes any data-trace
        // parts. Without this, trace parts stream ahead of the `start` boundary;
        // the React client then holds them in a throwaway message under an
        // optimistic id and opens a SECOND message when `start` arrives with the
        // server id — rendering an empty duplicate bubble. (AI SDK cookbook
        // pattern: start -> data parts -> merge with sendStart:false.)
        writer.write({ type: "start" });

        const result = await runtime.runTurn({
          runId,
          conversationId: parsed.data.id,
          currentMessage: parsed.data.message as PortfolioAgentMessage,
          previousMessages,
          modelMessages,
          requestHeaders: req.headers,
          abortSignal: req.signal,
          writer,
        });

        orchestratorModel = result.orchestratorModel ?? "";
        usage = result.usage;

        if (result.directText != null) {
          const textId = generateMessageId();
          writer.write({ type: "text-start", id: textId });
          writer.write({ type: "text-delta", id: textId, delta: result.directText });
          writer.write({ type: "text-end", id: textId });
          return;
        }

        if (result.orchestratorStream) {
          writer.merge(result.orchestratorStream);
        }
      },
      onFinish: async ({ messages: completedMessages, isAborted }) => {
        await persistTerminal({
          completedMessages,
          status: isAborted ? "cancelled" : "completed",
        });
      },
      onError: error => {
        void persistTerminal({
          completedMessages: messages,
          status: "failed",
          errorCode: "STREAM_ERROR",
        });
        console.error("Portfolio Agent stream failed", error);
        return "The Portfolio Agent could not complete this request.";
      },
    });

    return createUIMessageStreamResponse({
      stream,
      consumeSseStream: consumeStream,
    });
  } catch (error) {
    await persistTerminal({
      completedMessages: messages,
      status: "failed",
      errorCode: "REQUEST_SETUP_ERROR",
    });
    console.error("Portfolio Agent request setup failed", error);
    return NextResponse.json(
      { error: "The Portfolio Agent could not start this request" },
      { status: 500 },
    );
  }
}
