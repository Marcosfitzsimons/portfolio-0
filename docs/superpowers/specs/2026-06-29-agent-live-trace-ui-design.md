# Live-Trace UI — Design Spec

**Date:** 2026-06-29
**Branch:** `feat/portfolio-agent-orchestration`
**Status:** Approved design, pending implementation plan

## Goal

The Portfolio Agent already streams a rich live trace of its orchestration
(`classify → delegate to specialists → specialists respond → synthesize → answer`)
as `data-trace` parts over SSE. The frontend currently throws all of it away and
shows a flat `"generating…"` shimmer. This feature renders that trace as the
agent's visible "live thoughts" — a **reasoning timeline** — so visitors can see
the multi-agent system work, with motion that feels alive and on-brand.

This is **frontend only**. No backend/runtime changes (the trace vocabulary and
streaming already exist). It builds directly on the duplicate-bubble fix
(`8575ce0`), which guarantees every assistant turn arrives as a **single** UI
message whose `parts` array carries the ordered `data-trace` events followed by
the answer `text`.

## Background: what the data looks like

After `8575ce0`, one assistant turn is one `PortfolioAgentMessage`
([schemas.ts](../../../lib/ai/portfolio-agent/schemas.ts)):

```ts
type PortfolioAgentMessage = UIMessage<never, { trace: PublicTraceEvent }>
```

Its `parts` array contains, in stream order:

- `{ type: "data-trace", id, data: PublicTraceEvent }` — one per trace event
- `{ type: "text", text }` — the answer (a single growing text part)

`PublicTraceEvent` ([schemas.ts:93-115](../../../lib/ai/portfolio-agent/schemas.ts#L93)) fields used here:

| field | use |
| --- | --- |
| `type` | `request.received` · `classification.completed` · `specialist.started` · `specialist.completed` · `specialist.failed` · `synthesis.started` · `answer.completed` · `answer.failed` · `request.cancelled` |
| `label` | backend-authored human copy for **operation** rows (use verbatim) |
| `timestamp` | ISO string; used to compute "Reasoned for Xs" |
| `specialist` | `ai` · `cloud` · `product` · `mobile` (on specialist events) |
| `durationMs` | on `specialist.completed` / `specialist.failed` |
| `lenses`, `complexity`, `confidenceBand`, `routingMode` | available on `classification.completed`; not required for v1 |

Access pattern (already used in [classifier.ts:77](../../../lib/ai/portfolio-agent/classifier.ts#L77)):
`part.type === "data-trace"` → `part.data` is the `PublicTraceEvent`.

## Architecture

### New component

`components/portfolio-agent/reasoning-trace.tsx` — a self-contained, presentational
component:

```ts
function ReasoningTrace(props: {
  events: PublicTraceEvent[];   // the data-trace events for this turn, in order
  phase: "thinking" | "done";   // derived by the caller (see below)
  defaultOpen: boolean;         // true for the active/latest turn, false for older
  reducedMotion: boolean;
}): JSX.Element
```

It owns its own collapse state (seeded from `defaultOpen`). It does **not** read
`useChat` — the parent passes everything in, so it stays testable and reusable.

Internal helpers (kept in the same file):
- `buildRows(events)` — **pure** function mapping events → ordered render rows.
  This is the unit-testable core.
- `<OperationRow>`, `<SpecialistNode>` — the two row renderers.

### Integration in `components/portfolio-agent.tsx`

In the existing `messages.map(...)` render
([portfolio-agent.tsx:269](../../../components/portfolio-agent.tsx#L269)), for
`assistant` messages:

1. Split `message.parts` into `traceEvents` (`data-trace` → `.data`) and the
   answer text (existing `getMessageText`).
2. Render `<ReasoningTrace>` above the answer bubble when `traceEvents.length > 0`.
3. Derive `phase`: `done` once an `answer.completed` / `answer.failed` /
   `request.cancelled` event is present **or** the message is no longer the active
   stream; otherwise `thinking`.
4. Derive `defaultOpen`: `true` only for the **last** assistant message; `false`
   for earlier ones (so sending a new message collapses the previous turn).

The current `"generating…"` shimmer
([portfolio-agent.tsx:321-338](../../../components/portfolio-agent.tsx#L321)) is
**replaced** by `<ReasoningTrace phase="thinking">`. Window between send and the
first `request.received` event: `ReasoningTrace` renders its brain header in the
`thinking` state with no rows yet (a "Reasoning" shimmer), so there is no flash of
empty space.

## Trace → row mapping

`buildRows` produces an ordered list of two row kinds. **Operations** are plain
orchestrator steps; **specialist invocations** are the rich, animated nodes.
Specialists are grouped by `specialist` enum (the `started` + `completed`/`failed`
events for one specialist collapse into a single node that changes status).

| Event(s) | Row | Notes |
| --- | --- | --- |
| `request.received` | operation | label from `event.label` |
| `classification.completed` | operation | label from `event.label` |
| `specialist.started` (sp) | specialist · `running` | one node per specialist |
| `specialist.completed` (sp) | specialist · `done` + `durationMs` | replaces running |
| `specialist.failed` (sp) | specialist · `failed` + `durationMs` | amber, no settle ring |
| `synthesis.started` | operation | label from `event.label`; `running` until done |
| `answer.completed` | (terminal) | flips `phase` to done; not its own row |
| `answer.failed` / `request.cancelled` | terminal operation | muted-amber row, e.g. "Couldn't complete" / "Cancelled" |

Render order: received → classification → specialists (in arrival order) →
synthesis → terminal. Each row appears only once its event has arrived, so the
list grows live as the stream progresses (this is what animates).

## Visual design (locked)

Validated via throwaway prototype at `app/prototype/agent-trace`
(variant `timeline`). Reference: [NOTES.md](../../../app/prototype/agent-trace/NOTES.md).

**Header — the orchestrator.** A single **outline brain icon** + label, on a left
rail. `thinking`: label reads "Reasoning" with a shimmer; the brain gently pulses
(opacity + slight scale). `done`: a chevron toggle + brain + "Reasoned for Xs".
There is exactly **one** brain (no duplicate solid node).

**Operations.** Muted: a small neutral dot on the rail + gray label text
(`event.label`). The synthesis op shows a running pulse-dot until done.

**Specialist invocations — the "alive" nodes.** Per specialist, a glowing **orb**
(radial-gradient in the specialist accent, dark glyph) on the rail:
- `running`: a **radar pulse** (1–2 staggered rings) emanates from the orb, the
  **icon breathes** (scale ~1→1.18→1), and the orb glow breathes. Label:
  accent-colored specialist name + muted "specialist" + animated working-dots +
  "consulting".
- `done`: a quiet **settled ring** eases in around the orb (no check badge), glow
  settles to a soft static halo; label shows `durationMs` (e.g. `1.4s`).
- `failed`: orb + ring in **amber/desaturated**, label "unavailable", no duration
  emphasis.

Specialist accents (carry over from prototype `SPECIALIST_META`):
`ai` violet `#a78bfa`, `cloud` cyan `#22d3ee`, `product` emerald `#34d399`,
`mobile` amber `#fbbf24`. Each has a short glyph.

**Collapse behavior.**
- Thoughts default **open** for the active/latest turn.
- `done` turns can be collapsed; older turns render **collapsed** by default.
- Collapsed pill: chevron + brain + "Reasoned for Xs" + small colored dots for the
  specialists consulted (so the multi-agent work is visible even when folded).

**Motion principles** (from `emil-design-eng`): custom ease-out
`cubic-bezier(0.23,1,0.32,1)`; entrance springs (`bounce ~0.34`) for specialist
drop-in; sub-300ms for UI transitions; the trace is occasional-frequency so this
delight is warranted. Specialist drop-in: `opacity/x/scale/blur` spring.

## States & edge cases

| State | Behavior |
| --- | --- |
| **No-specialist turn** (general/contact → no specialists) | Still show a **minimal** trace: brain + `Read your question` → `Composed the answer`, collapsing to "Reasoned for 0.6s". Consistent every turn. |
| **Specialist fails** | Amber orb + "unavailable"; answer proceeds from successful evidence (backend already preserves it). |
| **`answer.failed` / `request.cancelled`** | Muted-amber terminal row; no green/settle treatment. |
| **Older turns** | Rendered collapsed (pill with specialist dots). |
| **Reduced motion** (`useReducedMotion`) | Drop movement: no spring drop-in, no radar pulse, no breathing/brain pulse. Keep opacity/color fades and the collapse height transition so it still reads as progress. |
| **Reload of a persisted conversation** | Persisted messages carry the same `data-trace` parts → historical turns render their collapsed pill. No special handling needed. |

## Timing

"Reasoned for Xs" = `answer.completed.timestamp − request.received.timestamp`,
formatted to one decimal (e.g. `3.5s`). While `thinking`, the header shows
"Reasoning" (no number yet). Specialist durations come straight from
`durationMs`.

## Constraints

- **Tailwind 3.3.3** — the `size-*` utility (Tailwind 3.4+) is a **silent no-op**
  here; it collapses icon/dot elements to zero. Use `h-_ w-_` or inline
  width/height. (This bit the prototype; verified via DOM inspection.)
- Reuse `motion/react` (already a dependency and used by `portfolio-agent.tsx`).
- No new runtime deps.

## Testing & verification

- **Unit:** `buildRows` is pure — test the event→row mapping for: composite
  multi-specialist, single specialist, no-specialist (minimal), `specialist.failed`,
  and terminal `answer.failed`/`cancelled`. (CJS test per the repo convention; see
  [tests/portfolio-agent-runtime.test.cjs](../../../tests/portfolio-agent-runtime.test.cjs).)
- **Component:** assert `ReasoningTrace` renders one row per operation, one node per
  specialist (not one per started/completed event), default-open vs collapsed by
  `defaultOpen`, and reduced-motion path.
- **Manual:** drive the real chat (or the prototype harness) and confirm the live
  stream animates the rows in, collapses correctly, and degrades for no-specialist
  turns. Confirm no `size-*` regressions (icons/dots have real dimensions).
- **Regression guard:** the duplicate-bubble guard from `8575ce0` stays green
  (single assistant message is a precondition for this UI).

## Out of scope (v1)

- Surfacing `lenses` / `confidenceBand` / source labels in the UI (data is
  available; defer).
- Per-specialist expandable evidence detail.
- Any backend/runtime change.

## Cleanup

Once the winning design is folded into `components/portfolio-agent/`, **delete the
throwaway prototype** `app/prototype/agent-trace/` (route, variants, switcher,
shared harness, NOTES). It exists only to choose the shape.
