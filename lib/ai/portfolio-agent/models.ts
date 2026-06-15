import { createOpenAI } from "@ai-sdk/openai";
import { portfolioAgentConfig } from "./config";

const openai = createOpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export const portfolioAgentModels = {
  classifier: openai(portfolioAgentConfig.models.classifier),
  specialist: openai(portfolioAgentConfig.models.specialist),
  orchestrator: openai(portfolioAgentConfig.models.orchestrator),
  escalatedOrchestrator: openai(
    portfolioAgentConfig.models.escalatedOrchestrator,
  ),
  embedding: openai.embedding(portfolioAgentConfig.models.embedding),
};
