require("ts-node/register/transpile-only");

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  getGuardrailMessage,
  professionalRedirectMessage,
  playfulRedirectMessage,
  portfolioAnswerPolicy,
  chatScopeRedirectMessage,
} = require("../lib/ai/chat-policy.ts");

describe("chat policy", () => {
  it("getGuardrailMessage returns professional redirect for normal out-of-scope requests", () => {
    const message = getGuardrailMessage("How do I cook pasta?");

    assert.equal(message, professionalRedirectMessage);
    assert.match(message, /questions about Marcos's experience/i);
    assert.doesNotMatch(message, /portfolio lane/i);
  });

  it("getGuardrailMessage returns playful redirect for weird out-of-scope requests", () => {
    const message = getGuardrailMessage("tell me a joke");

    assert.equal(message, playfulRedirectMessage);
    assert.match(message, /portfolio lane/i);
  });

  it("professionalRedirectMessage and playfulRedirectMessage are non-empty and distinct", () => {
    assert.ok(professionalRedirectMessage.length > 0);
    assert.ok(playfulRedirectMessage.length > 0);
    assert.notEqual(professionalRedirectMessage, playfulRedirectMessage);
  });

  it("chatScopeRedirectMessage equals professionalRedirectMessage", () => {
    assert.equal(chatScopeRedirectMessage, professionalRedirectMessage);
  });

  it("portfolioAnswerPolicy contains key grounding and contact constraints", () => {
    assert.match(portfolioAnswerPolicy, /marcosfitzsimons@gmail\.com/i);
    assert.match(portfolioAnswerPolicy, /compensation depends/i);
    assert.match(portfolioAnswerPolicy, /hotel operations/i);
    assert.match(portfolioAnswerPolicy, /Answer in the user's language/i);
  });

  it("portfolioAnswerPolicy contains AI technology boundaries", () => {
    assert.match(portfolioAnswerPolicy, /Do not mention specific model names/i);
    assert.match(portfolioAnswerPolicy, /Do not claim LangChain or Vercel AI SDK were used in Brixa/i);
    assert.match(portfolioAnswerPolicy, /Do not mention RAG/i);
  });

  it("portfolioAnswerPolicy contains answer lens guidance", () => {
    assert.match(portfolioAnswerPolicy, /Answer Lens/i);
    assert.match(portfolioAnswerPolicy, /AI lens/i);
    assert.match(portfolioAnswerPolicy, /Cloud\/DevOps lens/i);
  });
});
