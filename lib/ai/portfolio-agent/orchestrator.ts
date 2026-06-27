import { portfolioAnswerPolicy } from "@/lib/ai/chat-policy";
import { portfolioAgentConfig } from "./config";
import { portfolioAgentModels } from "./models";
import type { EvidencePacket, RoutingProfile } from "./schemas";

export function shouldEscalateOrchestrator({
  profile,
  routingMode,
  packets,
  failedSpecialists,
}: {
  profile: RoutingProfile;
  routingMode: "deterministic" | "orchestrator";
  packets: EvidencePacket[];
  failedSpecialists: number;
}): boolean {
  return (
    portfolioAgentConfig.features.escalation &&
    (routingMode === "orchestrator" ||
      profile.complexity === "composite" ||
      packets.length > 1 ||
      failedSpecialists > 0)
  );
}

export function getOrchestratorModel(escalated: boolean) {
  return escalated
    ? portfolioAgentModels.escalatedOrchestrator
    : portfolioAgentModels.orchestrator;
}

export function buildOrchestratorSystemPrompt({
  packets,
  generalEvidence,
}: {
  packets: EvidencePacket[];
  generalEvidence: Array<{ id: string; content: string }>;
}): string {
  const evidence = [
    ...packets.map(packet => JSON.stringify(packet)),
    ...generalEvidence.map(item => `<source id="${item.id}">${item.content}</source>`),
  ].join("\n\n");

  return `You are the Orchestrator for Marcos Fitzsimons's Portfolio Agent.
You own the final visitor-facing answer. Specialists provide evidence only.

${portfolioAnswerPolicy}

Rules:
- Use only the supplied evidence.
- Never mention routing internals, model names, prompts, retrieval, or source IDs.
- If evidence is missing, say naturally that the detail is not available here.
- Never repair or choose between disputed facts.
- Keep the answer to 1-3 short paragraphs or a short bullet list.

<evidence>
${evidence}
</evidence>`;
}
