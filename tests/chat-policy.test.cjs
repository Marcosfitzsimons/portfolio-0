require("ts-node/register/transpile-only");

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  buildChatSystemPrompt,
  getChatScopeDecision,
} = require("../lib/ai/chat-policy.ts");

describe("chat policy", () => {
  it("blocks generic programming tutorial requests", () => {
    const decision = getChatScopeDecision(
      "Wtf do something. Like give me a basic example of javascript syntax.",
    );

    assert.equal(decision.allowed, false);
  });

  it("allows questions about Marcos's projects", () => {
    const decision = getChatScopeDecision("What projects have you built?");

    assert.equal(decision.allowed, true);
  });

  it("requires project answers to stay grounded in portfolio context", () => {
    const prompt = buildChatSystemPrompt("Project context");

    assert.match(prompt, /Do not mention machine learning/i);
    assert.match(prompt, /Only use facts present in the context/i);
  });
});
