import type React from "react";
import { cn } from "@/lib/utils";

export const surfaceText = {
  ink: {
    page: "bg-[#050505] text-white",
    panel: "border-[#2a2a2a] bg-[#0f0f10] text-white",
    subtle: "text-zinc-300",
    faint: "text-zinc-500",
    badge: "border-[#2d2d30] bg-[#171719] text-zinc-100",
    button: "bg-[#d6eadf] text-[#07110d] hover:bg-[#e4f4eb]",
  },
} as const;

export type Surface = keyof typeof surfaceText;

export const SectionLabel = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <div
    className={cn(
      "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-normal",
      surfaceText.ink.badge,
    )}
  >
    <span aria-hidden="true">{icon}</span>
    {children}
  </div>
);
