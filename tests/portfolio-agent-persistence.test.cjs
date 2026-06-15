require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  buildConversationWindow,
  getRetentionExpiry,
} = require("../lib/ai/portfolio-agent/persistence.ts");

const message = (id, role) => ({
  id,
  role,
  parts: [{ type: "text", text: id }],
});

describe("portfolio agent persistence", () => {
  it("keeps seven previous messages plus the current user message", () => {
    const prior = Array.from({ length: 12 }, (_, index) =>
      message(`m-${index}`, index % 2 === 0 ? "user" : "assistant"),
    );
    const current = message("current", "user");

    const result = buildConversationWindow(prior, current, 8);

    assert.equal(result.length, 8);
    assert.equal(result[0].id, "m-5");
    assert.equal(result.at(-1).id, "current");
  });

  it("sets expiry exactly ninety days from the supplied time", () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    assert.equal(
      getRetentionExpiry(now, 90).toISOString(),
      "2026-09-13T12:00:00.000Z",
    );
  });
});
