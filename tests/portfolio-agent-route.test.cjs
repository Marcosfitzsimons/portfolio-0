const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "..", "app", "api", "chat", "route.ts"),
  "utf8",
);

const runtimeSource = fs.readFileSync(
  path.join(__dirname, "..", "lib", "ai", "portfolio-agent", "runtime.ts"),
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

  it("opens the assistant message with `start` before the runtime writes traces", () => {
    // Prevents the duplicate empty-bubble bug: data-trace parts must not stream
    // ahead of the message `start` boundary. The explicit start must precede
    // the runtime.runTurn call inside execute.
    const startIndex = source.search(/writer\.write\(\{\s*type:\s*"start"\s*\}\)/);
    const runTurnIndex = source.search(/runtime\.runTurn\(/);
    assert.ok(startIndex !== -1, "route writes an explicit `start` chunk");
    assert.ok(runTurnIndex !== -1, "route delegates to runtime.runTurn");
    assert.ok(
      startIndex < runTurnIndex,
      "`start` must be written before runtime.runTurn writes trace parts",
    );
  });

  it("merges the orchestrator stream with sendStart:false", () => {
    // Belt-and-suspenders for the duplicate bubble: the merged orchestrator
    // stream must not open a second message boundary.
    assert.match(
      runtimeSource,
      /toUIMessageStream<PortfolioAgentMessage>\(\{\s*sendStart:\s*false/,
    );
  });
});
