import {
  generateId as defaultGenerateId,
  stepCountIs,
  streamText,
  type InferUIMessageChunk,
  type LanguageModel,
  type ModelMessage,
  type UIMessageStreamWriter,
} from "ai";
import { getGuardrailMessage as defaultGetGuardrailMessage } from "@/lib/ai/chat-policy";
import { portfolioAgentConfig } from "./config";
import { portfolioAgentModels } from "./models";
import {
  classifyPortfolioRequest,
  getActiveLens,
  getRoutingMode,
  safeAbstentionProfile,
  technicalLenses,
} from "./classifier";
import {
  retrieveEvidence as defaultRetrieveEvidence,
  type RetrievedEvidence,
} from "./evidence";
import {
  buildOrchestratorSystemPrompt,
  shouldEscalateOrchestrator,
} from "./orchestrator";
import { buildConversationWindow } from "./persistence";
import {
  appendTraceEvent as defaultAppendTraceEvent,
  finishSpecialistRun as defaultFinishSpecialistRun,
  saveRoutingProfile as defaultSaveRoutingProfile,
  startSpecialistRun as defaultStartSpecialistRun,
} from "./persistence";
import {
  createDelegationBudget,
  createSpecialistTools,
  retrieveAndRunSpecialist as defaultRetrieveAndRunSpecialist,
} from "./specialists";
import { createTracePublisher } from "./trace";
import {
  toConfidenceBand,
  type EvidencePacket,
  type PortfolioAgentMessage,
  type RoutingProfile,
  type Specialist,
} from "./schemas";

export type RuntimeDependencies = {
  classify: typeof classifyPortfolioRequest;
  retrieveEvidence: typeof defaultRetrieveEvidence;
  retrieveAndRunSpecialist: typeof defaultRetrieveAndRunSpecialist;
  saveRoutingProfile: typeof defaultSaveRoutingProfile;
  startSpecialistRun: typeof defaultStartSpecialistRun;
  finishSpecialistRun: typeof defaultFinishSpecialistRun;
  appendTraceEvent: typeof defaultAppendTraceEvent;
  getGuardrailMessage: typeof defaultGetGuardrailMessage;
  orchestratorModel: LanguageModel;
  escalatedOrchestratorModel: LanguageModel;
  orchestratorModelName: string;
  escalatedOrchestratorModelName: string;
  now: () => Date;
  generateId: () => string;
};

export type RunTurnInput = {
  runId: string;
  conversationId: string;
  currentMessage: PortfolioAgentMessage;
  previousMessages: PortfolioAgentMessage[];
  modelMessages: ModelMessage[];
  requestHeaders: Headers;
  abortSignal: AbortSignal;
  writer: UIMessageStreamWriter<PortfolioAgentMessage>;
};

export type RunTurnResult = {
  runId: string;
  originalMessages: PortfolioAgentMessage[];
  orchestratorStream?: ReadableStream<
    InferUIMessageChunk<PortfolioAgentMessage>
  >;
  directText?: string;
  orchestratorModel?: string;
  usage: Record<string, unknown>;
};

function defaultDependencies(): RuntimeDependencies {
  return {
    classify: classifyPortfolioRequest,
    retrieveEvidence: defaultRetrieveEvidence,
    retrieveAndRunSpecialist: defaultRetrieveAndRunSpecialist,
    saveRoutingProfile: defaultSaveRoutingProfile,
    startSpecialistRun: defaultStartSpecialistRun,
    finishSpecialistRun: defaultFinishSpecialistRun,
    appendTraceEvent: defaultAppendTraceEvent,
    getGuardrailMessage: defaultGetGuardrailMessage,
    orchestratorModel: portfolioAgentModels.orchestrator,
    escalatedOrchestratorModel: portfolioAgentModels.escalatedOrchestrator,
    orchestratorModelName: portfolioAgentConfig.models.orchestrator,
    escalatedOrchestratorModelName:
      portfolioAgentConfig.models.escalatedOrchestrator,
    now: () => new Date(),
    generateId: defaultGenerateId,
  };
}

function messageText(message: PortfolioAgentMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map(part => part.text)
    .join("");
}

function sanitizeErrorCode(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "TimeoutError") return "timeout";
    if (error.name === "AbortError") return "aborted";
  }
  if (error instanceof Error && error.name === "TimeoutError") return "timeout";
  return "specialist_error";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function withSpecialistTimeout<T>({
  abortSignal,
  timeoutMs,
  operation,
}: {
  abortSignal: AbortSignal;
  timeoutMs: number;
  operation: (signal: AbortSignal) => Promise<T>;
}): Promise<T> {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(abortSignal.reason);
  abortSignal.addEventListener("abort", forwardAbort, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new DOMException("Timed out", "TimeoutError")),
    timeoutMs,
  );
  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timeout);
    abortSignal.removeEventListener("abort", forwardAbort);
  }
}

export function createPortfolioAgentRuntime(
  dependencies: Partial<RuntimeDependencies> = {},
) {
  const deps: RuntimeDependencies = { ...defaultDependencies(), ...dependencies };

  async function runTurn(input: RunTurnInput): Promise<RunTurnResult> {
    const {
      runId,
      currentMessage,
      previousMessages,
      modelMessages,
      abortSignal,
      writer,
    } = input;

    const usage: Record<string, unknown> = {};
    const currentMessageText = messageText(currentMessage);

    const emitTrace = createTracePublisher({
      runId,
      write: part => writer.write(part),
      persist: deps.appendTraceEvent,
      now: deps.now,
      id: deps.generateId,
    });

    // Terminal trace ownership guard. Exactly ONE of
    // {answer.completed, request.cancelled, answer.failed} is ever emitted per
    // run. Shared by the pre-stream abort handler below and the stream
    // onFinish/onAbort/onError callbacks.
    let terminalEmitted = false;

    return await runTurnInner();

    async function runTurnInner(): Promise<RunTurnResult> {
      try {
        return await runTurnFlow();
      } catch (error) {
        // Step 3 (pre-stream abort): if the request aborts during
        // classify/retrieval/the deterministic specialist phase, the stream's
        // onAbort never fires (no stream exists yet). Emit request.cancelled
        // here under the shared guard, then rethrow. Non-abort pre-stream
        // errors rethrow without a terminal event (no stream to fail; the route
        // records run-status failure).
        if (isAbortError(error) && !terminalEmitted) {
          terminalEmitted = true;
          await emitTrace({
            type: "request.cancelled",
            label: "Request cancelled",
          });
        }
        throw error;
      }
    }

    async function runTurnFlow(): Promise<RunTurnResult> {
    // Step 1: over-length guardrail.
    if (currentMessageText.length > portfolioAgentConfig.maxMessageCharacters) {
      await emitTrace({ type: "request.received", label: "Understanding request" });
      await emitTrace({ type: "answer.completed", label: "Answer ready" });
      return {
        runId,
        originalMessages: buildConversationWindow(
          previousMessages,
          currentMessage,
        ),
        directText:
          "That message is a bit long for me to handle here. Could you trim it down and ask again about Marcos's work, projects, AI experience, stack, availability, or contact?",
        usage,
      };
    }

    // Step 2: conversation window.
    const window = buildConversationWindow(previousMessages, currentMessage);

    // Step 3: request.received.
    await emitTrace({ type: "request.received", label: "Understanding request" });

    // Step 4: classify.
    const activeLens = getActiveLens(previousMessages);
    const profile: RoutingProfile = portfolioAgentConfig.features.classifier
      ? await deps.classify({
          messages: window,
          activeLens,
          abortSignal,
          onUsage: u => {
            usage.classifier = u;
          },
        })
      : safeAbstentionProfile;

    // Step 5: classification.completed (public metadata only).
    let routingMode = getRoutingMode(profile);
    if (!portfolioAgentConfig.features.deterministicDelegation) {
      routingMode = "orchestrator";
    }

    await emitTrace({
      type: "classification.completed",
      label: "Routing decided",
      lenses: profile.lenses,
      complexity: profile.complexity,
      confidenceBand: toConfidenceBand(profile.confidence),
      routingMode,
    });

    // Step 6: persist routing profile.
    await deps.saveRoutingProfile({ runId, routingProfile: profile, routingMode });

    // Step 7: out-of-scope guardrail.
    if (profile.scope === "out_of_scope") {
      await emitTrace({ type: "answer.completed", label: "Answer ready" });
      return {
        runId,
        originalMessages: window,
        directText: deps.getGuardrailMessage(currentMessageText),
        usage,
      };
    }

    const specialistUsage: Record<string, unknown> = {};
    usage.specialists = specialistUsage;

    const packets: EvidencePacket[] = [];
    let generalEvidence: Array<{ id: string; content: string }> = [];
    let failedSpecialists = 0;
    let useTools = false;

    const budget = createDelegationBudget();

    if (routingMode === "deterministic") {
      // Step 9: deterministic path — run claimed specialists concurrently.
      const lenses = technicalLenses(profile).filter(lens => budget.claim(lens));

      const results = await Promise.allSettled(
        lenses.map(async specialist => {
          const startedAt = Date.now();
          await emitTrace({
            type: "specialist.started",
            label: `Consulting ${specialist} specialist`,
            specialist,
          });
          await deps.startSpecialistRun({
            runId,
            specialist,
            model: portfolioAgentConfig.models.specialist,
            sourceIds: [],
          });

          try {
            const { packet } = await withSpecialistTimeout({
              abortSignal,
              timeoutMs: portfolioAgentConfig.specialistTimeoutMs,
              operation: signal =>
                deps.retrieveAndRunSpecialist({
                  specialist,
                  query: currentMessageText,
                  abortSignal: signal,
                }),
            });

            await emitTrace({
              type: "specialist.completed",
              label: `${specialist} specialist ready`,
              specialist,
              durationMs: Date.now() - startedAt,
            });
            await deps.finishSpecialistRun({
              runId,
              specialist,
              status: "completed",
              evidence: packet,
              durationMs: Date.now() - startedAt,
            });
            return packet;
          } catch (error) {
            if (isAbortError(error)) throw error;
            await emitTrace({
              type: "specialist.failed",
              label: `${specialist} specialist unavailable`,
              specialist,
              durationMs: Date.now() - startedAt,
            });
            await deps.finishSpecialistRun({
              runId,
              specialist,
              status: "failed",
              errorCode: sanitizeErrorCode(error),
              durationMs: Date.now() - startedAt,
            });
            throw error;
          }
        }),
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          packets.push(result.value);
        } else {
          if (isAbortError(result.reason)) throw result.reason;
          failedSpecialists += 1;
        }
      }
    } else if (
      portfolioAgentConfig.features.orchestratorTools &&
      !profile.lenses.includes("general")
    ) {
      // Step 11: orchestrator/ambiguous path — let the Orchestrator choose.
      useTools = true;
    } else {
      // Step 10: general lens (or tools disabled) — broad scoped evidence, no Specialist.
      const broadLenses: Specialist[] = ["ai", "product", "cloud", "mobile"];
      const broad: RetrievedEvidence = await deps.retrieveEvidence({
        query: currentMessageText,
        lenses: broadLenses,
        abortSignal,
      });
      generalEvidence = broad.sources.map(source => ({
        id: source.id,
        content: source.content,
      }));
    }

    // Step 13: choose model.
    const escalated = shouldEscalateOrchestrator({
      profile,
      routingMode,
      packets,
      failedSpecialists,
    });
    const orchestratorModel = escalated
      ? deps.escalatedOrchestratorModel
      : deps.orchestratorModel;
    const orchestratorModelName = escalated
      ? deps.escalatedOrchestratorModelName
      : deps.orchestratorModelName;

    // Step 14: synthesis.started.
    await emitTrace({ type: "synthesis.started", label: "Preparing answer" });

    const tools = useTools
      ? createSpecialistTools({
          budget,
          abortSignal,
          invoke: (specialist, question) =>
            deps
              .retrieveAndRunSpecialist({
                specialist,
                query: question,
                abortSignal,
              })
              .then(result => result.packet),
        })
      : undefined;

    const result = streamText({
      model: orchestratorModel,
      abortSignal,
      system: buildOrchestratorSystemPrompt({ packets, generalEvidence }),
      messages: modelMessages,
      tools,
      ...(useTools ? { stopWhen: stepCountIs(6) } : {}),
      experimental_telemetry: {
        isEnabled: true,
        functionId: "portfolio-agent.orchestrator",
        recordInputs: false,
        recordOutputs: false,
      },
      onFinish: async event => {
        usage.orchestrator = event.totalUsage;
        if (terminalEmitted) return;
        terminalEmitted = true;
        await emitTrace({ type: "answer.completed", label: "Answer ready" });
      },
      onAbort: async () => {
        if (terminalEmitted) return;
        terminalEmitted = true;
        await emitTrace({ type: "request.cancelled", label: "Request cancelled" });
      },
      onError: async ({ error }) => {
        // streamText calls neither onFinish nor onAbort on a non-abort stream
        // error (provider error / error chunk). Without this, terminalEmitted
        // stays false and NO terminal trace is emitted. Aborts are handled by
        // onAbort, so defer to that path if this is an abort.
        if (isAbortError(error)) return;
        // Visitor-safe: never leak the provider error into the public trace.
        console.error("portfolio-agent: orchestrator stream error", error);
        if (terminalEmitted) return;
        terminalEmitted = true;
        await emitTrace({
          type: "answer.failed",
          label: "Answer could not be completed",
        });
      },
    });

    return {
      runId,
      originalMessages: window,
      orchestratorStream: result.toUIMessageStream<PortfolioAgentMessage>(),
      orchestratorModel: orchestratorModelName,
      usage,
    };
    }
  }

  return { runTurn };
}
