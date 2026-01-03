import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import fs from "fs";
import path from "path";

// Configure OpenAI with custom env var name
const openai = createOpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const embeddingModel = openai.embedding("text-embedding-3-small");

// In-memory cache for embeddings
let embeddingsCache: { content: string; embedding: number[] }[] | null = null;

/**
 * Chunks markdown content by sections (headers) and paragraphs
 */
function chunkMarkdown(content: string): string[] {
  const chunks: string[] = [];
  const sections = content.split(/(?=^##?\s)/m);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // If section is small enough, keep it as one chunk
    if (trimmed.length < 500) {
      chunks.push(trimmed);
    } else {
      // Split larger sections by paragraphs
      const paragraphs = trimmed.split(/\n\n+/);
      let currentChunk = "";

      for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length < 500) {
          currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = paragraph;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    }
  }

  return chunks.filter((chunk) => chunk.length > 20);
}

/**
 * Calculates cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Loads and chunks the knowledge base markdown file
 */
function loadKnowledgeBase(): string[] {
  const knowledgePath = path.join(process.cwd(), "lib/ai/knowledge.md");
  const content = fs.readFileSync(knowledgePath, "utf-8");
  return chunkMarkdown(content);
}

/**
 * Generates embeddings for all chunks (cached in memory)
 */
async function getEmbeddings(): Promise<
  { content: string; embedding: number[] }[]
> {
  if (embeddingsCache) {
    return embeddingsCache;
  }

  const chunks = loadKnowledgeBase();

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });

  embeddingsCache = chunks.map((content, i) => ({
    content,
    embedding: embeddings[i],
  }));

  return embeddingsCache;
}

/**
 * Finds the most relevant content chunks for a given query
 */
export async function findRelevantContent(
  query: string,
  topK: number = 3,
): Promise<string[]> {
  // Validate query is not empty
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error("Query cannot be empty");
  }

  const [queryEmbedding, knowledgeEmbeddings] = await Promise.all([
    embed({ model: embeddingModel, value: trimmedQuery }),
    getEmbeddings(),
  ]);

  const similarities = knowledgeEmbeddings.map((item) => ({
    content: item.content,
    similarity: cosineSimilarity(queryEmbedding.embedding, item.embedding),
  }));

  // Sort by similarity (descending) and take top K
  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, topK).map((item) => item.content);
}

/**
 * Clears the embeddings cache (useful for development)
 */
export function clearEmbeddingsCache(): void {
  embeddingsCache = null;
}
