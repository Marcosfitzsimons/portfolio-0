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
