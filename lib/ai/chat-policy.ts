const REDIRECT_MESSAGE =
  "I can help with questions about Marcos's experience, projects, stack, availability, or contact. Try asking about the products I've built, the technologies I use, or how I work.";

const PORTFOLIO_TERMS = [
  "marcos",
  "you",
  "your",
  "work",
  "project",
  "built",
  "portfolio",
  "experience",
  "stack",
  "technology",
  "technologies",
  "skills",
  "availability",
  "remote",
  "contact",
  "hire",
  "role",
  "company",
  "brixa",
  "claimence",
  "keyswap",
  "grab",
  "fabebus",
  "travel booking",
];

const GENERIC_HELP_PATTERNS = [
  /\bbasic\s+example\b/i,
  /\bsyntax\b/i,
  /\bwrite\s+(?:me\s+)?(?:a\s+)?(?:code|function|component|script)\b/i,
  /\bteach\s+me\b/i,
  /\bhow\s+do\s+i\s+(?:code|build|make|create)\b/i,
  /\bdebug\s+(?:this|my)\b/i,
  /\bdo\s+something\b/i,
];

const PORTFOLIO_CONTEXT_PATTERNS = [
  /\bin\s+(?:your|marcos'?s)\s+(?:work|projects|portfolio)\b/i,
  /\bhow\s+do\s+you\s+use\b/i,
  /\bwhat\s+technolog(?:y|ies)\s+do\s+you\s+use\b/i,
  /\bwhat\s+projects\s+have\s+you\s+built\b/i,
];

export const chatScopeRedirectMessage = REDIRECT_MESSAGE;

export function getChatScopeDecision(input: string): {
  allowed: boolean;
  message?: string;
} {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return { allowed: false, message: REDIRECT_MESSAGE };
  }

  const asksForGenericHelp = GENERIC_HELP_PATTERNS.some((pattern) =>
    pattern.test(input),
  );
  const hasPortfolioContext = PORTFOLIO_CONTEXT_PATTERNS.some((pattern) =>
    pattern.test(input),
  );
  const mentionsPortfolioTerm = PORTFOLIO_TERMS.some((term) =>
    normalized.includes(term),
  );

  if (asksForGenericHelp && !hasPortfolioContext) {
    return { allowed: false, message: REDIRECT_MESSAGE };
  }

  if (!mentionsPortfolioTerm) {
    return { allowed: false, message: REDIRECT_MESSAGE };
  }

  return { allowed: true };
}

export function buildChatSystemPrompt(context: string): string {
  return `You are Marcos Fitzsimons's portfolio assistant. Answer questions about Marcos Fitzsimons as if you were him speaking in first person.

Scope:
- Only answer questions about Marcos Fitzsimons, his experience, projects, skills, availability, contact details, and working style.
- Do not write standalone code examples, tutorials, syntax lessons, homework answers, debugging help, or general programming guidance.
- If the user asks for anything outside that scope, politely redirect them to ask about Marcos's work, projects, stack, or availability.

Grounding:
- Only use facts present in the context below.
- If the context does not contain a detail, say you do not have that detail here.
- Do not invent project names, clients, responsibilities, metrics, or technologies.
- Do not mention machine learning. If discussing AI work, use the specific wording from the context, such as AI assistant, AI-powered coverage analysis, OpenAI API, LangChain, or Vercel AI SDK.
- For project questions, describe the named projects in the context. Do not turn Brixa into a separate "AI-driven hotel booking platform"; describe it as the hotel management system from the context.

Style:
- Be friendly and conversational.
- Answer in first person (I, my, me).
- Keep responses concise: 1-3 short paragraphs or a short bullet list.

<context>
${context}
</context>`;
}
