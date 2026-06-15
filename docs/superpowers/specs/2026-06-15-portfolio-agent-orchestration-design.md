# Portfolio Agent Orchestration Design

## Status

Approved in discussion on June 15, 2026.

This specification replaces the unimplemented root-level `chatbot-agentic.md`
proposal. It covers backend orchestration, data contracts, persistence,
observability, and migration boundaries. The visitor-facing trace interaction
and visual design are deliberately deferred to a separate design session.

## Purpose

Transform the current portfolio chatbot into a **Portfolio Agent** that remains
useful as a concise portfolio assistant while visibly demonstrating
classification, routing, Specialist delegation, evidence gathering, and final
synthesis.

The Portfolio Agent must:

- Answer grounded questions about Marcos's experience, projects, skills,
  availability, contact details, and working style.
- Demonstrate meaningful agent delegation without exposing chain-of-thought.
- Preserve one consistent visitor-facing voice.
- Bound cost and latency through confidence-gated routing and model tiers.
- Produce stable trace events that a later frontend can render.
- Persist anonymous conversations and operational traces for debugging and
  evaluation.

## Existing System

The current implementation:

- Renders `ChatBot` from `components/chat-bot.tsx`.
- Uses `useChat` with `/api/chat`.
- Applies regex and keyword scope checks in `lib/ai/chat-policy.ts`.
- Retrieves three semantic chunks from `lib/ai/knowledge.md` on every accepted
  request.
- Flattens `UIMessage` values manually into `{ role, content }`.
- Streams one `gpt-4o-mini` response.
- Stores no conversations, routing decisions, runs, or traces.

The existing `Answer Lens` concept already distinguishes AI,
Full-stack/Product, Cloud/DevOps, Mobile, and Learning/Personal emphasis. The
new architecture turns the principal technical lenses into explicit
Specialists rather than inventing a separate project taxonomy.

## Chosen Architecture

Use a **confidence-gated hybrid** built with Vercel AI SDK 6:

1. Application code handles indisputable validation.
2. A small structured classifier produces a `RoutingProfile`.
3. High-confidence profiles invoke the selected Specialists directly.
4. Ambiguous or low-confidence profiles let the Orchestrator choose Specialist
   tools.
5. Specialists return structured evidence, never visitor-facing prose.
6. The Orchestrator owns every final response.

This combines deterministic routing where the decision is known with
agent-controlled routing where semantic ambiguity requires it.

Fully deterministic orchestration was rejected because ambiguity would create
increasingly complex routing code and weaken the agentic demonstration. Fully
agent-controlled orchestration was rejected because it would increase routing
variance, latency, cost, and trace unpredictability for straightforward
requests.

## Request Flow

```text
Receive latest message and anonymous conversation ID
        |
Build an eight-message window ending with the latest message
        |
Validate UI messages and emit request.received
        |
Apply deterministic input validation
        |
Classify scope, lenses, complexity, decision, and confidence
        |
        +-- out of scope --> deterministic guardrail response
        |
        +-- general ------> Orchestrator answers without Specialist evidence
        |
        +-- high confidence, known lens(es)
        |                    --> invoke selected Specialists directly
        |
        +-- unknown, abstained, or low confidence
                             --> Orchestrator selects Specialist tools
        |
Retrieve scoped structured and narrative evidence
        |
Specialists return validated EvidencePackets
        |
Orchestrator synthesizes one grounded response
        |
Persist messages, routing, trace, usage, timings, sources, and errors
```

High-confidence composite requests may invoke multiple Specialists directly.
Complexity alone does not force agent-selected routing.

## Routing

### Deterministic Validation

Application code handles only indisputable cases:

- Empty or whitespace-only input.
- Invalid payloads.
- Payloads exceeding configured size limits.
- Requests blocked by rate or concurrency limits.

Semantic scope and topic decisions belong to the classifier. The current broad
keyword gate must not remain the primary router.

### Routing Profile

The classifier returns a schema-validated structure:

```ts
type RoutingProfile = {
  scope: "portfolio" | "out_of_scope";
  lenses: Array<
    "general" | "ai" | "product" | "cloud" | "mobile" | "unknown"
  >;
  complexity: "direct" | "composite";
  decision: "route" | "abstain";
  confidence: number;
};
```

Rules:

- `general` means the classifier is confident that no Specialist is required.
- `unknown` is an explicit abstention and hands Specialist selection to the
  Orchestrator.
- `general` and `unknown` are mutually exclusive with technical lenses.
- The classifier may return up to four candidate technical lenses.
- Invalid classifier output becomes an abstention.
- Raw confidence is operational data, not a calibrated probability.
- The public trace exposes only `high`, `medium`, or `low` confidence bands.
- Band thresholds and direct-routing thresholds remain configuration derived
  from evaluation results.

The classifier receives the current active lens when known and a validated
Conversation Window of at most eight user/assistant messages ending with the
latest user input.

### Out-of-Scope Requests

Out-of-scope classification is terminal:

- Do not call the Orchestrator or a Specialist.
- Return the existing professional or lightly playful guardrail response.
- Emit a bounded classification trace such as `Outside portfolio scope`.
- Do not expose classifier rationale.

## Specialists

The initial Specialists are:

- **AI Specialist**
- **Product/Full-stack Specialist**
- **Cloud/DevOps Specialist**
- **Mobile Specialist**

Career and hiring behavior remains shared Orchestrator policy. It does not
justify a separate Specialist because it uses the same evidence and primarily
requires consistent communication and compensation boundaries.

### Specialist Boundary

Each Specialist:

- Has lens-specific instructions.
- Receives only bounded, scoped evidence.
- Performs one structured generation.
- Returns one validated `EvidencePacket`.
- Never answers the visitor directly.
- Never arbitrates canonical source conflicts.
- Runs at most once per visitor turn.

Specialists are not autonomous tool loops. Application code retrieves their
evidence before generation. This is sufficient for the small local corpus and
avoids unnecessary model-tool-model round trips.

### Multi-Lens Delegation

High-confidence multi-lens requests invoke relevant Specialists concurrently.
The per-turn Delegation Budget allows all four Specialists, each at most once.
Independent work should run in parallel.

In the ambiguous fallback path, the Orchestrator may access all four Specialist
tools under the same budget. Tool state must prevent repeat invocation of an
already completed Specialist.

### Named Projects

Explicit question emphasis determines the lens:

- "What AI work did you do on Brixa?" selects AI.
- "How was Claimence deployed?" selects Cloud/DevOps.
- "What did you build on Grab & Eat?" selects Product/Full-stack unless mobile
  emphasis is explicit.

When a named-project request provides no emphasis, use the project's configured
default lens. Named-project matching always overrides general tag ranking.

## Evidence

### Canonical Sources

The evidence layer combines:

- Prisma project data.
- Curated structured knowledge records.

Source ownership is explicit:

- **Prisma owns:** project title, dates, stack, tags, links, status, and
  Showcase Order.
- **Curated knowledge owns:** responsibilities, impact, role boundaries,
  career narrative, communication rules, and factual caveats.

Cross-category overlap follows ownership automatically. If two sources claiming
ownership of the same fact disagree, quarantine the disputed fact, fail only
the affected evidence branch, and record both technical source IDs for
diagnostics. Models must never decide which canonical source is correct.

### Structured Knowledge Records

Replace plain `knowledge.md` runtime parsing with schema-validated TypeScript or
JSON records. Each record includes at least:

```ts
type KnowledgeRecord = {
  id: string;
  publicLabel: string;
  lenses: Array<"ai" | "product" | "cloud" | "mobile">;
  project?: string;
  factType: string;
  content: string;
};
```

Records may carry additional metadata required for filtering and validation.
Public labels are stable, visitor-friendly names such as `Cloud experience` or
`Brixa project record`. Technical IDs remain internal.

### Retrieval

Structured project retrieval is deterministic:

1. Match an explicitly named project first.
2. Otherwise filter using classifier lenses and lens-related project tags.
3. Rank by relevance and Showcase Order.
4. Return a small configured number of records.

Narrative retrieval keeps embeddings but operates over structured knowledge
records:

- Filter by lens, named project, and fact type before similarity ranking.
- Cache corpus embeddings in memory.
- Return source-aware records rather than anonymous text chunks.
- Include source IDs in every downstream evidence item.

### Evidence Packet

Specialists return a schema-validated structure:

```ts
type EvidencePacket = {
  specialist: "ai" | "product" | "cloud" | "mobile";
  facts: VerifiedFact[];
  projects: ProjectReference[];
  suggestedEmphasis: string[];
  sourceIds: string[];
  uncertainties: string[];
  conflicts: EvidenceConflict[];
};
```

The final schemas for `VerifiedFact`, `ProjectReference`, and
`EvidenceConflict` must preserve source provenance and distinguish verified,
missing, and disputed information.

Invalid Specialist output fails only that branch.

## Orchestrator

The Orchestrator:

- Owns every final visitor-facing answer.
- Receives validated conversation context and successful evidence packets.
- Applies shared scope, hiring, contact, compensation, language, grounding, and
  tone policies.
- Produces concise answers in the visitor's language where possible.
- Uses natural bounded uncertainty when evidence is missing.
- May offer nearby verified facts without implying the missing fact.

There is no separate NLG Formatter. A second rewriting model would duplicate
the Orchestrator's responsibility, add latency, and risk changing grounded
facts. Mechanical validation may sanitize links, enforce response-size limits,
or reject prohibited output patterns without rewriting the answer.

### Model Policy

Model IDs are runtime configuration, not domain logic.

Initial policy, based on current June 2026 model guidance:

- Classifier: `gpt-5.4-nano`.
- Specialists: `gpt-5.4-mini`.
- Normal Orchestrator synthesis: `gpt-5.4-mini`.
- Escalated Orchestrator synthesis: `gpt-5.5`.

Escalate only when at least one of these applies:

- The classifier abstains or remains low confidence.
- The Orchestrator must choose Specialist tools.
- The request requires substantial multi-lens synthesis.
- A Specialist branch fails and partial evidence requires careful synthesis.

Model selection must remain configurable and evaluation-driven so model
upgrades do not alter routing or domain modules.

## Conversation State

### Message Handling

Persist complete validated `UIMessage[]`, including application trace data
parts where appropriate.

For each request:

1. Load at most the latest seven prior user/assistant messages.
2. Append the new user message, producing a maximum of eight messages total.
3. Validate using `validateUIMessages()` against the current tools and data-part
   schemas.
4. Convert using `convertToModelMessages()`.

Do not manually flatten messages to `{ role, content }`. Manual conversion
would discard tool calls, trace parts, metadata, and future structured content.

There is no conversation summary. Messages older than the eight-message
Conversation Window are omitted from model context while remaining persisted
until retention expiry.

### Persistence

Use anonymous generated conversation IDs. Persist:

- Conversations.
- Complete UI messages.
- Agent runs.
- Routing profiles and confidence scores.
- Typed trace events.
- Specialist invocations and statuses.
- Model identifiers and usage.
- Durations.
- Technical source IDs.
- Sanitized errors.

Do not persist:

- Visitor profiles or inferred lead data.
- Application-level IP addresses.
- Chain-of-thought or private reasoning.
- Duplicate raw prompts and outputs in telemetry systems.

Retain conversations and operational traces for 90 days. A scheduled cleanup
job deletes expired records.

## Visible Delegation Contract

The backend emits stable application events rather than raw provider events:

```ts
type AgentTraceEvent =
  | RequestReceivedEvent
  | ClassificationCompletedEvent
  | SpecialistStartedEvent
  | SpecialistCompletedEvent
  | SpecialistFailedEvent
  | SynthesisStartedEvent
  | AnswerCompletedEvent
  | RequestCancelledEvent;
```

Each event contains:

- Event ID.
- Conversation and run IDs.
- Timestamp.
- Stable event type.
- Visitor-safe public label.
- Approved safe metadata.
- Optional duration.
- Optional public source labels.

Classification trace metadata may expose:

- Selected lens or lenses.
- Direct or composite complexity.
- Confidence band.
- Deterministic or Orchestrator-selected routing mode.

It must not expose:

- Generated rationales.
- Chain-of-thought.
- Raw prompts.
- The specific prior messages used for context.
- Technical source IDs or stack traces.

Expected public lifecycle:

```text
Understanding request
Delegating to Cloud Specialist
Cloud Specialist preparing evidence
Preparing answer
Answer returned
```

The later frontend design may render these events as transitions, Specialist
cards, or an expandable trace, but must consume this stable contract.

## Reliability

### Latency Targets

- Emit the first visible trace event within 500 ms under ordinary conditions.
- Return ordinary final answers within 8 seconds.
- Time out each Specialist independently after approximately 4-5 seconds.
- Run independent retrieval and Specialist work concurrently where possible.
- Preserve enough request budget for final synthesis.

The current route-level 30-second maximum may remain as the hard platform
ceiling, not the target.

### Partial Failure

Specialist failure does not fail the entire request:

- Preserve successful evidence packets.
- Emit a sanitized `specialist.failed` event.
- Let the Orchestrator answer only from surviving verified evidence.
- State uncertainty naturally when required.
- Do not expose provider errors to visitors.

Automatic retries are not required initially. They may be added later for
proven transient errors under a strict remaining-time budget.

### Cancellation

Propagate the request `AbortSignal` through classification, retrieval,
Specialists, and Orchestrator synthesis. Cancellation:

- Stops active work.
- Avoids paying for abandoned downstream calls where possible.
- Emits and persists `request.cancelled`.
- Does not leave incomplete tool calls in future model history.

## Security And Abuse Controls

- Treat all visitor content as untrusted data.
- Keep system policies separate from user text and evidence.
- Specialists receive a bounded task and validated evidence; evidence must
  never be interpreted as instructions.
- Prompt-injection phrase detection may support logging or throttling but must
  not be the primary defense.
- Apply configurable per-IP and per-conversation limits.
- Permit a small burst while enforcing a daily cap.
- Enforce request and message-size limits.
- Allow at most one active turn per conversation.
- Keep IP data only in a short-lived rate-limit store, preferably hashed, and
  never in conversation records.

## Observability

Enable metadata-only observability:

- Routing labels and confidence.
- Routing mode.
- Model IDs.
- Token usage.
- Timings.
- Specialist and tool names.
- Source IDs.
- Finish reasons and sanitized errors.

When AI SDK OpenTelemetry support is enabled, configure:

```ts
experimental_telemetry: {
  isEnabled: true,
  recordInputs: false,
  recordOutputs: false,
}
```

Conversation text remains in the conversation database only.

## Testing And Evaluation

### Routing Smoke Set

Version approximately 20 labeled English and Spanish scenarios in the
repository. Cover:

- Every Specialist lens.
- General in-scope requests.
- Direct named-project questions.
- Follow-up questions requiring history.
- Multi-lens composite requests.
- Ambiguous requests and abstention.
- Normal and adversarial out-of-scope requests.

Acceptance criteria:

- Zero out-of-scope requests routed to Specialists.
- Zero unsupported lens values.
- At most one incorrect Specialist route.
- Abstention is acceptable when uncertain.
- Every follow-up scenario uses conversation context correctly.

This smoke set catches regressions but is not sufficient for statistically
calibrating confidence. Expand it with anonymized production failures after
launch.

### Deterministic Tests

Cover:

- Routing schema validation and abstention fallback.
- Confidence-band mapping.
- Eight-message Conversation Window.
- Named-project and lens/tag retrieval.
- Showcase Order ranking.
- Source ownership and conflict quarantine.
- Delegation Budget enforcement.
- Specialist single-invocation guarantees.
- Trace event schemas and public-data filtering.
- 90-day retention cleanup.
- Rate and concurrency-limit behavior.

### AI SDK Tests

Use AI SDK mock language and embedding models to test without production calls:

- Classifier structured outputs.
- Specialist evidence packets.
- Parallel delegation.
- Ambiguous Orchestrator tool selection.
- Partial Specialist failure.
- Cancellation.
- Streaming trace and answer events.
- Invalid structured output.

Add a small opt-in live evaluation comparing normal mini synthesis with GPT-5.5
escalation for groundedness, response quality, latency, and cost.

## Migration Scope

### Rename

- Rename `components/chat-bot.tsx` to `components/portfolio-agent.tsx`.
- Rename `ChatBot` to `PortfolioAgent`.
- Update imports and documentation.
- Keep `/api/chat` as the transport endpoint.
- Keep display branding separate from the technical name.

### Backend

- Replace manual message flattening with AI SDK validation and conversion.
- Replace broad keyword routing with the Hybrid Router.
- Add routing, evidence retrieval, Specialist, Orchestrator, trace, persistence,
  model-policy, and rate-limit modules.
- Convert runtime knowledge from plain Markdown into validated structured
  records.
- Extend Prisma for conversations, messages, runs, Specialist invocations, and
  trace events.
- Add 90-day scheduled cleanup.

### Documentation

- Treat this specification as superseding `chatbot-agentic.md`.
- Preserve the canonical domain language in `CONTEXT.md`.
- Remove or replace stale examples that describe the component as a generic
  ChatBot once implementation begins.

### Deferred

The following are explicitly outside this specification:

- Trace layout and animation.
- Specialist card visuals.
- Expand/collapse behavior.
- Responsive trace presentation.
- Display branding and persona naming.
- Visitor profiling or lead enrichment.
- Conversation summarization.
- A separate NLG Formatter agent.
- Migration to the OpenAI Agents SDK.

## Production Rollout

Introduce the architecture behind configuration flags:

- Structured classifier enabled.
- Deterministic Specialist routing enabled.
- Ambiguous Orchestrator tool routing enabled.
- Persistence enabled.
- Public trace streaming enabled.
- GPT-5.5 escalation enabled.

This permits isolated evaluation and rollback of orchestration behavior without
reverting the component rename or data migration.

## Success Criteria

The upgrade is successful when:

- In-scope technical questions visibly and correctly delegate to Specialists.
- Ambiguous requests abstain safely and allow bounded Orchestrator routing.
- The Orchestrator produces one concise, grounded, consistent answer.
- Out-of-scope inputs never invoke Specialists.
- The eight-message window preserves tested follow-ups.
- Partial Specialist failure still yields a useful bounded answer.
- Trace events contain useful public decisions without private reasoning.
- Conversations and operational traces expire after 90 days.
- Ordinary interactions meet the 500 ms trace and 8-second final-answer targets.
- The smoke suite meets its routing acceptance criteria.

## References

- Vercel AI SDK 6 workflow patterns:
  https://ai-sdk.dev/docs/agents/workflows
- Vercel AI SDK 6 subagents:
  https://ai-sdk.dev/docs/agents/subagents
- Vercel AI SDK structured outputs:
  https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- Vercel AI SDK message persistence:
  https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence
- Vercel AI SDK telemetry:
  https://ai-sdk.dev/docs/ai-sdk-core/telemetry
- Vercel AI SDK testing:
  https://ai-sdk.dev/docs/ai-sdk-core/testing
- OpenAI orchestration and agents-as-tools:
  https://developers.openai.com/api/docs/guides/agents/orchestration
- OpenAI current model guidance:
  https://developers.openai.com/api/docs/guides/latest-model
- OpenAI model catalog:
  https://developers.openai.com/api/docs/models
