function envFlag(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value == null || value === "") return fallback;
  return value !== "false" && value !== "0";
}

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const portfolioAgentConfig = {
  models: {
    classifier:
      process.env.PORTFOLIO_AGENT_CLASSIFIER_MODEL ?? "gpt-5.4-nano",
    specialist:
      process.env.PORTFOLIO_AGENT_SPECIALIST_MODEL ?? "gpt-5.4-mini",
    orchestrator:
      process.env.PORTFOLIO_AGENT_ORCHESTRATOR_MODEL ?? "gpt-5.4-mini",
    escalatedOrchestrator:
      process.env.PORTFOLIO_AGENT_ESCALATED_MODEL ?? "gpt-5.5",
    embedding:
      process.env.PORTFOLIO_AGENT_EMBEDDING_MODEL ??
      "text-embedding-3-small",
  },
  features: {
    classifier: envFlag("PORTFOLIO_AGENT_CLASSIFIER_ENABLED", true),
    deterministicDelegation: envFlag(
      "PORTFOLIO_AGENT_DETERMINISTIC_DELEGATION_ENABLED",
      true,
    ),
    orchestratorTools: envFlag(
      "PORTFOLIO_AGENT_ORCHESTRATOR_TOOLS_ENABLED",
      true,
    ),
    persistence: envFlag("PORTFOLIO_AGENT_PERSISTENCE_ENABLED", true),
    publicTrace: envFlag("PORTFOLIO_AGENT_PUBLIC_TRACE_ENABLED", true),
    escalation: envFlag("PORTFOLIO_AGENT_ESCALATION_ENABLED", true),
  },
  directRouteThreshold: envNumber(
    "PORTFOLIO_AGENT_DIRECT_ROUTE_THRESHOLD",
    0.8,
  ),
  specialistTimeoutMs: envNumber(
    "PORTFOLIO_AGENT_SPECIALIST_TIMEOUT_MS",
    4500,
  ),
  maxMessageCharacters: envNumber(
    "PORTFOLIO_AGENT_MAX_MESSAGE_CHARACTERS",
    1000,
  ),
  historyMessages: 8,
  retentionDays: 90,
  rateLimits: {
    ipPerMinute: envNumber("PORTFOLIO_AGENT_IP_PER_MINUTE", 8),
    ipPerDay: envNumber("PORTFOLIO_AGENT_IP_PER_DAY", 60),
    conversationPerMinute: envNumber(
      "PORTFOLIO_AGENT_CONVERSATION_PER_MINUTE",
      4,
    ),
  },
} as const;
