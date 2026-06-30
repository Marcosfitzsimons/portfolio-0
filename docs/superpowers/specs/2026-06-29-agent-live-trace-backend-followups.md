# Live-Trace UI — Backend Follow-ups

**Date:** 2026-06-29
**Status:** Deferred (out of scope for the live-trace UI feature, which is frontend-only)
**Related:** [live-trace UI spec](2026-06-29-agent-live-trace-ui-design.md), [plan](../plans/2026-06-29-agent-live-trace-ui.md)

The live-trace UI is complete and renders whatever the backend emits. During live
validation (real chat, dev DB), two **backend** observations surfaced. Neither is a
UI bug — the UI faithfully renders the `data-trace` events — but both would improve
how the (now-visible) trace reads. Capture for later; pick up as separate tasks.

## 1. Trace labels are terse / generic

**Observation.** The public trace events carry labels like `"Understanding request"`,
`"Routing decided"`, `"Preparing answer"`. Now that these are visible in the chat
(operation rows), warmer, more specific copy would read better. The UI intentionally
renders `event.label` verbatim so copy stays backend-owned — so this is a backend
change, not a UI one.

**Where.** The `label` passed to `emitTrace({ type, label })` calls in
`lib/ai/portfolio-agent/runtime.ts` (e.g. the `request.received`,
`classification.completed`, `synthesis.started` emissions).

**Scope.** Small. Reword the labels; optionally make `classification.completed`
mention the chosen lenses (the event already carries `lenses`). Confirm no test
asserts the exact current strings before changing.

## 2. Specialist orbs only appear on the deterministic delegation path

**Observation.** The "alive" specialist orbs (AI/Cloud/Product/Mobile) render only
when the backend emits `specialist.started` / `specialist.completed` events. That
happens on the **deterministic** routing path (high-confidence technical lens →
specialists run in parallel). On the **orchestrator** path (lower confidence /
composite, where the orchestrator consults specialists via tool calls), no
`specialist.*` trace events are emitted, so the chat shows operations only — no orbs.

**Impact.** The signature multi-agent visualization is invisible for orchestrator-routed
turns, which may be a large share of real questions. (Live example: a broad
"AI + cloud infra" question routed to the orchestrator and showed no orbs; a focused
"AWS/Terraform/CI-CD" question hit the deterministic path and showed three orbs.)

**Possible fix.** Emit `specialist.started` / `specialist.completed` (and
`specialist.failed`) traces from the orchestrator-tools path too — i.e. inside the
specialist tool wrappers created in `createSpecialistTools` (`lib/ai/portfolio-agent/specialists.ts`)
or where they're invoked from the orchestrator loop in `runtime.ts`. The UI already
handles these events identically regardless of path, so no UI change is needed once
the events are emitted.

**Watch out for.** Budget/timeout semantics differ on the tool path; ensure a
specialist consulted twice (if the orchestrator retries) doesn't emit duplicate
`started` events that would confuse the one-node-per-specialist grouping in
`buildRows`. Also calibrate against the known classifier issue (it over-adds the
`product` lens) so orbs reflect genuinely-consulted specialists.
