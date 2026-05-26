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

  it("uses a professional redirect for normal out-of-scope requests", () => {
    const decision = getChatScopeDecision("Can you explain JavaScript syntax?");

    assert.equal(decision.allowed, false);
    assert.match(decision.message, /questions about Marcos's experience/i);
    assert.doesNotMatch(decision.message, /portfolio lane/i);
  });

  it("uses a playful redirect for weird out-of-scope requests", () => {
    const decision = getChatScopeDecision(
      "Wtf do something random and give me a pizza spell",
    );

    assert.equal(decision.allowed, false);
    assert.match(decision.message, /portfolio lane/i);
  });

  it("does not allow weird requests just because they say you", () => {
    const decision = getChatScopeDecision("Can you tell me a joke?");

    assert.equal(decision.allowed, false);
    assert.match(decision.message, /portfolio lane/i);
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

  it("includes answer lens, hiring contact, and language behavior", () => {
    const prompt = buildChatSystemPrompt("Project context");

    assert.match(prompt, /Answer Lens/i);
    assert.match(prompt, /AI lens/i);
    assert.match(prompt, /Cloud\/DevOps lens/i);
    assert.match(prompt, /mailto:marcosfitzsimons@gmail\.com/i);
    assert.match(prompt, /Spanish/i);
  });

  it("keeps AI technology claims bounded", () => {
    const prompt = buildChatSystemPrompt("Project context");

    assert.match(prompt, /Do not mention specific model names/i);
    assert.match(prompt, /Do not claim LangChain or Vercel AI SDK were used in Brixa/i);
    assert.match(prompt, /Do not mention RAG/i);
  });
});
