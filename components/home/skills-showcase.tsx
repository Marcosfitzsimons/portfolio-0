import LogoLoop from "@/components/logo-loop";
import { skillGroups } from "@/lib/skills-source";
import { cn } from "@/lib/utils";
import { surfaceText } from "./section-label";

const skillLogoItems = skillGroups.flatMap((group) =>
  group.skills.map((skill) => ({
    src: skill.src,
    alt: skill.alt,
    title: skill.name,
    width: skill.width,
    height: skill.height,
  })),
);

const skillCategoryMeta = {
  Frontend: {
    className:
      "border-blue-300/15 bg-blue-300/10 text-blue-100 shadow-blue-500/10",
  },
  Backend: {
    className:
      "border-emerald-300/15 bg-emerald-300/10 text-emerald-100 shadow-emerald-500/10",
  },
  Databases: {
    className:
      "border-amber-300/15 bg-amber-300/10 text-amber-100 shadow-amber-500/10",
  },
  "AI & Automation": {
    className:
      "border-violet-300/15 bg-violet-300/10 text-violet-100 shadow-violet-500/10",
  },
  "Cloud & Infra": {
    className:
      "border-cyan-300/15 bg-cyan-300/10 text-cyan-100 shadow-cyan-500/10",
  },
} satisfies Record<string, { className: string }>;

export const SkillList = () => (
  <div className="grid gap-3 sm:grid-cols-2">
    {skillGroups.map((group) => {
      const category =
        skillCategoryMeta[group.category as keyof typeof skillCategoryMeta] ??
        skillCategoryMeta.Frontend;

      return (
        <div
          key={group.category}
          className={cn("rounded-xl border p-4", surfaceText.ink.panel)}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div
              className={cn(
                "inline-flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-lg",
                category.className,
              )}
            >
              <span aria-hidden="true" className="text-sm leading-none">
                {group.emoji}
              </span>
              <h3 className="truncate">{group.category}</h3>
            </div>
            <span className="font-mono text-xs tabular-nums text-zinc-500">
              {group.skills.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs font-medium text-zinc-100 shadow-sm backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.075]"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export const SkillsLogoBanner = () => (
  <div className="relative -mx-2 overflow-hidden px-0 py-4 sm:-mx-4">
    <LogoLoop
      logos={skillLogoItems}
      speed={72}
      direction="left"
      logoHeight={34}
      gap={44}
      hoverSpeed={14}
      scaleOnHover
      fadeOut
      fadeOutColor="rgba(5,5,5,0.92)"
      ariaLabel="All technical skill logos"
      className="w-full"
    />
  </div>
);
