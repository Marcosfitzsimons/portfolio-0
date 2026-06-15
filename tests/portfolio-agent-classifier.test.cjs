require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  getActiveLens,
  getRoutingMode,
  safeAbstentionProfile,
} = require("../lib/ai/portfolio-agent/classifier.ts");
const {
  routingCases,
} = require("./fixtures/portfolio-agent-routing-cases.ts");

describe("portfolio classifier", () => {
  it("contains approximately twenty labeled smoke cases", () => {
    assert.ok(routingCases.length >= 20);
  });

  it("routes high-confidence technical lenses deterministically", () => {
    assert.equal(
      getRoutingMode({
        scope: "portfolio",
        lenses: ["cloud"],
        complexity: "direct",
        decision: "route",
        confidence: 0.91,
      }),
      "deterministic",
    );
  });

  it("gives abstentions to the orchestrator", () => {
    assert.equal(getRoutingMode(safeAbstentionProfile), "orchestrator");
  });

  it("recovers the last single technical lens from trace history", () => {
    assert.equal(
      getActiveLens([
        {
          id: "assistant-1",
          role: "assistant",
          parts: [
            {
              type: "data-trace",
              data: {
                id: "trace-1",
                type: "classification.completed",
                label: "Cloud request",
                timestamp: "2026-06-15T12:00:00.000Z",
                lenses: ["cloud"],
                complexity: "direct",
                confidenceBand: "high",
                routingMode: "deterministic",
              },
            },
          ],
        },
      ]),
      "cloud",
    );
  });
});
