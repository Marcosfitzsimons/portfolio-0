const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "..", "app", "api", "chat", "route.ts"),
  "utf8",
);

describe("portfolio agent chat route", () => {
  it("validates and converts UI messages through AI SDK 6", () => {
    assert.match(source, /validateUIMessages/);
    assert.match(source, /convertToModelMessages/);
    assert.doesNotMatch(source, /function convertToMessages/);
  });

  it("uses the persisted runtime and abort-safe stream consumption", () => {
    assert.match(source, /createPortfolioAgentRuntime/);
    assert.match(source, /consumeSseStream:\s*consumeStream/);
    assert.match(source, /originalMessages/);
  });

  it("does not use the old unconditional RAG helper", () => {
    assert.doesNotMatch(source, /findRelevantContent/);
  });
});
