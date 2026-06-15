import {
  generateText,
  Output,
  tool,
  type LanguageModel,
} from "ai";
import { z } from "zod";
import { retrieveEvidence, type RetrievedEvidence } from "./evidence";
import { portfolioAgentModels } from "./models";
import {
  evidencePacketSchema,
  type EvidencePacket,
  type Specialist,
} from "./schemas";

const SPECIALIST_DESCRIPTIONS: Record<Specialist, string> = {
  ai: "Select grounded evidence about production AI agents, tool-using workflows, prompt-driven automation, and OpenAI integrations.",
  product: "Select grounded evidence about full-stack product ownership, frontend, backend, architecture, and shipped products.",
  cloud: "Select grounded evidence about AWS, Terraform, Docker, DigitalOcean, CI/CD, deployments, and DevOps.",
  mobile: "Select grounded evidence about React Native and mobile product delivery.",
};

export function createDelegationBudget() {
  const used = new Set<Specialist>();
  return {
    claim(specialist: Specialist): boolean {
      if (used.has(specialist)) return false;
      used.add(specialist);
      return true;
    },
    claimed(): Specialist[] {
      return [...used];
    },
  };
}

function evidencePrompt(evidence: RetrievedEvidence): string {
  return evidence.sources
    .map(source => `<source id="${source.id}">${source.content}</source>`)
    .join("\n");
}

export async function runSpecialist({
  specialist,
  query,
  evidence,
  abortSignal,
  model = portfolioAgentModels.specialist,
  onUsage,
}: {
  specialist: Specialist;
  query: string;
  evidence: RetrievedEvidence;
  abortSignal?: AbortSignal;
  model?: LanguageModel;
  onUsage?: (usage: unknown) => void;
}): Promise<EvidencePacket> {
  const { output, totalUsage } = await generateText({
    model,
    output: Output.object({ schema: evidencePacketSchema }),
    abortSignal,
    system: `You are the ${specialist} Specialist for Marcos Fitzsimons's portfolio.
${SPECIALIST_DESCRIPTIONS[specialist]}

Return evidence, not visitor-facing prose.
Use only supplied sources.
Every fact and project reference must include source IDs.
Put missing details in uncertainties.
Preserve supplied conflicts; never choose a winner.`,
    prompt: `Question: ${query}\n\nEvidence:\n${evidencePrompt(evidence)}`,
    experimental_telemetry: {
      isEnabled: true,
      functionId: `portfolio-agent.specialist.${specialist}`,
      recordInputs: false,
      recordOutputs: false,
    },
  });

  onUsage?.(totalUsage);
  return evidencePacketSchema.parse({ ...output, specialist });
}

const specialistToolInputSchema = z.object({
  question: z.string().min(1),
});

export const specialistValidationTools = {
  consultAiSpecialist: tool({
    description: SPECIALIST_DESCRIPTIONS.ai,
    inputSchema: specialistToolInputSchema,
    outputSchema: evidencePacketSchema,
  }),
  consultProductSpecialist: tool({
    description: SPECIALIST_DESCRIPTIONS.product,
    inputSchema: specialistToolInputSchema,
    outputSchema: evidencePacketSchema,
  }),
  consultCloudSpecialist: tool({
    description: SPECIALIST_DESCRIPTIONS.cloud,
    inputSchema: specialistToolInputSchema,
    outputSchema: evidencePacketSchema,
  }),
  consultMobileSpecialist: tool({
    description: SPECIALIST_DESCRIPTIONS.mobile,
    inputSchema: specialistToolInputSchema,
    outputSchema: evidencePacketSchema,
  }),
};

export function createSpecialistTools({
  budget,
  abortSignal,
  invoke,
}: {
  budget: ReturnType<typeof createDelegationBudget>;
  abortSignal?: AbortSignal;
  invoke: (specialist: Specialist, question: string) => Promise<EvidencePacket>;
}) {
  const build = (specialist: Specialist) =>
    tool({
      description: SPECIALIST_DESCRIPTIONS[specialist],
      inputSchema: specialistToolInputSchema,
      outputSchema: evidencePacketSchema,
      execute: async ({ question }) => {
        if (abortSignal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        if (!budget.claim(specialist)) {
          throw new Error(`${specialist} Specialist already used this turn`);
        }
        return invoke(specialist, question);
      },
    });

  return {
    consultAiSpecialist: build("ai"),
    consultProductSpecialist: build("product"),
    consultCloudSpecialist: build("cloud"),
    consultMobileSpecialist: build("mobile"),
  };
}

export async function retrieveAndRunSpecialist({
  specialist,
  query,
  abortSignal,
}: {
  specialist: Specialist;
  query: string;
  abortSignal?: AbortSignal;
}) {
  const evidence = await retrieveEvidence({
    query,
    lenses: [specialist],
    abortSignal,
  });
  const packet = await runSpecialist({
    specialist,
    query,
    evidence,
    abortSignal,
  });
  return { evidence, packet };
}
