require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  createTracePublisher,
} = require("../lib/ai/portfolio-agent/trace.ts");

describe("trace publisher", () => {
  it("writes public trace events and persists sequence order", async () => {
    const written = [];
    const persisted = [];
    const publish = createTracePublisher({
      runId: "run-1",
      write: part => written.push(part),
      persist: input => {
        persisted.push(input);
        return Promise.resolve();
      },
      now: () => new Date("2026-06-15T12:00:00.000Z"),
      id: () => `trace-${written.length + 1}`,
    });

    await publish({
      type: "request.received",
      label: "Understanding request",
    });
    await publish({
      type: "synthesis.started",
      label: "Preparing answer",
    });

    assert.deepEqual(
      written.map(part => part.type),
      ["data-trace", "data-trace"],
    );
    assert.deepEqual(
      persisted.map(item => item.sequence),
      [1, 2],
    );
  });
});
