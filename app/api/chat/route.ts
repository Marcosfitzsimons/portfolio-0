import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { findRelevantContent } from "@/lib/ai/rag";
import {
  buildChatSystemPrompt,
  getChatScopeDecision,
} from "@/lib/ai/chat-policy";

// Configure OpenAI with custom env var name
const openai = createOpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Helper to extract text from UIMessage parts
function getMessageText(message: UIMessage): string {
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("");
  }
  return "";
}

// Convert UIMessage to simple message format for streamText
function convertToMessages(messages: UIMessage[]): Message[] {
  return messages.map((message) => ({
    role: message.role as "user" | "assistant",
    content: getMessageText(message),
  }));
}

function createGuardrailResponse(message: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = "scope-guardrail";
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: message });
      writer.write({ type: "text-end", id });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Get the last user message for context retrieval
  const lastUserMessage = messages.findLast((m) => m.role === "user");
  const query = lastUserMessage ? getMessageText(lastUserMessage) : "";

  // Skip RAG if query is empty
  if (!query.trim()) {
    return new Response("No query provided", { status: 400 });
  }

  const scopeDecision = getChatScopeDecision(query);
  if (!scopeDecision.allowed) {
    return createGuardrailResponse(scopeDecision.message ?? "");
  }

  // Find relevant context from knowledge base
  const relevantChunks = await findRelevantContent(query, 3);
  const context = relevantChunks.join("\n\n---\n\n");

  // Convert messages to simple format for streamText
  const convertedMessages = convertToMessages(messages);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: buildChatSystemPrompt(context),
    messages: convertedMessages,
  });

  return result.toUIMessageStreamResponse();
}
