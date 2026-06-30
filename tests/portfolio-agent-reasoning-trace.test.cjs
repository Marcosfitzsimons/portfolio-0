require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  buildRows,
  hasTerminalEvent,
  computeReasonedSeconds,
} = require("../components/portfolio-agent/reasoning-trace-rows.ts");

let seq = 0;
function ev(type, extra = {}) {
  seq += 1;
  return {
    id: `e${seq}`,
    type,
    label: extra.label ?? type,
    timestamp: extra.timestamp ?? "2026-06-29T00:00:00.000Z",
    ...extra,
  };
}

describe("buildRows", () => {
  it("maps a composite multi-specialist turn to ordered rows", () => {
    const rows = buildRows([
      ev("request.received", { label: "Read your question" }),
      ev("classification.completed", { label: "Routed to specialists" }),
      ev("specialist.started", { specialist: "cloud" }),
      ev("specialist.started", { specialist: "ai" }),
      ev("specialist.completed", { specialist: "cloud", durationMs: 1400 }),
      ev("specialist.completed", { specialist: "ai", durationMs: 1700 }),
      ev("synthesis.started", { label: "Composed the answer" }),
      ev("answer.completed"),
    ]);
    const kinds = rows.map((r) => r.kind);
    assert.deepEqual(kinds, ["op", "op", "specialist", "specialist", "op"]);
    const cloud = rows.find((r) => r.kind === "specialist" && r.specialist === "cloud");
    assert.equal(cloud.status, "done");
    assert.equal(cloud.durationMs, 1400);
    // specialists keep first-seen order
    const specs = rows.filter((r) => r.kind === "specialist").map((r) => r.specialist);
    assert.deepEqual(specs, ["cloud", "ai"]);
    // synthesis op is done once a terminal event exists
    assert.equal(rows.at(-1).status, "done");
  });

  it("collapses started+completed for one specialist into a single node", () => {
    const rows = buildRows([
      ev("specialist.started", { specialist: "ai" }),
      ev("specialist.completed", { specialist: "ai", durationMs: 900 }),
    ]);
    const specs = rows.filter((r) => r.kind === "specialist");
    assert.equal(specs.length, 1);
    assert.equal(specs[0].status, "done");
  });

  it("keeps a running specialist running until it completes", () => {
    const rows = buildRows([ev("specialist.started", { specialist: "product" })]);
    assert.equal(rows[0].status, "running");
  });

  it("marks a failed specialist as failed", () => {
    const rows = buildRows([
      ev("specialist.started", { specialist: "mobile" }),
      ev("specialist.failed", { specialist: "mobile", durationMs: 8000 }),
    ]);
    assert.equal(rows[0].status, "failed");
  });

  it("renders a minimal trace for a no-specialist turn", () => {
    const rows = buildRows([
      ev("request.received", { label: "Read your question" }),
      ev("synthesis.started", { label: "Composed the answer" }),
      ev("answer.completed"),
    ]);
    assert.deepEqual(rows.map((r) => r.kind), ["op", "op"]);
  });

  it("adds an amber terminal row for cancellation/failure", () => {
    const rows = buildRows([
      ev("request.received", { label: "Read your question" }),
      ev("request.cancelled", { label: "Cancelled" }),
    ]);
    const terminal = rows.at(-1);
    assert.equal(terminal.kind, "op");
    assert.equal(terminal.status, "failed");
    assert.equal(terminal.label, "Cancelled");
  });
});

describe("hasTerminalEvent", () => {
  it("is true only when a terminal event is present", () => {
    assert.equal(hasTerminalEvent([ev("synthesis.started")]), false);
    assert.equal(hasTerminalEvent([ev("answer.completed")]), true);
    assert.equal(hasTerminalEvent([ev("answer.failed")]), true);
    assert.equal(hasTerminalEvent([ev("request.cancelled")]), true);
  });
});

describe("computeReasonedSeconds", () => {
  it("computes received → terminal elapsed seconds", () => {
    const s = computeReasonedSeconds([
      ev("request.received", { timestamp: "2026-06-29T00:00:00.000Z" }),
      ev("answer.completed", { timestamp: "2026-06-29T00:00:03.500Z" }),
    ]);
    assert.equal(s, 3.5);
  });

  it("returns null when start or terminal is missing", () => {
    assert.equal(computeReasonedSeconds([ev("request.received")]), null);
    assert.equal(computeReasonedSeconds([ev("answer.completed")]), null);
  });
});

const fs = require("node:fs");
const path = require("node:path");

describe("ReasoningTrace component source", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "components", "portfolio-agent", "reasoning-trace.tsx"),
    "utf8",
  );

  it("exports ReasoningTrace and consumes the pure rows module", () => {
    assert.match(source, /export function ReasoningTrace/);
    assert.match(source, /from "\.\/reasoning-trace-rows"/);
    assert.match(source, /buildRows/);
  });

  it("respects reduced motion", () => {
    assert.match(source, /reducedMotion/);
  });

  it("does not use the no-op Tailwind size-* utility (Tailwind 3.3.3)", () => {
    assert.doesNotMatch(source, /className="[^"]*\bsize-/);
  });
});
