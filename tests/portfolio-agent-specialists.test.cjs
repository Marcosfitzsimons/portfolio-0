require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  createDelegationBudget,
  runSpecialist,
} = require("../lib/ai/portfolio-agent/specialists.ts");

const { MockLanguageModelV3 } = require("ai/test");

describe("Specialist delegation", () => {
  it("allows every Specialist once", () => {
    const budget = createDelegationBudget();
    for (const specialist of ["ai", "product", "cloud", "mobile"]) {
      assert.equal(budget.claim(specialist), true);
      assert.equal(budget.claim(specialist), false);
    }
  });

  it("reports claimed Specialists", () => {
    const budget = createDelegationBudget();
    budget.claim("ai");
    budget.claim("cloud");
    assert.deepEqual(budget.claimed(), ["ai", "cloud"]);
  });
});

describe("runSpecialist (mocked)", () => {
  it("returns a valid EvidencePacket from structured output", async () => {
    const mockOutput = {
      specialist: "cloud",
      facts: [
        {
          statement: "Marcos configured AWS and Terraform environments.",
          sourceIds: ["knowledge:claimence-infrastructure"],
        },
      ],
      projects: [],
      suggestedEmphasis: ["Lead with Claimence."],
      sourceIds: ["knowledge:claimence-infrastructure"],
      uncertainties: [],
      conflicts: [],
    };

    const mockModel = new MockLanguageModelV3({
      doGenerate: async () => ({
        content: [{ type: "text", text: JSON.stringify(mockOutput) }],
        finishReason: { unified: "stop", raw: undefined },
        usage: {
          inputTokens: {
            total: 10,
            noCache: 10,
            cacheRead: undefined,
            cacheWrite: undefined,
          },
          outputTokens: {
            total: 20,
            text: 20,
            reasoning: undefined,
          },
        },
        warnings: [],
      }),
    });

    const evidence = {
      projects: [],
      knowledge: [],
      sources: [],
      conflicts: [],
    };

    const packet = await runSpecialist({
      specialist: "cloud",
      query: "What cloud infrastructure has Marcos worked on?",
      evidence,
      model: mockModel,
    });

    assert.equal(packet.specialist, "cloud");
    assert.ok(
      packet.facts[0].sourceIds.includes("knowledge:claimence-infrastructure"),
      "sourceIds should include knowledge:claimence-infrastructure",
    );
  });
});
