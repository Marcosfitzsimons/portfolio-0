require("ts-node/register/transpile-only");

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  evidencePacketSchema,
  routingProfileSchema,
  toConfidenceBand,
} = require("../lib/ai/portfolio-agent/schemas.ts");

describe("portfolio agent schemas", () => {
  it("rejects general mixed with technical lenses", () => {
    assert.equal(
      routingProfileSchema.safeParse({
        scope: "portfolio",
        lenses: ["general", "cloud"],
        complexity: "direct",
        decision: "route",
        confidence: 0.9,
      }).success,
      false,
    );
  });

  it("accepts at most four unique technical lenses", () => {
    const result = routingProfileSchema.parse({
      scope: "portfolio",
      lenses: ["ai", "product", "cloud", "mobile"],
      complexity: "composite",
      decision: "route",
      confidence: 0.92,
    });

    assert.equal(result.lenses.length, 4);
  });

  it("maps raw scores to public confidence bands", () => {
    assert.equal(toConfidenceBand(0.84), "high");
    assert.equal(toConfidenceBand(0.55), "medium");
    assert.equal(toConfidenceBand(0.2), "low");
  });

  it("requires source provenance on verified facts", () => {
    const parsed = evidencePacketSchema.safeParse({
      specialist: "cloud",
      facts: [{ statement: "Uses Terraform", sourceIds: [] }],
      projects: [],
      suggestedEmphasis: [],
      sourceIds: [],
      uncertainties: [],
      conflicts: [],
    });

    assert.equal(parsed.success, false);
  });
});
