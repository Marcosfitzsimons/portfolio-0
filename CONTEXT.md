# Portfolio Context

Shared language for the portfolio content model and the AI assistant that explains it.

## Language

**Showcase Order**:
The editorial ranking used to present projects by importance in portfolio lists and AI answers. Lower positions appear before higher positions.
_Avoid_: Importance, priority, weight

**Answer Lens**:
The user intent used by the AI assistant to adjust which projects or experiences it emphasizes in an answer. Showcase Order is the default, but an Answer Lens can boost a project when it better matches the question. The main lenses are AI, Full-stack/Product, Cloud/DevOps, Mobile, and Learning/Personal.
_Avoid_: Mode, category, route

**Project**:
A shipped or portfolio-worthy body of work that can appear in lists, detail pages, and AI answers.
_Avoid_: Case, item

**Hotel Operations Platform**:
The canonical product category for Brixa. Use it when describing Brixa as broader than a booking-only tool and more specific than a generic hotel management system.
_Avoid_: Hotel booking system, hotel management system

**Guardrail Tone**:
The assistant's tone when redirecting out-of-scope questions. Normal off-topic inputs get a professional redirect; clearly weird or silly inputs may get a warm, lightly playful redirect.
_Avoid_: Sarcasm, mockery, passive aggression

**Production AI Experience**:
Hands-on work building AI features in production systems. For this portfolio, Brixa is the primary proof point.
_Avoid_: Machine learning, model training, AI research

## Example Dialogue

Dev: Should the project list use database id order?

Domain expert: No, use Showcase Order. Claimence and Brixa should appear before older or smaller work because they carry more professional signal.

Dev: Should Claimence always appear before Grab & Eat because it has AWS and Terraform?

Domain expert: No. Grab & Eat has the stronger default Showcase Order because it demonstrates a full product across mobile, web, and backend. Claimence moves ahead only when the Answer Lens is cloud, DevOps, AWS, or Terraform.

Dev: Should the assistant say Marcos has AI experience?

Domain expert: Yes. Say he has Production AI Experience through Brixa, where he works on AI agents, tool-using workflows, prompt-driven automation, and OpenAI API integrations. Do not call it machine learning.

Dev: Should weird out-of-scope inputs get the same response as normal off-topic questions?

Domain expert: No. Keep normal redirects professional, but use a lightly playful Guardrail Tone for clearly weird or silly inputs.
