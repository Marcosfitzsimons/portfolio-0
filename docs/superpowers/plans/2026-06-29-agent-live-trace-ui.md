# Live-Trace UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the Portfolio Agent's live trace (`classify → delegate → specialists → synthesize → answer`) as a "reasoning timeline" in the chat, replacing the flat `"generating…"` shimmer.

**Architecture:** A pure `buildRows()` module maps the ordered `data-trace` events (already streamed on the single post-fix assistant message) into render rows. A presentational `<ReasoningTrace>` component renders them — outline brain orchestrator header, muted operation rows, animated specialist orbs — and is dropped into `portfolio-agent.tsx`'s message render. No backend changes.

**Tech Stack:** Next.js 14, React, TypeScript, `motion/react` (Framer Motion v12), Tailwind **3.3.3**, `node:test` + `ts-node` CJS test harness.

**Reference spec:** [docs/superpowers/specs/2026-06-29-agent-live-trace-ui-design.md](../specs/2026-06-29-agent-live-trace-ui-design.md)

---

## ⚠️ GIT DISCIPLINE (read before any commit)

This branch has **uncommitted work that is NOT part of this feature** and must be preserved untouched:
- `app/page.tsx`, `package.json`, `package-lock.json` (spatial-home work)
- `app/prototype/spatial/` (a *different* prototype)
- `docs/spatial-prototype-prompt.md`, `docs/superpowers/{plans,specs}/2026-06-27-spatial-home-migration*` (spatial docs)

**Rules:**
- **NEVER** run `git add -A`, `git add .`, or `git commit -a`. Stage only the explicit paths named in each commit step.
- Run `git status --short` before every commit and confirm only feature files are staged.
- Our feature files: `components/portfolio-agent/reasoning-trace-rows.ts`, `components/portfolio-agent/reasoning-trace.tsx`, `components/portfolio-agent.tsx`, `tests/portfolio-agent-reasoning-trace.test.cjs`, and (Task 4) deletion of `app/prototype/agent-trace/`.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `components/portfolio-agent/reasoning-trace-rows.ts` | **NEW, pure (no JSX).** `Specialist` re-use, `SPECIALIST_META`, `TraceRow` type, `buildRows()`, `hasTerminalEvent()`, `computeReasonedSeconds()`. Unit-tested. |
| `components/portfolio-agent/reasoning-trace.tsx` | **NEW, React.** `BrainIcon`, `OperationRow`, `SpecialistNode`, `ReasoningTrace`. Imports the rows module + `motion/react`. |
| `components/portfolio-agent.tsx` | **MODIFY.** Extract `data-trace` events per assistant message; render `<ReasoningTrace>`; guard the empty answer bubble. |
| `tests/portfolio-agent-reasoning-trace.test.cjs` | **NEW.** Behavioral unit tests for `buildRows` + `computeReasonedSeconds`. |
| `app/prototype/agent-trace/` | **DELETE (Task 4).** Throwaway prototype, once the design is folded in. |

---

### Task 1: Pure trace→rows module (TDD)

**Files:**
- Create: `components/portfolio-agent/reasoning-trace-rows.ts`
- Test: `tests/portfolio-agent-reasoning-trace.test.cjs`

- [ ] **Step 1: Write the failing test**

Create `tests/portfolio-agent-reasoning-trace.test.cjs`:

```js
require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  buildRows,
  hasTerminalEvent,
  computeReasonedSeconds,
} = require("../components/portfolio-agent/reasoning-trace-rows.ts");

let seq = 0;
function ev(type, extra = {}) {
  seq += 1;
  return {
    id: `e${seq}`,
    type,
    label: extra.label ?? type,
    timestamp: extra.timestamp ?? "2026-06-29T00:00:00.000Z",
    ...extra,
  };
}

describe("buildRows", () => {
  it("maps a composite multi-specialist turn to ordered rows", () => {
    const rows = buildRows([
      ev("request.received", { label: "Read your question" }),
      ev("classification.completed", { label: "Routed to specialists" }),
      ev("specialist.started", { specialist: "cloud" }),
      ev("specialist.started", { specialist: "ai" }),
      ev("specialist.completed", { specialist: "cloud", durationMs: 1400 }),
      ev("specialist.completed", { specialist: "ai", durationMs: 1700 }),
      ev("synthesis.started", { label: "Composed the answer" }),
      ev("answer.completed"),
    ]);
    const kinds = rows.map((r) => r.kind);
    assert.deepEqual(kinds, ["op", "op", "specialist", "specialist", "op"]);
    const cloud = rows.find((r) => r.kind === "specialist" && r.specialist === "cloud");
    assert.equal(cloud.status, "done");
    assert.equal(cloud.durationMs, 1400);
    // specialists keep first-seen order
    const specs = rows.filter((r) => r.kind === "specialist").map((r) => r.specialist);
    assert.deepEqual(specs, ["cloud", "ai"]);
    // synthesis op is done once a terminal event exists
    assert.equal(rows.at(-1).status, "done");
  });

  it("collapses started+completed for one specialist into a single node", () => {
    const rows = buildRows([
      ev("specialist.started", { specialist: "ai" }),
      ev("specialist.completed", { specialist: "ai", durationMs: 900 }),
    ]);
    const specs = rows.filter((r) => r.kind === "specialist");
    assert.equal(specs.length, 1);
    assert.equal(specs[0].status, "done");
  });

  it("keeps a running specialist running until it completes", () => {
    const rows = buildRows([ev("specialist.started", { specialist: "product" })]);
    assert.equal(rows[0].status, "running");
  });

  it("marks a failed specialist as failed", () => {
    const rows = buildRows([
      ev("specialist.started", { specialist: "mobile" }),
      ev("specialist.failed", { specialist: "mobile", durationMs: 8000 }),
    ]);
    assert.equal(rows[0].status, "failed");
  });

  it("renders a minimal trace for a no-specialist turn", () => {
    const rows = buildRows([
      ev("request.received", { label: "Read your question" }),
      ev("synthesis.started", { label: "Composed the answer" }),
      ev("answer.completed"),
    ]);
    assert.deepEqual(rows.map((r) => r.kind), ["op", "op"]);
  });

  it("adds an amber terminal row for cancellation/failure", () => {
    const rows = buildRows([
      ev("request.received", { label: "Read your question" }),
      ev("request.cancelled", { label: "Cancelled" }),
    ]);
    const terminal = rows.at(-1);
    assert.equal(terminal.kind, "op");
    assert.equal(terminal.status, "failed");
    assert.equal(terminal.label, "Cancelled");
  });
});

describe("hasTerminalEvent", () => {
  it("is true only when a terminal event is present", () => {
    assert.equal(hasTerminalEvent([ev("synthesis.started")]), false);
    assert.equal(hasTerminalEvent([ev("answer.completed")]), true);
    assert.equal(hasTerminalEvent([ev("answer.failed")]), true);
    assert.equal(hasTerminalEvent([ev("request.cancelled")]), true);
  });
});

describe("computeReasonedSeconds", () => {
  it("computes received → terminal elapsed seconds", () => {
    const s = computeReasonedSeconds([
      ev("request.received", { timestamp: "2026-06-29T00:00:00.000Z" }),
      ev("answer.completed", { timestamp: "2026-06-29T00:00:03.500Z" }),
    ]);
    assert.equal(s, 3.5);
  });

  it("returns null when start or terminal is missing", () => {
    assert.equal(computeReasonedSeconds([ev("request.received")]), null);
    assert.equal(computeReasonedSeconds([ev("answer.completed")]), null);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/portfolio-agent-reasoning-trace.test.cjs`
Expected: FAIL — `Cannot find module '../components/portfolio-agent/reasoning-trace-rows.ts'`.

- [ ] **Step 3: Write the module**

Create `components/portfolio-agent/reasoning-trace-rows.ts`:

```ts
import type { PublicTraceEvent, Specialist } from "@/lib/ai/portfolio-agent/schemas";

export type SpecialistStatus = "running" | "done" | "failed";

export type TraceRow =
  | { kind: "op"; key: string; label: string; status: "running" | "done" | "failed" }
  | { kind: "specialist"; key: string; specialist: Specialist; status: SpecialistStatus; durationMs?: number };

export const SPECIALIST_META: Record<
  Specialist,
  { label: string; accent: string; soft: string; icon: string }
> = {
  ai: { label: "AI", accent: "#a78bfa", soft: "rgba(167,139,250,0.14)", icon: "✦" },
  cloud: { label: "Cloud", accent: "#22d3ee", soft: "rgba(34,211,238,0.14)", icon: "☁" },
  product: { label: "Product", accent: "#34d399", soft: "rgba(52,211,153,0.14)", icon: "◆" },
  mobile: { label: "Mobile", accent: "#fbbf24", soft: "rgba(251,191,36,0.14)", icon: "▣" },
};

const TERMINAL_TYPES = new Set([
  "answer.completed",
  "answer.failed",
  "request.cancelled",
]);

export function hasTerminalEvent(events: PublicTraceEvent[]): boolean {
  return events.some((e) => TERMINAL_TYPES.has(e.type));
}

export function buildRows(events: PublicTraceEvent[]): TraceRow[] {
  const rows: TraceRow[] = [];

  const received = events.find((e) => e.type === "request.received");
  if (received) rows.push({ kind: "op", key: "received", label: received.label, status: "done" });

  const classified = events.find((e) => e.type === "classification.completed");
  if (classified) rows.push({ kind: "op", key: "classified", label: classified.label, status: "done" });

  // Group specialist events by specialist, preserving first-seen order.
  const order: Specialist[] = [];
  const byId: Record<string, { status: SpecialistStatus; durationMs?: number }> = {};
  for (const e of events) {
    const sp = e.specialist;
    if (!sp) continue;
    if (!byId[sp]) {
      order.push(sp);
      byId[sp] = { status: "running" };
    }
    if (e.type === "specialist.completed") byId[sp] = { status: "done", durationMs: e.durationMs };
    else if (e.type === "specialist.failed") byId[sp] = { status: "failed", durationMs: e.durationMs };
  }
  for (const sp of order) {
    rows.push({ kind: "specialist", key: `sp-${sp}`, specialist: sp, status: byId[sp].status, durationMs: byId[sp].durationMs });
  }

  const synthesis = events.find((e) => e.type === "synthesis.started");
  if (synthesis) {
    rows.push({ kind: "op", key: "synthesis", label: synthesis.label, status: hasTerminalEvent(events) ? "done" : "running" });
  }

  const terminal = events.find((e) => e.type === "answer.failed" || e.type === "request.cancelled");
  if (terminal) {
    rows.push({ kind: "op", key: "terminal", label: terminal.label, status: "failed" });
  }

  return rows;
}

export function computeReasonedSeconds(events: PublicTraceEvent[]): number | null {
  const start = events.find((e) => e.type === "request.received");
  const end = events.find((e) => TERMINAL_TYPES.has(e.type));
  if (!start || !end) return null;
  const ms = new Date(end.timestamp).getTime() - new Date(start.timestamp).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  return ms / 1000;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/portfolio-agent-reasoning-trace.test.cjs`
Expected: PASS — all `buildRows` / `hasTerminalEvent` / `computeReasonedSeconds` tests green.

- [ ] **Step 5: Commit**

```bash
git status --short   # confirm ONLY the two new files below are staged after add
git add components/portfolio-agent/reasoning-trace-rows.ts tests/portfolio-agent-reasoning-trace.test.cjs
git commit -m "feat(agent): pure trace->rows mapping for the live-trace UI

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `<ReasoningTrace>` component

**Files:**
- Create: `components/portfolio-agent/reasoning-trace.tsx`
- Test: `tests/portfolio-agent-reasoning-trace.test.cjs` (extend with source-string guards)

- [ ] **Step 1: Write the failing source-string test**

Append to `tests/portfolio-agent-reasoning-trace.test.cjs` (after the existing `describe` blocks):

```js
const fs = require("node:fs");
const path = require("node:path");

describe("ReasoningTrace component source", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "components", "portfolio-agent", "reasoning-trace.tsx"),
    "utf8",
  );

  it("exports ReasoningTrace and consumes the pure rows module", () => {
    assert.match(source, /export function ReasoningTrace/);
    assert.match(source, /from "\.\/reasoning-trace-rows"/);
    assert.match(source, /buildRows/);
  });

  it("respects reduced motion", () => {
    assert.match(source, /reducedMotion/);
  });

  it("does not use the no-op Tailwind size-* utility (Tailwind 3.3.3)", () => {
    assert.doesNotMatch(source, /className="[^"]*\bsize-/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/portfolio-agent-reasoning-trace.test.cjs`
Expected: FAIL — `ENOENT` reading `components/portfolio-agent/reasoning-trace.tsx`.

- [ ] **Step 3: Write the component**

Create `components/portfolio-agent/reasoning-trace.tsx`:

```tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PublicTraceEvent, Specialist } from "@/lib/ai/portfolio-agent/schemas";
import {
  buildRows,
  computeReasonedSeconds,
  hasTerminalEvent,
  SPECIALIST_META,
} from "./reasoning-trace-rows";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const AMBER = "#f59e0b";

export function BrainIcon({ size = 16, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}

function WorkingDots({ accent, animate }: { accent: string; animate: boolean }) {
  return (
    <span className="flex items-center gap-[3px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ width: 3, height: 3, borderRadius: 9, background: accent }}
          animate={animate ? { opacity: [0.25, 1, 0.25], scale: [0.8, 1, 0.8] } : { opacity: 0.7 }}
          transition={animate ? { duration: 0.95, repeat: Infinity, ease: "easeInOut", delay: i * 0.16 } : undefined}
        />
      ))}
    </span>
  );
}

function OperationRow({ label, status, motionOn }: { label: string; status: "running" | "done" | "failed"; motionOn: boolean }) {
  const failed = status === "failed";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: motionOn ? 4 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE_OUT }}
      className="relative flex items-center gap-3 py-[3px]"
    >
      <span className="z-10 flex w-10 justify-center">
        {status === "running" ? (
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            {motionOn && (
              <motion.span className="absolute h-2.5 w-2.5 rounded-full bg-white/40" animate={{ scale: [1, 1.8], opacity: [0.5, 0] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }} />
            )}
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
          </span>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full ring-4 ring-[#0d0d0f]" style={{ background: failed ? AMBER : "#52525b" }} />
        )}
      </span>
      <span className="text-[13px]" style={{ color: failed ? AMBER : "#71717a" }}>{label}</span>
    </motion.li>
  );
}

function SpecialistNode({ specialist, status, durationMs, motionOn }: { specialist: Specialist; status: "running" | "done" | "failed"; durationMs?: number; motionOn: boolean }) {
  const meta = SPECIALIST_META[specialist];
  const running = status === "running";
  const failed = status === "failed";
  const accent = failed ? AMBER : meta.accent;
  return (
    <motion.li
      layout
      initial={motionOn ? { opacity: 0, x: -8, scale: 0.92, filter: "blur(3px)" } : { opacity: 0 }}
      animate={motionOn ? { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" } : { opacity: 1 }}
      transition={motionOn ? { type: "spring", duration: 0.5, bounce: 0.34 } : { duration: 0.2 }}
      className="relative flex items-center gap-3 py-[5px]"
    >
      <span className="z-10 flex w-10 justify-center">
        <span className="relative flex items-center justify-center" style={{ width: 34, height: 34 }}>
          {running && motionOn &&
            [0, 0.7].map((delay, i) => (
              <motion.span key={i} className="absolute rounded-full" style={{ width: 26, height: 26, border: `1.5px solid ${accent}` }} animate={{ scale: [1, 1.75], opacity: [0.5, 0] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut", delay }} />
            ))}
          {!running && (
            <motion.span className="absolute rounded-full" style={{ width: 30, height: 30, border: `1.5px solid ${accent}` }} initial={motionOn ? { scale: 1.3, opacity: 0 } : { opacity: 0 }} animate={{ scale: 1, opacity: failed ? 0.4 : 0.55 }} transition={{ duration: 0.4, ease: EASE_OUT }} />
          )}
          <motion.span
            className="flex items-center justify-center rounded-full ring-4 ring-[#0d0d0f]"
            style={{ width: 26, height: 26, background: `radial-gradient(circle at 32% 28%, ${accent}, ${accent}2e)`, color: "#08080a", opacity: failed ? 0.85 : 1 }}
            animate={running && motionOn ? { boxShadow: [`0 0 8px -2px ${accent}66`, `0 0 17px -1px ${accent}`, `0 0 8px -2px ${accent}66`] } : { boxShadow: `0 0 11px -3px ${accent}` }}
            transition={running && motionOn ? { duration: 1.7, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            <motion.span
              style={{ display: "flex", fontSize: 13, lineHeight: 1 }}
              animate={running && motionOn ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={running && motionOn ? { duration: 1.7, repeat: Infinity, ease: "easeInOut" } : undefined}
            >
              {meta.icon}
            </motion.span>
          </motion.span>
        </span>
      </span>

      <div className="flex items-center gap-2">
        <span className="text-[13px]">
          <span className="font-semibold" style={{ color: accent }}>{meta.label}</span>{" "}
          <span className="text-zinc-500">specialist</span>
        </span>
        {running ? (
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <WorkingDots accent={accent} animate={motionOn} />
            consulting
          </span>
        ) : failed ? (
          <span className="text-[11px]" style={{ color: AMBER }}>unavailable</span>
        ) : (
          <span className="text-[11px] tabular-nums text-zinc-500">{durationMs != null ? `${(durationMs / 1000).toFixed(1)}s` : "done"}</span>
        )}
      </div>
    </motion.li>
  );
}

export function ReasoningTrace({ events, isLatest, isStreaming, reducedMotion }: {
  events: PublicTraceEvent[];
  isLatest: boolean;
  isStreaming: boolean;
  reducedMotion: boolean;
}) {
  const done = hasTerminalEvent(events) || !isStreaming;
  const thinking = !done;
  const motionOn = !reducedMotion;

  const [collapsed, setCollapsed] = React.useState(!isLatest);
  React.useEffect(() => {
    setCollapsed(!isLatest);
  }, [isLatest]);

  // Nothing to show for an old assistant message that carries no trace.
  if (events.length === 0 && !thinking) return null;

  const rows = buildRows(events);
  const seconds = computeReasonedSeconds(events);
  const consulted = rows.flatMap((r) => (r.kind === "specialist" ? [r.specialist] : []));
  const headerLabel = thinking ? "Reasoning" : seconds != null ? `Reasoned for ${seconds.toFixed(1)}s` : "Reasoned";

  return (
    <div className="ml-6 mb-2 w-full max-w-[470px]">
      <button
        type="button"
        onClick={done ? () => setCollapsed((c) => !c) : undefined}
        className="group mb-1 flex items-center gap-2 py-0.5 text-left"
        style={{ cursor: done ? "pointer" : "default" }}
      >
        {done && (
          <motion.span animate={{ rotate: collapsed ? 0 : 90 }} transition={{ duration: 0.18, ease: EASE_OUT }} className="text-zinc-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </motion.span>
        )}
        <motion.span
          className="text-zinc-300"
          animate={thinking && motionOn ? { opacity: [0.55, 1, 0.55], scale: [1, 1.06, 1] } : { opacity: 1, scale: 1 }}
          transition={thinking && motionOn ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <BrainIcon size={17} />
        </motion.span>
        <span className={`text-[13px] font-medium ${thinking && motionOn ? "agent-trace-shimmer" : thinking ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-200"}`}>
          {headerLabel}
        </span>
        {done && collapsed && consulted.length > 0 && (
          <span className="flex items-center gap-1 pl-1">
            {consulted.map((sp) => {
              const meta = SPECIALIST_META[sp];
              return (
                <span key={sp} className="flex h-4 w-4 items-center justify-center rounded-full text-[9px]" style={{ background: meta.soft, color: meta.accent }} title={meta.label}>
                  {meta.icon}
                </span>
              );
            })}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {!(done && collapsed) && (
          <motion.div
            initial={done ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE_OUT }}
            style={{ overflow: done ? "hidden" : "visible" }}
          >
            <ol className="relative pl-1.5">
              <span aria-hidden className="absolute top-2 w-px bg-gradient-to-b from-white/12 via-white/8 to-white/4" style={{ left: 26, bottom: 8 }} />
              <AnimatePresence initial={false}>
                {rows.map((row) =>
                  row.kind === "op" ? (
                    <OperationRow key={row.key} label={row.label} status={row.status} motionOn={motionOn} />
                  ) : (
                    <SpecialistNode key={row.key} specialist={row.specialist} status={row.status} durationMs={row.durationMs} motionOn={motionOn} />
                  ),
                )}
              </AnimatePresence>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .agent-trace-shimmer {
          background: linear-gradient(110deg, #9ca3af 35%, #ffffff 50%, #9ca3af 65%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: agent-trace-shimmer 2.2s linear infinite;
        }
        @keyframes agent-trace-shimmer {
          to {
            background-position: -200% center;
          }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 4: Run the source test + typecheck**

Run: `node --test tests/portfolio-agent-reasoning-trace.test.cjs`
Expected: PASS — including the three `ReasoningTrace component source` checks.

Run: `npm run typecheck`
Expected: no errors in `components/portfolio-agent/reasoning-trace.tsx` (pre-existing project errors, if any, are unrelated — confirm none reference the new files).

- [ ] **Step 5: Commit**

```bash
git status --short
git add components/portfolio-agent/reasoning-trace.tsx tests/portfolio-agent-reasoning-trace.test.cjs
git commit -m "feat(agent): ReasoningTrace component (brain header, operations, alive specialist orbs)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Integrate into the chat

**Files:**
- Modify: `components/portfolio-agent.tsx`

- [ ] **Step 1: Add the import**

In `components/portfolio-agent.tsx`, after the existing `import ShinyText, { ShinyIcon, SPARKLES_SVG } from "./shiny-text";` line, add:

```tsx
import { ReasoningTrace } from "./portfolio-agent/reasoning-trace";
import type { PublicTraceEvent } from "@/lib/ai/portfolio-agent/schemas";
```

- [ ] **Step 2: Add the trace-extraction helper**

Immediately after the existing `getMessageText` function (it ends with `return ""; }`), add:

```tsx
  const getTraceEvents = (
    message: (typeof messages)[0],
  ): PublicTraceEvent[] =>
    Array.isArray(message.parts)
      ? message.parts
          .filter(
            (part): part is { type: "data-trace"; id: string; data: PublicTraceEvent } =>
              part.type === "data-trace",
          )
          .map((part) => part.data)
      : [];
```

- [ ] **Step 3: Replace the `messagesList` map block**

Replace the entire `const messagesList = ( ... );` block with the version below. Changes: `map((message, index) => ...)`, derive `isLast`/`isStreaming`/`traceEvents`, render `<ReasoningTrace>` for assistant messages, and only render the answer `ScrollArea` when there is text (so a trace-only in-flight message shows no empty bubble). The pre-stream `"generating…"` shimmer is kept for the brief window before the assistant message exists.

```tsx
  const messagesList = (
    <>
      {messages.map((message, index) => {
        const content = getMessageText(message);
        const isUser = message.role === "user";
        const isLast = index === messages.length - 1;
        const isStreaming =
          isLast && (status === "streaming" || status === "submitted");
        const traceEvents = isUser ? [] : getTraceEvents(message);

        return (
          <div
            key={message.id}
            className={cn(
              "mb-3 flex flex-col gap-1",
              isUser ? "items-end" : "w-fit items-start",
            )}
          >
            {isUser ? (
              <div className="flex select-none items-center gap-1 text-sm text-muted-foreground">
                <User strokeWidth="1.5" className="aspect-square w-5" />
                <span>You</span>
              </div>
            ) : (
              <div className="flex select-none items-center gap-1.5 text-sm text-white">
                <ShinyIcon
                  svg={SPARKLES_SVG}
                  size={18}
                  speed={2.4}
                  color="#9ca3af"
                  shineColor="#ffffff"
                />
                <span className="sr-only">{AI_LABEL}</span>
              </div>
            )}

            {!isUser && (
              <ReasoningTrace
                events={traceEvents}
                isLatest={isLast}
                isStreaming={isStreaming}
                reducedMotion={Boolean(prefersReducedMotion)}
              />
            )}

            {(isUser || content) && (
              <ScrollArea
                className={cn(
                  "flex max-h-[178px] flex-col gap-1 rounded-lg border",
                  isUser
                    ? "mr-6 rounded-tr-[3px] border-primary/30 bg-primary/15"
                    : "ml-6 rounded-tl-[3px] border-secondary/50 bg-secondary/40",
                )}
              >
                {isUser ? (
                  <p className="rounded-none px-4 py-2 text-xs md:text-sm text-white">
                    {content}
                  </p>
                ) : (
                  <div className="chat-markdown rounded-none px-4 py-2 text-xs md:text-sm text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        );
      })}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex items-center gap-1.5 pb-4 text-sm">
          <ShinyIcon
            svg={SPARKLES_SVG}
            size={16}
            speed={1.5}
            color="#9ca3af"
            shineColor="#ffffff"
          />
          <ShinyText
            text="generating..."
            speed={1.5}
            shineColor="#ffffff"
            color="#9ca3af"
            className="text-xs"
          />
        </div>
      )}
    </>
  );
```

- [ ] **Step 4: Typecheck + run the full suite**

Run: `npm run typecheck`
Expected: no new errors referencing `components/portfolio-agent.tsx` or the new files.

Run: `npm test`
Expected: PASS — all existing tests plus the new `portfolio-agent-reasoning-trace` tests (the `8575ce0` single-message regression guard stays green).

- [ ] **Step 5: Manual verification (real chat)**

The `.env` has working OpenAI keys + dev DB (see project memory). Start the app and exercise the live trace:

Run: `npm run dev` (if not already running), then open `http://localhost:3000`.

Verify:
1. Open the chat, ask a multi-domain question (e.g. *"How do you handle AI features and the cloud infra behind them?"*). The brain "Reasoning" header appears, then operation rows + specialist orbs animate in (radar pulse + breathing), then the answer streams below. **No empty/duplicate bubble.**
2. When it finishes, the header reads "Reasoned for Xs" and stays open; specialist orbs show durations.
3. Ask a follow-up — the previous turn's trace collapses to the pill (brain + duration + specialist dots).
4. Ask a simple question (e.g. *"How can I contact you?"*) — a minimal trace shows (no specialist orbs) and collapses to "Reasoned for ~Xs".
5. (Optional) Toggle OS "reduce motion" and confirm the orbs/pulse stop moving but the trace still renders and reads.

- [ ] **Step 6: Commit**

```bash
git status --short
git add components/portfolio-agent.tsx
git commit -m "feat(agent): render the live-trace timeline in the chat

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Remove the throwaway prototype

**Files:**
- Delete: `app/prototype/agent-trace/` (route, switcher, shared harness, variants, NOTES)

> Do this only after Task 3 is verified. The design now lives in the real component; the spec is the durable record. Do **not** touch `app/prototype/spatial/`.

- [ ] **Step 1: Confirm what will be removed**

Run: `git status --short app/prototype/`
Expected: shows `app/prototype/` untracked. Confirm `app/prototype/agent-trace/` exists and `app/prototype/spatial/` must be left alone.

- [ ] **Step 2: Delete only the agent-trace prototype**

Run: `rm -rf app/prototype/agent-trace`

- [ ] **Step 3: Verify spatial prototype is untouched + suite still green**

Run: `ls app/prototype` → expect `spatial` still present, `agent-trace` gone.
Run: `npm test` → PASS.

- [ ] **Step 4: Commit (deletion only)**

Since `agent-trace/` was never committed, deleting the files needs no git commit — they simply disappear from the working tree. Confirm with:

Run: `git status --short`
Expected: `app/prototype/agent-trace/` no longer listed; `app/prototype/spatial/` and the other spatial entries still listed as untouched. No commit required for this task.

---

## Self-Review

**1. Spec coverage:**
- Data flow off single message → Task 3 Step 2 (`getTraceEvents`) + Step 3. ✓
- `<ReasoningTrace>` component + integration → Tasks 2, 3. ✓
- `buildRows` trace→row mapping → Task 1. ✓
- Brain header / operations / specialist orbs / collapse / collapsed pill → Task 2 component. ✓
- No-specialist minimal trace → Task 1 test + `buildRows`. ✓
- Specialist failure (amber) → Task 1 + `SpecialistNode` failed branch. ✓
- `answer.failed` / `request.cancelled` terminal row → Task 1 + `OperationRow` failed. ✓
- Real timing "Reasoned for Xs" → `computeReasonedSeconds` (Task 1) used in Task 2. ✓
- Older turns collapsed, latest open → `collapsed = !isLatest` (Task 2). ✓
- Reduced motion → `motionOn` gating (Task 2) + source test (Task 2). ✓
- Empty-bubble guard during thinking → Task 3 Step 3 (`{(isUser || content) && …}`). ✓
- Tailwind 3.3 `size-*` constraint → no `size-*` in component + source-test guard (Task 2). ✓
- Cleanup / delete prototype → Task 4. ✓

**2. Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. ✓

**3. Type consistency:** `buildRows`/`hasTerminalEvent`/`computeReasonedSeconds`/`SPECIALIST_META`/`TraceRow` are defined in Task 1 and consumed with identical names/signatures in Task 2. `ReasoningTrace` props (`events`, `isLatest`, `isStreaming`, `reducedMotion`) match between Task 2 (definition) and Task 3 (call site). `getTraceEvents` returns `PublicTraceEvent[]`, the type `ReasoningTrace.events` expects. ✓
