require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  getClientIp,
  getWindow,
  hashRateLimitKey,
} = require("../lib/ai/portfolio-agent/rate-limit.ts");

describe("portfolio agent rate limiting", () => {
  it("uses the first forwarded IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7, 10.0.0.2",
    });
    assert.equal(getClientIp(headers), "203.0.113.7");
  });

  it("creates stable minute windows", () => {
    const date = new Date("2026-06-15T12:34:56.000Z");
    assert.equal(
      getWindow(date, "minute").start.toISOString(),
      "2026-06-15T12:34:00.000Z",
    );
  });

  it("never returns the raw key", () => {
    assert.notEqual(hashRateLimitKey("203.0.113.7", "secret"), "203.0.113.7");
  });
});
