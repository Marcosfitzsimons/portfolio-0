import { embed, embedMany } from "ai";
import type { Project } from "@prisma/client";
import prisma from "@/prisma/client";
import { portfolioAgentModels } from "./models";
import { knowledgeRecords, type KnowledgeRecord } from "./knowledge";
import type { Specialist } from "./schemas";

export type EvidenceSource = {
  id: string;
  publicLabel: string;
  owner: "prisma" | "knowledge";
  content: string;
};

export type RetrievedEvidence = {
  projects: Project[];
  knowledge: KnowledgeRecord[];
  sources: EvidenceSource[];
  conflicts: Array<{ field: string; sourceIds: string[] }>;
};

const LENS_TAGS: Record<Specialist, string[]> = {
  ai: ["ai", "agent", "openai", "automation", "prompt"],
  product: ["fullstack", "full-stack", "react", "next.js", "node.js", "product"],
  cloud: ["aws", "terraform", "devops", "docker", "digitalocean", "ci/cd"],
  mobile: ["mobile", "react native"],
};

let knowledgeEmbeddingCache:
  | Array<{ record: KnowledgeRecord; embedding: number[] }>
  | null = null;

export function detectNamedProject<T extends Pick<Project, "title">>(
  query: string,
  projects: T[],
): T | undefined {
  const normalized = query.toLowerCase();
  return projects.find(project =>
    normalized.includes(project.title.toLowerCase()),
  );
}

export function rankProjects(projects: Project[], lenses: Specialist[]): Project[] {
  const tags = new Set(lenses.flatMap(lens => LENS_TAGS[lens]));
  return [...projects].sort((left, right) => {
    const score = (project: Project) =>
      project.tags.reduce(
        (total, tag) => total + (tags.has(tag.toLowerCase()) ? 1 : 0),
        0,
      );
    return (
      score(right) - score(left) ||
      left.showcaseOrder - right.showcaseOrder ||
      left.id - right.id
    );
  });
}

export function quarantineConflicts(
  candidates: Array<{
    key: string;
    owner: "prisma" | "knowledge";
    value: string;
    sourceId: string;
  }>,
) {
  const grouped = new Map<string, typeof candidates>();
  for (const candidate of candidates) {
    const groupKey = `${candidate.owner}:${candidate.key}`;
    grouped.set(groupKey, [...(grouped.get(groupKey) ?? []), candidate]);
  }
  const facts: Array<{ key: string; owner: "prisma" | "knowledge"; value: string; sourceId: string }> = [];
  const conflicts: Array<{ field: string; sourceIds: string[] }> = [];

  for (const entries of Array.from(grouped.values())) {
    const values = new Set(entries.map(entry => entry.value));
    if (values.size > 1) {
      conflicts.push({
        field: entries[0].key,
        sourceIds: entries.map(entry => entry.sourceId),
      });
    } else {
      facts.push(entries[0]);
    }
  }

  return { facts, conflicts };
}

async function getKnowledgeEmbeddings() {
  if (knowledgeEmbeddingCache) return knowledgeEmbeddingCache;
  const { embeddings } = await embedMany({
    model: portfolioAgentModels.embedding,
    values: knowledgeRecords.map(record => record.content),
  });
  knowledgeEmbeddingCache = knowledgeRecords.map((record, index) => ({
    record,
    embedding: embeddings[index],
  }));
  return knowledgeEmbeddingCache;
}

function cosineSimilarity(left: number[], right: number[]): number {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export async function retrieveEvidence({
  query,
  lenses,
  abortSignal,
  projectLimit = 4,
  knowledgeLimit = 6,
}: {
  query: string;
  lenses: Specialist[];
  abortSignal?: AbortSignal;
  projectLimit?: number;
  knowledgeLimit?: number;
}): Promise<RetrievedEvidence> {
  if (abortSignal?.aborted) throw new DOMException("Aborted", "AbortError");

  const projects = await prisma.project.findMany({
    orderBy: [{ showcaseOrder: "asc" }, { id: "asc" }],
  });
  const namedProject = detectNamedProject(query, projects);
  const selectedProjects = namedProject
    ? [namedProject]
    : rankProjects(projects, lenses).slice(0, projectLimit);

  const scopedRecords = knowledgeRecords.filter(record => {
    if (namedProject && record.project) {
      return record.project.toLowerCase() === namedProject.title.toLowerCase();
    }
    return record.lenses.some(lens => lenses.includes(lens));
  });

  const queryEmbedding = await embed({
    model: portfolioAgentModels.embedding,
    value: query,
    abortSignal,
  });
  const cached = await getKnowledgeEmbeddings();
  const allowedIds = new Set(scopedRecords.map(record => record.id));
  const selectedKnowledge = cached
    .filter(item => allowedIds.has(item.record.id))
    .map(item => ({
      record: item.record,
      similarity: cosineSimilarity(queryEmbedding.embedding, item.embedding),
    }))
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, knowledgeLimit)
    .map(item => item.record);

  const sources: EvidenceSource[] = [
    ...selectedProjects.map(project => ({
      id: `project:${project.id}`,
      publicLabel: `${project.title} project record`,
      owner: "prisma" as const,
      content: JSON.stringify({
        title: project.title,
        description: project.description,
        stack: project.stack,
        siteUrl: project.siteUrl,
        tags: project.tags,
        status: project.status,
        year: project.year,
        showcaseOrder: project.showcaseOrder,
      }),
    })),
    ...selectedKnowledge.map(record => ({
      id: `knowledge:${record.id}`,
      publicLabel: record.publicLabel,
      owner: "knowledge" as const,
      content: record.content,
    })),
  ];

  return {
    projects: selectedProjects,
    knowledge: selectedKnowledge,
    sources,
    conflicts: [],
  };
}

export function clearEvidenceEmbeddingCache(): void {
  knowledgeEmbeddingCache = null;
}
