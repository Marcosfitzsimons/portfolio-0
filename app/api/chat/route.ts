import { streamText, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { findRelevantContent } from "@/lib/ai/rag";

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

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Get the last user message for context retrieval
  const lastUserMessage = messages.findLast((m) => m.role === "user");
  const query = lastUserMessage ? getMessageText(lastUserMessage) : "";

  // Skip RAG if query is empty
  if (!query.trim()) {
    return new Response("No query provided", { status: 400 });
  }

  // Find relevant context from knowledge base
  const relevantChunks = await findRelevantContent(query, 3);
  const context = relevantChunks.join("\n\n---\n\n");

  // Convert messages to simple format for streamText
  const convertedMessages = convertToMessages(messages);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a helpful assistant that answers questions about Marcos Fitzsimons as if you were him speaking in first person.
You are only qualified to answer questions related to Marcos Fitzsimons. For questions about other topics, politely explain that you can only answer questions about Marcos Fitzsimons.

Use the following context to answer questions accurately:

<context>
${context}
</context>

Guidelines:
- Be friendly and conversational
- Answer in first person (I, my, me)
- Keep responses concise but informative
- If you don't have specific information in the context, say so honestly
- You can elaborate on topics mentioned in the context with reasonable assumptions`,
    messages: convertedMessages,
  });

  return result.toUIMessageStreamResponse();
}
