import { z } from "zod";
import type { UIMessage } from "ai";

export const specialistSchema = z.enum(["ai", "product", "cloud", "mobile"]);
export const technicalLensSchema = specialistSchema;
export const answerLensSchema = z.enum([
  "general",
  "ai",
  "product",
  "cloud",
  "mobile",
  "unknown",
]);

export const routingProfileSchema = z
  .object({
    scope: z.enum(["portfolio", "out_of_scope"]),
    lenses: z.array(answerLensSchema).min(1).max(4),
    complexity: z.enum(["direct", "composite"]),
    decision: z.enum(["route", "abstain"]),
    confidence: z.number().min(0).max(1),
  })
  .superRefine((value, context) => {
    const unique = new Set(value.lenses);
    if (unique.size !== value.lenses.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Routing lenses must be unique",
        path: ["lenses"],
      });
    }

    const hasGeneral = unique.has("general");
    const hasUnknown = unique.has("unknown");
    if ((hasGeneral || hasUnknown) && unique.size > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "general and unknown must be exclusive",
        path: ["lenses"],
      });
    }

    if (value.scope === "out_of_scope" && value.decision !== "route") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Out-of-scope classification is a terminal route",
        path: ["decision"],
      });
    }
  });

export type RoutingProfile = z.infer<typeof routingProfileSchema>;
export type Specialist = z.infer<typeof specialistSchema>;

export const confidenceBandSchema = z.enum(["low", "medium", "high"]);
export type ConfidenceBand = z.infer<typeof confidenceBandSchema>;

export function toConfidenceBand(score: number): ConfidenceBand {
  if (score >= 0.8) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

export const verifiedFactSchema = z.object({
  statement: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
});

export const projectReferenceSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1),
  relevance: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
});

export const evidenceConflictSchema = z.object({
  field: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(2),
});

export const evidencePacketSchema = z.object({
  specialist: specialistSchema,
  facts: z.array(verifiedFactSchema),
  projects: z.array(projectReferenceSchema),
  suggestedEmphasis: z.array(z.string().min(1)),
  sourceIds: z.array(z.string().min(1)),
  uncertainties: z.array(z.string().min(1)),
  conflicts: z.array(evidenceConflictSchema),
});

export type EvidencePacket = z.infer<typeof evidencePacketSchema>;

export const publicTraceEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "request.received",
    "classification.completed",
    "specialist.started",
    "specialist.completed",
    "specialist.failed",
    "synthesis.started",
    "answer.completed",
    "request.cancelled",
  ]),
  label: z.string().min(1),
  timestamp: z.string().datetime(),
  specialist: specialistSchema.optional(),
  lenses: z.array(answerLensSchema).optional(),
  complexity: z.enum(["direct", "composite"]).optional(),
  confidenceBand: confidenceBandSchema.optional(),
  routingMode: z.enum(["deterministic", "orchestrator"]).optional(),
  durationMs: z.number().int().nonnegative().optional(),
  sourceLabels: z.array(z.string().min(1)).optional(),
});

export type PublicTraceEvent = z.infer<typeof publicTraceEventSchema>;

export type PortfolioAgentDataParts = {
  trace: PublicTraceEvent;
};

export type PortfolioAgentMessage = UIMessage<
  never,
  PortfolioAgentDataParts
>;

export const chatRequestSchema = z.object({
  id: z.string().min(8).max(128),
  message: z.object({
    id: z.string().min(1),
    role: z.literal("user"),
    parts: z.array(z.unknown()).min(1),
  }),
});
