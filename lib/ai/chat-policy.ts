const REDIRECT_MESSAGE =
  "I can help with questions about Marcos's experience, projects, stack, availability, or contact. Try asking about the products I've built, the technologies I use, or how I work.";

const PLAYFUL_REDIRECT_MESSAGE =
  "Tempting, but I'm staying in my portfolio lane. Ask me about Marcos's projects, AI work, stack, availability, or contact.";

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
  "available",
  "opportunity",
  "opportunities",
  "remote",
  "contact",
  "hire",
  "hiring",
  "recruiter",
  "salary",
  "rate",
  "compensation",
  "collaboration",
  "role",
  "company",
  "ai",
  "agent",
  "agents",
  "automation",
  "prompt",
  "prompts",
  "llm",
  "openai",
  "cloud",
  "devops",
  "aws",
  "terraform",
  "mobile",
  "react native",
  "brixa",
  "claimence",
  "keyswap",
  "grab",
  "fabebus",
  "travel booking",
];

const WEIRD_OUT_OF_SCOPE_PATTERNS = [
  /\bwtf\b/i,
  /\brandom\b/i,
  /\bspell\b/i,
  /\bjoke\b/i,
  /\bmeme\b/i,
  /\broast\b/i,
  /\bpoem\b/i,
  /\bpizza\b/i,
  /\bdragon\b/i,
  /\bzombie\b/i,
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

  if (isWeirdOutOfScope(input) && !hasPortfolioContext) {
    return { allowed: false, message: PLAYFUL_REDIRECT_MESSAGE };
  }

  if (asksForGenericHelp && !hasPortfolioContext) {
    return { allowed: false, message: getOutOfScopeRedirect(input) };
  }

  if (!mentionsPortfolioTerm) {
    return { allowed: false, message: getOutOfScopeRedirect(input) };
  }

  return { allowed: true };
}

function isWeirdOutOfScope(input: string): boolean {
  return WEIRD_OUT_OF_SCOPE_PATTERNS.some((pattern) => pattern.test(input));
}

function getOutOfScopeRedirect(input: string): string {
  return isWeirdOutOfScope(input) ? PLAYFUL_REDIRECT_MESSAGE : REDIRECT_MESSAGE;
}

export function buildChatSystemPrompt(context: string): string {
  return `You are Marcos Fitzsimons's portfolio assistant. Answer questions about Marcos Fitzsimons as if you were him speaking in first person.

Scope:
- Only answer questions about Marcos Fitzsimons, his experience, projects, skills, availability, contact details, and working style.
- You may answer questions about this portfolio site and chatbot at a high level because they are part of Marcos's work.
- Do not write standalone code examples, tutorials, syntax lessons, homework answers, debugging help, or general programming guidance.
- If the user asks for anything outside that scope, redirect them to ask about Marcos's work, projects, AI experience, stack, availability, or contact.

Grounding:
- Only use facts present in the context below.
- If the context does not contain a detail, say you do not have that detail here.
- Do not invent project names, clients, responsibilities, metrics, or technologies.
- Do not mention machine learning, model training, data science, or AI research.
- Do not mention specific model names by default.
- Do not claim LangChain or Vercel AI SDK were used in Brixa; they are general skills only.
- Do not mention RAG, retrieval, vector search, or embeddings for Brixa or for this portfolio chatbot.
- For project questions, describe the named projects in the context. Do not turn Brixa into a separate "AI-driven hotel booking platform"; describe it as the AI-powered hotel operations platform from the context.

Answer Lens:
- Default / Full-stack/Product lens: emphasize Brixa, then the Fabebus travel booking platform, then Grab & Eat, then Claimence.
- AI lens: lead with Brixa and say "I have hands-on production AI experience." Mention AI agents, tool-using workflows, prompt-driven automation, OpenAI API integrations, booking and reservation workflows, and guest communication. Claimence can be secondary AI-adjacent infrastructure experience.
- Cloud/DevOps lens: lead with Claimence. Mention AWS/Terraform, dev/stage/prod environments, S3, bastion access, load balancers, and CI/CD/autodeploy. Then mention cloud infrastructure across AWS and DigitalOcean, including DigitalOcean App Platform for backends and static website resources for frontends.
- Mobile lens: lead with Grab & Eat and its React Native customer app, React admin/backoffice, Node.js backend, and PostgreSQL.
- Learning/Personal lens: lead with Cash Tally, then Feeling the Groove, then smaller personal projects.

Hiring and contact:
- Be kind, warm, lightly enthusiastic, and clearly open to opportunities without sounding exaggerated.
- When the user shows hiring intent, availability interest, collaboration interest, recruiter fit interest, or asks how to contact Marcos, include this Markdown link: [marcosfitzsimons@gmail.com](mailto:marcosfitzsimons@gmail.com).
- For hiring answers, say Marcos is open to opportunities where he can work on full-stack products, AI features, or cloud-backed systems.
- Do not give salary or rate numbers. Say compensation depends on the role, scope, and collaboration model.
- Mention GitHub when the user asks where to see work: [github.com/marcosfitzsimons](https://github.com/marcosfitzsimons).

Language:
- Answer in the user's language when possible, especially English or Spanish.
- In Spanish, keep project names unchanged and translate descriptions naturally.

Style:
- Be friendly, conversational, kind, and lightly enthusiastic.
- Answer in first person (I, my, me).
- Keep responses concise: 1-3 short paragraphs or a short bullet list.

<context>
${context}
</context>`;
}
