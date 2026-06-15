require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  createPortfolioAgentRuntime,
} = require("../lib/ai/portfolio-agent/runtime.ts");

const { MockLanguageModelV3 } = require("ai/test");
const { simulateReadableStream } = require("ai");

// --- Helpers -------------------------------------------------------------

function userMessage(text) {
  return { id: "msg-1", role: "user", parts: [{ type: "text", text }] };
}

function mockOrchestratorModel() {
  return new MockLanguageModelV3({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "text-1" },
          { type: "text-delta", id: "text-1", delta: "Answer." },
          { type: "text-end", id: "text-1" },
          {
            type: "finish",
            finishReason: { unified: "stop", raw: undefined },
            logprobs: undefined,
            usage: {
              inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 5, text: 5, reasoning: undefined },
            },
          },
        ],
      }),
    }),
  });
}

function evidencePacket(specialist) {
  return {
    specialist,
    facts: [
      {
        statement: `Marcos has ${specialist} experience.`,
        sourceIds: [`knowledge:${specialist}-1`],
      },
    ],
    projects: [],
    suggestedEmphasis: [],
    sourceIds: [`knowledge:${specialist}-1`],
    uncertainties: [],
    conflicts: [],
  };
}

function profile(overrides) {
  return {
    scope: "portfolio",
    lenses: ["product"],
    complexity: "direct",
    decision: "route",
    confidence: 0.9,
    ...overrides,
  };
}

// Capture every trace part the runtime writes to the stream writer.
function makeHarness(extraDeps = {}) {
  const traceTypes = [];
  const writer = {
    write(part) {
      if (part && part.type === "data-trace") {
        traceTypes.push(part.data.type);
      }
    },
    merge() {},
    onError: () => "",
  };

  const calls = {
    classify: 0,
    retrieveAndRunSpecialist: [],
    retrieveEvidence: 0,
    saveRoutingProfile: 0,
    startSpecialistRun: [],
    finishSpecialistRun: [],
    getGuardrail: 0,
  };

  const deps = {
    saveRoutingProfile: async () => {
      calls.saveRoutingProfile += 1;
    },
    startSpecialistRun: async ({ specialist }) => {
      calls.startSpecialistRun.push(specialist);
    },
    finishSpecialistRun: async (input) => {
      calls.finishSpecialistRun.push(input);
    },
    appendTraceEvent: async () => {},
    getGuardrailMessage: () => {
      calls.getGuardrail += 1;
      return "GUARDRAIL";
    },
    retrieveEvidence: async () => {
      calls.retrieveEvidence += 1;
      return { projects: [], knowledge: [], sources: [], conflicts: [] };
    },
    retrieveAndRunSpecialist: async ({ specialist }) => {
      calls.retrieveAndRunSpecialist.push(specialist);
      return { evidence: { projects: [], knowledge: [], sources: [], conflicts: [] }, packet: evidencePacket(specialist) };
    },
    orchestratorModel: mockOrchestratorModel(),
    escalatedOrchestratorModel: mockOrchestratorModel(),
    orchestratorModelName: "mock-orchestrator",
    escalatedOrchestratorModelName: "mock-escalated",
    now: () => new Date("2026-06-15T00:00:00.000Z"),
    generateId: (() => {
      let n = 0;
      return () => `id-${++n}`;
    })(),
    ...extraDeps,
  };

  return { writer, deps, calls, traceTypes };
}

async function drain(stream) {
  if (!stream) return;
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
}

function baseInput(text = "Tell me about your work", signal) {
  const controller = new AbortController();
  return {
    input: {
      runId: "run-1",
      conversationId: "conv-1",
      currentMessage: userMessage(text),
      previousMessages: [],
      modelMessages: [{ role: "user", content: text }],
      requestHeaders: new Headers(),
      abortSignal: signal ?? controller.signal,
      writer: null, // filled in by caller
    },
    controller,
  };
}

// --- Tests ---------------------------------------------------------------

describe("portfolio agent runtime", () => {
  it("out-of-scope returns a redirect without Specialist calls", async () => {
    const { writer, deps, calls } = makeHarness({
      classify: async () => profile({ scope: "out_of_scope", lenses: ["general"], decision: "route" }),
    });
    const runtime = createPortfolioAgentRuntime(deps);
    const { input } = baseInput("write me a poem");
    input.writer = writer;

    const result = await runtime.runTurn(input);

    assert.equal(result.directText, "GUARDRAIL");
    assert.equal(result.orchestratorStream, undefined);
    assert.equal(calls.getGuardrail, 1);
    assert.equal(calls.retrieveAndRunSpecialist.length, 0);
    assert.equal(calls.retrieveEvidence, 0);
  });

  it("high-confidence cloud invokes only Cloud Specialist", async () => {
    const { writer, deps, calls } = makeHarness({
      classify: async () => profile({ lenses: ["cloud"], confidence: 0.9 }),
    });
    const runtime = createPortfolioAgentRuntime(deps);
    const { input } = baseInput("Tell me about your AWS work");
    input.writer = writer;

    const result = await runtime.runTurn(input);
    await drain(result.orchestratorStream);

    assert.deepEqual(calls.retrieveAndRunSpecialist, ["cloud"]);
  });

  it("high-confidence AI plus cloud runs both Specialists concurrently", async () => {
    const startOrder = [];
    const deferred = {};
    const makeDeferred = (key) => {
      let resolve;
      const promise = new Promise((r) => {
        resolve = r;
      });
      deferred[key] = { promise, resolve };
      return promise;
    };

    let bothStarted;
    const bothStartedPromise = new Promise((resolve) => {
      bothStarted = resolve;
    });

    const { writer, deps, calls } = makeHarness({
      classify: async () =>
        profile({ lenses: ["ai", "cloud"], complexity: "composite", confidence: 0.95 }),
      retrieveAndRunSpecialist: async ({ specialist }) => {
        startOrder.push(specialist);
        if (startOrder.length === 2) bothStarted();
        await makeDeferred(specialist);
        return { evidence: { projects: [], knowledge: [], sources: [], conflicts: [] }, packet: evidencePacket(specialist) };
      },
    });
    const runtime = createPortfolioAgentRuntime(deps);
    const { input } = baseInput("AI and cloud work");
    input.writer = writer;

    const turnPromise = runtime.runTurn(input);

    // Both specialists must START before either resolves. Wait until both have
    // entered the runner without resolving their deferred work.
    await bothStartedPromise;
    assert.deepEqual([...startOrder].sort(), ["ai", "cloud"]);

    deferred.ai.resolve();
    deferred.cloud.resolve();

    const result = await turnPromise;
    await drain(result.orchestratorStream);

    assert.deepEqual([...startOrder].sort(), ["ai", "cloud"]);
  });

  it("unknown lets Orchestrator tools choose a Specialist", async () => {
    let toolsSeen;
    const orchestratorModel = new MockLanguageModelV3({
      doStream: async ({ tools }) => {
        toolsSeen = tools;
        return {
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "t" },
              { type: "text-delta", id: "t", delta: "ok" },
              { type: "text-end", id: "t" },
              {
                type: "finish",
                finishReason: { unified: "stop", raw: undefined },
                logprobs: undefined,
                usage: {
                  inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
                  outputTokens: { total: 1, text: 1, reasoning: undefined },
                },
              },
            ],
          }),
        };
      },
    });

    const { writer, deps } = makeHarness({
      classify: async () => profile({ lenses: ["unknown"], decision: "abstain", confidence: 0 }),
      orchestratorModel,
      escalatedOrchestratorModel: orchestratorModel,
    });
    const runtime = createPortfolioAgentRuntime(deps);
    const { input } = baseInput("something ambiguous");
    input.writer = writer;

    const result = await runtime.runTurn(input);
    await drain(result.orchestratorStream);

    assert.ok(Array.isArray(toolsSeen) && toolsSeen.length === 4, "orchestrator received 4 specialist tools");
  });

  it("a failed Specialist preserves successful evidence", async () => {
    let receivedSystem;
    const orchestratorModel = new MockLanguageModelV3({
      doStream: async ({ prompt }) => {
        // prompt[0] is the system message
        receivedSystem = prompt.find((p) => p.role === "system");
        return {
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "t" },
              { type: "text-delta", id: "t", delta: "ok" },
              { type: "text-end", id: "t" },
              {
                type: "finish",
                finishReason: { unified: "stop", raw: undefined },
                logprobs: undefined,
                usage: {
                  inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
                  outputTokens: { total: 1, text: 1, reasoning: undefined },
                },
              },
            ],
          }),
        };
      },
    });

    const { writer, deps, traceTypes } = makeHarness({
      classify: async () =>
        profile({ lenses: ["ai", "cloud"], complexity: "composite", confidence: 0.95 }),
      retrieveAndRunSpecialist: async ({ specialist }) => {
        if (specialist === "cloud") throw new Error("boom");
        return { evidence: { projects: [], knowledge: [], sources: [], conflicts: [] }, packet: evidencePacket(specialist) };
      },
      orchestratorModel,
      escalatedOrchestratorModel: orchestratorModel,
    });
    const runtime = createPortfolioAgentRuntime(deps);
    const { input } = baseInput("ai and cloud");
    input.writer = writer;

    const result = await runtime.runTurn(input);
    await drain(result.orchestratorStream);

    assert.ok(traceTypes.includes("specialist.failed"), "specialist.failed trace emitted");
    const systemText = receivedSystem.content;
    assert.ok(systemText.includes('"specialist":"ai"'), "successful ai packet reached orchestrator");
    assert.ok(!systemText.includes('"specialist":"cloud"'), "failed cloud packet excluded");
  });

  it("each Specialist can run only once", async () => {
    const { createDelegationBudget, createSpecialistTools } = require("../lib/ai/portfolio-agent/specialists.ts");
    const budget = createDelegationBudget();
    let invokeCount = 0;
    const tools = createSpecialistTools({
      budget,
      invoke: async (specialist) => {
        invokeCount += 1;
        return evidencePacket(specialist);
      },
    });

    await tools.consultCloudSpecialist.execute({ question: "q" });
    await assert.rejects(
      () => tools.consultCloudSpecialist.execute({ question: "q again" }),
      /already used/,
    );
    assert.equal(invokeCount, 1);
  });

  it("abort propagates and emits request.cancelled", async () => {
    const controller = new AbortController();

    const orchestratorModel = new MockLanguageModelV3({
      doStream: async () => ({
        stream: simulateReadableStream({
          initialDelayInMs: 5,
          chunkDelayInMs: 5,
          chunks: [
            { type: "text-start", id: "t" },
            { type: "text-delta", id: "t", delta: "partial" },
            { type: "text-end", id: "t" },
            {
              type: "finish",
              finishReason: { unified: "stop", raw: undefined },
              logprobs: undefined,
              usage: {
                inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
                outputTokens: { total: 1, text: 1, reasoning: undefined },
              },
            },
          ],
        }),
      }),
    });

    const { writer, deps, traceTypes } = makeHarness({
      classify: async () => profile({ lenses: ["product"], confidence: 0.9 }),
      orchestratorModel,
    });
    const runtime = createPortfolioAgentRuntime(deps);
    const { input } = baseInput("Tell me about your work", controller.signal);
    input.writer = writer;

    const result = await runtime.runTurn(input);
    // Abort while the stream is in flight.
    controller.abort(new DOMException("Aborted", "AbortError"));
    await drain(result.orchestratorStream).catch(() => {});

    assert.ok(traceTypes.includes("request.cancelled"), "request.cancelled emitted");
    const terminals = traceTypes.filter(
      (t) => t === "answer.completed" || t === "request.cancelled",
    );
    assert.equal(terminals.length, 1, "exactly one terminal event");
    assert.equal(terminals[0], "request.cancelled");
  });

  it("trace order starts with request.received and ends with answer.completed", async () => {
    const { writer, deps, traceTypes } = makeHarness({
      classify: async () => profile({ lenses: ["product"], confidence: 0.9 }),
    });
    const runtime = createPortfolioAgentRuntime(deps);
    const { input } = baseInput("Tell me about your work");
    input.writer = writer;

    const result = await runtime.runTurn(input);
    await drain(result.orchestratorStream);

    assert.equal(traceTypes[0], "request.received");
    assert.equal(traceTypes[traceTypes.length - 1], "answer.completed");
  });
});
