"use client";

import { useEffect, useState } from "react";
import type React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowUp,
  Bot,
  Briefcase,
  Calendar,
  FolderOpenDot,
  Layers3,
  Sparkles,
  UserRound,
} from "lucide-react";

import ChatBot from "@/components/chat-bot";
import LogoLoop from "@/components/logo-loop";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { ShinyIcon, SPARKLES_SVG } from "@/components/shiny-text";
import SocialLinks from "@/components/social-links";
import StarBorder from "@/components/star-border";
import PrototypeVariantSwitcher, {
  type PrototypeVariant,
} from "@/components/prototype-variant-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/project-types";
import { getProjectGradient } from "@/lib/project-gradients";
import { skillGroups } from "@/lib/skills-source";
import { cn } from "@/lib/utils";

type PrototypeAppStyleClientProps = {
  initialVariant: string;
  workProjects: Project[];
  personalProjects: Project[];
};

type Surface = "dark" | "paper" | "ink";

const variants: PrototypeVariant[] = [
  { key: "A", name: "Dark Studio" },
  { key: "B", name: "Paper Index" },
  { key: "C", name: "Command Story" },
];

const SoftAurora = dynamic(() => import("@/components/SoftAurora"), {
  ssr: false,
});

const aboutCopy =
  "Full-stack developer building web and mobile products that integrate AI, scalable cloud infrastructure, and polished product interfaces. The work is practical, reliable, and designed for real teams.";

const sidebarCopy =
  "TypeScript developer building web, mobile, cloud, and AI-powered systems for real teams.";

const projectDeckCopy: Record<string, string> = {
  "Travel Booking App":
    "Booking flow and admin surface for a tourism business, built to keep trips, content, and customer details manageable.",
  "Golfo Nuevo Admin":
    "Internal product admin for a Qi men's shop. Practical tooling, less spreadsheet drift.",
  KeySwap:
    "A piano practice tool for symmetric inversion, shaped for sessions where speed and clarity matter.",
  Claimence:
    "Coverage analysis for financial-lines claims, narrowing policy noise into decisions people can act on.",
  Brixa:
    "Hotel ops assistant that answers guest questions with property context, so staff repeat themselves less.",
  "Grab & Eat":
    "Autonomous grocery checkout: scan, purchase, leave without turning the store into a queue.",
  "Multi Step Form":
    "A polished form flow with validation and motion, useful as a small pattern library for onboarding.",
  "Feeling the Groove":
    "Personal event tracker for nights out, notes, and memories after the music fades.",
  "Rest Countries App":
    "Country browser challenge sharpened around search, filters, routing, and API state.",
};

const sectionLinks = [
  { label: "Ask", href: "#ask", icon: <Sparkles className="size-4" /> },
  {
    label: "Works",
    href: "#works",
    icon: <FolderOpenDot className="size-4" />,
  },
  { label: "Skills", href: "#skills", icon: <Layers3 className="size-4" /> },
];

const prototypeQuestion =
  "Prototype question: can a calmer background make the portfolio feel premium while keeping the project story, chat assistant, and scroll motion readable?";

const normalizeVariant = (value: string | null, fallback: string) =>
  variants.some((variant) => variant.key === value)
    ? value ?? fallback
    : fallback;

const getProjectTags = (project: Project) => project.tags?.slice(0, 4) ?? [];

const getProjectDeckCopy = (project: Project) =>
  projectDeckCopy[project.title] ?? project.description;

const combineProjects = (
  workProjects: Project[],
  personalProjects: Project[],
) => [...workProjects, ...personalProjects];

const surfaceText = {
  dark: {
    page: "bg-[#08090b] text-white",
    panel: "border-white/10 bg-[#111318] text-white",
    subtle: "text-zinc-300",
    faint: "text-zinc-400",
    badge: "border-white/10 bg-white/10 text-zinc-100",
    button: "bg-white text-zinc-950 hover:bg-zinc-200",
  },
  paper: {
    page: "bg-[#f5f5f2] text-zinc-950",
    panel: "border-zinc-200 bg-white text-zinc-950",
    subtle: "text-zinc-700",
    faint: "text-zinc-500",
    badge: "border-zinc-200 bg-zinc-100 text-zinc-900",
    button: "bg-zinc-950 text-white hover:bg-zinc-800",
  },
  ink: {
    page: "bg-[#050505] text-white",
    panel: "border-[#2a2a2a] bg-[#0f0f10] text-white",
    subtle: "text-zinc-300",
    faint: "text-zinc-500",
    badge: "border-[#2d2d30] bg-[#171719] text-zinc-100",
    button: "bg-[#d6eadf] text-[#07110d] hover:bg-[#e4f4eb]",
  },
} satisfies Record<Surface, Record<string, string>>;

const skillLogoItems = skillGroups.flatMap((group) =>
  group.skills.map((skill) => ({
    src: skill.src,
    alt: skill.alt,
    title: skill.name,
    width: skill.width,
    height: skill.height,
  })),
);

const skillLoopSurface = {
  dark: {
    frame: "border-white/10 bg-[#111318]",
    fade: "#111318",
  },
  paper: {
    frame: "border-zinc-200 bg-white",
    fade: "#ffffff",
  },
  ink: {
    frame: "border-[#2a2a2a] bg-[#101010]",
    fade: "#101010",
  },
} satisfies Record<Surface, { frame: string; fade: string }>;

const SectionLabel = ({
  children,
  surface,
  icon,
}: {
  children: React.ReactNode;
  surface: Surface;
  icon: React.ReactNode;
}) => (
  <div
    className={cn(
      "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-normal",
      surfaceText[surface].badge,
    )}
  >
    <span aria-hidden="true">{icon}</span>
    {children}
  </div>
);

const ProjectVisual = ({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) => (
  <div
    className={cn(
      "min-h-48 relative overflow-hidden rounded-xl bg-zinc-900",
      className,
    )}
  >
    {project.coverImageSm ? (
      <Image
        alt={project.title}
        src={project.coverImageSm}
        fill
        sizes="(min-width: 1024px) 520px, 100vw"
        className="object-cover"
      />
    ) : (
      <div
        className="size-full min-h-48 flex items-center justify-center"
        style={{ background: getProjectGradient(project.title) }}
      >
        <span className="max-w-xs px-5 text-center text-3xl font-semibold text-white">
          {project.title}
        </span>
      </div>
    )}
    {project.status === "live" && (
      <Badge className="absolute right-3 top-3 border-emerald-700 bg-emerald-100 text-emerald-950 hover:bg-emerald-100">
        Live
      </Badge>
    )}
  </div>
);

const ProjectMeta = ({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) => (
  <div className={cn("flex flex-wrap items-center gap-3 text-xs", className)}>
    {project.year && (
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="size-3.5" />
        {project.year}
      </span>
    )}
    <span>{project.isPersonal ? "Exploration" : "Client Work"}</span>
  </div>
);

const ProjectTags = ({
  project,
  surface,
}: {
  project: Project;
  surface: Surface;
}) => {
  const tags = getProjectTags(project);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className={cn("rounded-full", surfaceText[surface].badge)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
};

const ProjectStackCard = ({
  project,
  index,
  surface,
  layout = "split",
  density = "standard",
  scrollMode = "window",
  isLast = false,
}: {
  project: Project;
  index: number;
  surface: Surface;
  layout?: "split" | "editorial";
  density?: "standard" | "compact";
  scrollMode?: "window" | "contained";
  isLast?: boolean;
}) => {
  const isPaper = surface === "paper";
  const isCompact = density === "compact";
  const isContained = scrollMode === "contained";

  return (
    <ScrollStackItem
      itemClassName={cn(
        "!h-auto !rounded-2xl !p-0",
        isContained
          ? cn("!mt-0 !min-h-[29rem]", isLast ? "!mb-0" : "!mb-28")
          : isCompact
            ? "!mb-10 !mt-0 !min-h-[22rem]"
            : "!min-h-[30rem]",
        "overflow-hidden border shadow-2xl",
        surfaceText[surface].panel,
        isPaper ? "shadow-zinc-300/50" : "shadow-black/45",
      )}
    >
      <article
        className={cn(
          "grid gap-0 lg:grid-cols-[0.9fr_1.1fr]",
          isContained
            ? "min-h-[29rem]"
            : isCompact
              ? "min-h-[22rem]"
              : "min-h-[30rem]",
        )}
      >
        <ProjectVisual
          project={project}
          className={cn(
            isContained
              ? "min-h-52 rounded-none lg:min-h-full"
              : isCompact
              ? "min-h-48 rounded-none lg:min-h-full"
              : "min-h-64 rounded-none lg:min-h-full",
            layout === "editorial" && "lg:order-2",
          )}
        />
        <div
          className={cn(
            "flex min-w-0 flex-col justify-between",
            isCompact ? "gap-6 p-5 sm:p-6" : "gap-8 p-6 sm:p-8",
          )}
        >
          <div className={cn("flex flex-col", isCompact ? "gap-4" : "gap-5")}>
            <div className="flex items-start justify-between gap-4">
              <ProjectMeta
                project={project}
                className={surfaceText[surface].faint}
              />
              <span
                className={cn(
                  "font-mono text-sm tabular-nums",
                  surfaceText[surface].faint,
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <h3
                className={cn(
                  "text-balance font-semibold leading-tight",
                  isCompact ? "text-2xl sm:text-4xl" : "text-3xl sm:text-5xl",
                )}
              >
                {project.title}
              </h3>
              <p
                className={cn(
                  "text-pretty max-w-2xl leading-7",
                  isCompact ? "line-clamp-3 text-sm" : "text-base",
                  surfaceText[surface].subtle,
                )}
              >
                {getProjectDeckCopy(project)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <ProjectTags project={project} surface={surface} />
            <Button
              asChild
              className={cn("w-fit", surfaceText[surface].button)}
            >
              <Link href={`/works/${project.id}`}>
                View Project
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </ScrollStackItem>
  );
};

const ProjectStack = ({
  projects,
  surface,
  layout = "split",
  density = "standard",
  scrollMode = "window",
}: {
  projects: Project[];
  surface: Surface;
  layout?: "split" | "editorial";
  density?: "standard" | "compact";
  scrollMode?: "window" | "contained";
}) => (
  <ScrollStack
    useWindowScroll={scrollMode === "window"}
    itemDistance={
      scrollMode === "contained" ? 112 : density === "compact" ? 40 : 110
    }
    itemStackDistance={density === "compact" ? 16 : 28}
    itemScale={density === "compact" ? 0.012 : 0.018}
    baseScale={density === "compact" ? 0.94 : 0.9}
    stackPosition={
      scrollMode === "contained" ? "5%" : density === "compact" ? "12%" : "14%"
    }
    scaleEndPosition={
      scrollMode === "contained" ? "2%" : density === "compact" ? "6%" : "7%"
    }
    className={cn(
      scrollMode === "contained"
        ? "h-[56vh] max-h-[36rem] min-h-[30rem] overflow-x-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        : "overflow-visible",
    )}
    innerClassName={cn(
      "scroll-stack-inner px-0",
      scrollMode === "contained"
        ? "min-h-full pb-8 pt-0"
        : density === "compact"
          ? "min-h-screen pb-24 pt-8 sm:pb-32 sm:pt-12"
          : "min-h-screen pb-[42rem] pt-8 sm:pt-12",
    )}
  >
    {projects.map((project, index) => (
      <ProjectStackCard
        key={`${project.id}-${project.isPersonal ? "personal" : "work"}`}
        project={project}
        index={index}
        surface={surface}
        layout={layout}
        density={density}
        scrollMode={scrollMode}
        isLast={index === projects.length - 1}
      />
    ))}
  </ScrollStack>
);

const ProjectArchive = ({
  projects,
  surface,
}: {
  projects: Project[];
  surface: Surface;
}) => {
  if (projects.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((project) => (
        <Link
          key={`${project.id}-${project.isPersonal ? "personal" : "work"}-archive`}
          href={`/works/${project.id}`}
          className={cn(
            "group flex min-w-0 items-center justify-between gap-4 rounded-xl border p-4 transition-colors hover:border-[#b7c8ff]/50 hover:bg-[#171719] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6eadf]",
            surfaceText[surface].panel,
          )}
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {project.title}
            </div>
            <div className={cn("mt-1 text-xs", surfaceText[surface].faint)}>
              {project.isPersonal ? "Lab" : "Client"}{" "}
              {project.year ? `· ${project.year}` : ""}
            </div>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-[#d6eadf] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
};

const SkillList = ({ surface }: { surface: Surface }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {skillGroups.map((group) => (
      <div
        key={group.category}
        className={cn("rounded-xl border p-4", surfaceText[surface].panel)}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{group.category}</h3>
          <span
            className={cn(
              "font-mono text-xs tabular-nums",
              surfaceText[surface].faint,
            )}
          >
            {group.skills.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {group.skills.map((skill) => (
            <span
              key={skill.name}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium",
                surfaceText[surface].badge,
              )}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const SkillsLogoBanner = ({ surface }: { surface: Surface }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-2xl border px-0 py-5",
      skillLoopSurface[surface].frame,
    )}
  >
    <LogoLoop
      logos={skillLogoItems}
      speed={72}
      direction="left"
      logoHeight={34}
      gap={44}
      hoverSpeed={14}
      scaleOnHover
      fadeOut
      fadeOutColor={skillLoopSurface[surface].fade}
      ariaLabel="All technical skill logos"
      className="w-full"
    />
  </div>
);

const ChatPanel = ({
  surface,
  title,
  compact = false,
}: {
  surface: Surface;
  title: string;
  compact?: boolean;
}) => (
  <section
    className={cn(
      "rounded-2xl border p-4",
      compact
        ? "flex flex-col gap-4"
        : "grid gap-5 lg:grid-cols-[0.75fr_1.25fr]",
      surfaceText[surface].panel,
    )}
  >
    <div className="flex min-w-0 flex-col gap-3">
      <SectionLabel surface={surface} icon={<Bot className="size-3.5" />}>
        Assistant
      </SectionLabel>
      <h2 className="text-balance text-2xl font-semibold">{title}</h2>
      <p className={cn("text-sm leading-6", surfaceText[surface].subtle)}>
        The chat stays visible as part of the portfolio story instead of being
        an afterthought below the fold.
      </p>
    </div>
    <div className="min-w-0 self-center">
      <ChatBot />
    </div>
  </section>
);

const CommandChatPanel = () => (
  <StarBorder
    as="section"
    color="#d7c8ff"
    speed="6s"
    thickness={2}
    className="block w-full"
    innerClassName="flex flex-col gap-5 p-5 text-left !border-[#2a2a2a] !bg-[#0f0f10] !bg-none"
  >
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      <ShinyIcon
        svg={SPARKLES_SVG}
        size={14}
        speed={2.4}
        color="#a1a1aa"
        shineColor="#d7c8ff"
      />
      <span>ask marcos</span>
    </div>

    <div className="flex flex-col gap-2">
      <h2 className="text-balance text-2xl font-semibold leading-tight text-white">
        Skip the scroll. Just ask.
      </h2>
      <p className="text-sm leading-6 text-zinc-400">
        Trained on this portfolio. Ask about projects, stack, experience, or
        whether I am available for the next build.
      </p>
    </div>

    <ChatBot />
  </StarBorder>
);

const SectionNavigation = ({ compact = false }: { compact?: boolean }) => (
  <nav
    aria-label="Page sections"
    className={cn(compact ? "grid grid-cols-3 gap-2" : "flex flex-col gap-2")}
  >
    {sectionLinks.map((sectionLink) => (
      <a
        key={sectionLink.href}
        href={sectionLink.href}
        className={cn(
          "flex items-center justify-between rounded-xl border border-[#303030] bg-[#171719] font-medium text-zinc-100 transition-colors hover:border-[#b7c8ff]/50 hover:bg-[#1d1d20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6eadf]",
          compact ? "px-3 py-2 text-xs" : "px-3 py-2 text-sm",
        )}
      >
        <span className="flex items-center gap-2">
          {sectionLink.icon}
          {sectionLink.label}
        </span>
        {!compact && <ArrowUpRight className="size-3.5" />}
      </a>
    ))}
  </nav>
);

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 520);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "size-11 fixed bottom-4 right-4 z-40 flex items-center justify-center rounded-full border border-[#303030] bg-[#d6eadf] text-[#07110d] shadow-2xl shadow-black/40 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
};

const MobileSectionNav = () => (
  <div className="sticky top-3 z-30 lg:hidden">
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#101010]/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <SectionNavigation compact />
    </div>
  </div>
);

const VariantShell = ({
  children,
  current,
  surface,
  background,
}: {
  children: React.ReactNode;
  current: string;
  surface: Surface;
  background?: React.ReactNode;
}) => (
  <>
    <div
      className={cn("fixed inset-0 -z-[9]", surfaceText[surface].page)}
      aria-hidden="true"
    >
      {background}
    </div>
    <main
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2 px-4 pb-40 pt-8 sm:px-6 lg:px-8",
        surfaceText[surface].page,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
        {children}
      </div>
    </main>
    <PrototypeVariantSwitcher variants={variants} current={current} />
  </>
);

const ChosenVariantShell = ({
  children,
  current,
}: {
  children: React.ReactNode;
  current: string;
}) => (
  <>
    <div
      className={cn("fixed inset-0 -z-[9]", surfaceText.ink.page)}
      aria-hidden="true"
    >
      <CommandBackground />
    </div>
    <main
      id="top"
      className="relative left-1/2 w-screen -translate-x-1/2 px-4 pb-40 pt-8 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-14">
        <MobileSectionNav />
        {children}
      </div>
    </main>
    <BackToTopButton />
    <PrototypeVariantSwitcher variants={variants} current={current} />
  </>
);

const DarkStudioBackground = () => (
  <div className="absolute inset-0 bg-[linear-gradient(#15171c_1px,transparent_1px),linear-gradient(90deg,#15171c_1px,transparent_1px)] bg-[size:72px_72px]" />
);

const PaperBackground = () => (
  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,24,27,0.05)_1px,transparent_1px),linear-gradient(rgba(24,24,27,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
);

const CommandBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#050505]">
    <div className="absolute inset-0 opacity-75">
      <SoftAurora
        speed={0.34}
        scale={1.25}
        brightness={0.72}
        color1="#d6eadf"
        color2="#d8c7ff"
        noiseFrequency={2.1}
        noiseAmplitude={0.82}
        bandHeight={0.48}
        bandSpread={0.62}
        octaveDecay={0.18}
        layerOffset={0.45}
        colorSpeed={0.45}
        enableMouseInteraction={false}
        mouseInfluence={0.08}
      />
    </div>
    <div className="bg-[#050505]/78 absolute inset-0 backdrop-blur-[1px]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(5,5,5,0.35)_38%,#050505_82%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(215,200,255,0.025)_1px,transparent_1px),linear-gradient(rgba(214,234,223,0.02)_1px,transparent_1px)] bg-[size:96px_96px]" />
  </div>
);

const VariantA = ({
  workProjects,
  personalProjects,
  current,
}: PrototypeAppStyleClientProps & { current: string }) => {
  const projects = combineProjects(workProjects, personalProjects).slice(0, 9);

  return (
    <VariantShell
      current={current}
      surface="dark"
      background={<DarkStudioBackground />}
    >
      <header className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div className="flex flex-col gap-5">
          <SectionLabel surface="dark" icon={<Sparkles className="size-3.5" />}>
            Variant A - Dark Studio
          </SectionLabel>
          <div className="flex flex-col gap-3">
            <h1 className="text-balance max-w-4xl text-4xl font-semibold leading-none sm:text-6xl">
              Calm dark portfolio, readable by default.
            </h1>
            <p className="text-pretty max-w-2xl text-lg leading-8 text-zinc-300">
              {prototypeQuestion}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111318] p-5">
          <p className="text-pretty text-base leading-7 text-zinc-200">
            {aboutCopy}
          </p>
        </div>
      </header>
      <ChatPanel surface="dark" title="Ask about the work before scrolling." />
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <SectionLabel
            surface="dark"
            icon={<Briefcase className="size-3.5" />}
          >
            Projects
          </SectionLabel>
          <h2 className="text-balance text-4xl font-semibold">
            Every project gets a full, readable card.
          </h2>
        </div>
        <ProjectStack projects={projects} surface="dark" />
      </section>
      <section className="flex flex-col gap-6">
        <SectionLabel surface="dark" icon={<Layers3 className="size-3.5" />}>
          Skills
        </SectionLabel>
        <SkillList surface="dark" />
        <SkillsLogoBanner surface="dark" />
      </section>
    </VariantShell>
  );
};

const VariantB = ({
  workProjects,
  personalProjects,
  current,
}: PrototypeAppStyleClientProps & { current: string }) => {
  const projects = combineProjects(workProjects, personalProjects).slice(0, 8);

  return (
    <VariantShell
      current={current}
      surface="paper"
      background={<PaperBackground />}
    >
      <header className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-stretch">
        <div className="min-h-80 flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-950 p-6 text-white">
          <SectionLabel surface="dark" icon={<Sparkles className="size-3.5" />}>
            Variant B - Paper Index
          </SectionLabel>
          <div className="flex flex-col gap-3">
            <h1 className="text-balance text-5xl font-semibold leading-none">
              Light page, black ink, no visual fight.
            </h1>
            <p className="text-pretty text-sm leading-6 text-zinc-300">
              A light system tests whether the portfolio should leave the dark
              neon world entirely.
            </p>
          </div>
        </div>
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col justify-between gap-5">
            <p className="text-pretty text-xl font-medium leading-8 text-zinc-950">
              {aboutCopy}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["4+", "Years"],
                ["AI", "Products"],
                ["Cloud", "Infra"],
              ].map(([value, caption]) => (
                <div
                  key={value}
                  className="rounded-xl border border-zinc-200 p-3"
                >
                  <div className="text-xl font-semibold">{value}</div>
                  <div className="text-xs text-zinc-500">{caption}</div>
                </div>
              ))}
            </div>
          </div>
          <ChatPanel
            surface="paper"
            title="Chat as a portfolio entry point."
            compact
          />
        </div>
      </header>
      <section className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <SectionLabel
              surface="paper"
              icon={<Briefcase className="size-3.5" />}
            >
              Project Stack
            </SectionLabel>
            <p className="mt-4 text-sm leading-6 text-zinc-700">
              The scroll stack becomes the main artifact. The background stays
              quiet so project copy and images are the focus.
            </p>
          </div>
        </aside>
        <ProjectStack projects={projects} surface="paper" layout="editorial" />
      </section>
    </VariantShell>
  );
};

const VariantC = ({
  workProjects,
  personalProjects,
  current,
}: PrototypeAppStyleClientProps & { current: string }) => {
  const projects = combineProjects(workProjects, personalProjects).slice(0, 9);
  const featuredProjects = projects.slice(0, 5);
  const archiveProjects = projects.slice(5);

  return (
    <ChosenVariantShell current={current}>
      <div className="grid gap-8 lg:grid-cols-[19rem_1fr]">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
          <div className="flex flex-col gap-5 border-y border-white/10 py-6">
            <SectionLabel
              surface="ink"
              icon={<UserRound className="size-3.5" />}
            >
              Marcos Valentín Fitzsimons
            </SectionLabel>
            <div>
              <h1 className="text-balance text-4xl font-semibold leading-tight">
                Full-stack products, from interface to infrastructure.
              </h1>
              <p className="text-pretty mt-4 text-sm leading-6 text-zinc-400">
                {sidebarCopy}
              </p>
            </div>
            <div className="flex flex-col">
              {["4+ years shipping", "Web / Mobile", "AI / Cloud"].map(
                (item) => (
                  <div
                    key={item}
                    className="border-t border-white/10 px-1 py-3 text-xs uppercase tracking-normal text-zinc-500"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="mt-5 border-b border-white/10 pb-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-normal text-zinc-500">
              Elsewhere
            </div>
            <SocialLinks />
          </div>
        </aside>
        <main className="flex min-w-0 flex-col gap-8">
          <section id="ask" className="scroll-mt-24">
            <CommandChatPanel />
          </section>
          <section id="works" className="flex scroll-mt-24 flex-col gap-6">
            <div>
              <SectionLabel
                surface="ink"
                icon={<FolderOpenDot className="size-3.5" />}
              >
                Works
              </SectionLabel>
              <h2 className="text-balance mt-4 max-w-2xl text-4xl font-semibold leading-tight">
                Selected projects.
              </h2>
              <p className="text-pretty mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                A short, scrollable look at the work worth opening first.
              </p>
            </div>
            <ProjectStack
              projects={featuredProjects}
              surface="ink"
              density="compact"
              scrollMode="contained"
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-normal text-zinc-400">
                  More Works
                </h3>
                <span className="font-mono text-xs tabular-nums text-zinc-600">
                  {archiveProjects.length}
                </span>
              </div>
              <ProjectArchive projects={archiveProjects} surface="ink" />
            </div>
          </section>
          <section id="skills" className="flex scroll-mt-24 flex-col gap-6">
            <SectionLabel surface="ink" icon={<Layers3 className="size-3.5" />}>
              Skills
            </SectionLabel>
            <SkillList surface="ink" />
            <SkillsLogoBanner surface="ink" />
          </section>
        </main>
      </div>
    </ChosenVariantShell>
  );
};

export default function PrototypeAppStyleClient({
  initialVariant,
  workProjects,
  personalProjects,
}: PrototypeAppStyleClientProps) {
  const searchParams = useSearchParams();
  const current = normalizeVariant(
    searchParams?.get("variant") ?? null,
    initialVariant,
  );

  if (current === "B") {
    return (
      <VariantB
        initialVariant={initialVariant}
        workProjects={workProjects}
        personalProjects={personalProjects}
        current={current}
      />
    );
  }

  if (current === "C") {
    return (
      <VariantC
        initialVariant={initialVariant}
        workProjects={workProjects}
        personalProjects={personalProjects}
        current={current}
      />
    );
  }

  return (
    <VariantA
      initialVariant={initialVariant}
      workProjects={workProjects}
      personalProjects={personalProjects}
      current={current}
    />
  );
}
