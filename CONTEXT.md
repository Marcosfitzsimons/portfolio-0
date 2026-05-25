# Portfolio Context

Shared language for the portfolio content model and the AI assistant that explains it.

## Language

**Showcase Order**:
The editorial ranking used to present projects by importance in portfolio lists and AI answers. Lower positions appear before higher positions.
_Avoid_: Importance, priority, weight

**Answer Lens**:
The user intent used by the AI assistant to adjust which projects or experiences it emphasizes in an answer. Showcase Order is the default, but an Answer Lens can boost a project when it better matches the question.
_Avoid_: Mode, category, route

**Project**:
A shipped or portfolio-worthy body of work that can appear in lists, detail pages, and AI answers.
_Avoid_: Case, item

## Example Dialogue

Dev: Should the project list use database id order?

Domain expert: No, use Showcase Order. Claimence and Brixa should appear before older or smaller work because they carry more professional signal.

Dev: Should Claimence always appear before Grab & Eat because it has AWS and Terraform?

Domain expert: No. Grab & Eat has the stronger default Showcase Order because it demonstrates a full product across mobile, web, and backend. Claimence moves ahead only when the Answer Lens is cloud, DevOps, AWS, or Terraform.
