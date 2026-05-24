"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Calendar,
  FolderOpenDot,
  Layers3,
  MapPin,
  MessageCircle,
  Sparkles,
  Terminal,
  UserRound,
} from "lucide-react";

import ChatBot from "@/components/chat-bot";
import LogoLoop from "@/components/logo-loop";
import PrototypeVariantSwitcher, {
  type PrototypeVariant,
} from "@/components/prototype-variant-switcher";
import { ShinyIcon, SPARKLES_SVG } from "@/components/shiny-text";
import StarBorder from "@/components/star-border";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/project-types";
import { skillGroups } from "@/lib/skills-source";
import { cn } from "@/lib/utils";

type PrototypeAppStyleCDirectionsClientProps = {
  initialVariant: string;
  workProjects: Project[];
  personalProjects: Project[];
};

const variants: PrototypeVariant[] = [
  { key: "A", name: "Case File" },
  { key: "B", name: "Command Desk" },
  { key: "C", name: "Soft Gallery" },
];

const profileLine =
  "Full-stack developer building TypeScript products across web, mobile, cloud, and AI.";

const projectCopy: Record<string, string> = {
  "Travel Booking App":
    "Tourism booking flow plus admin tools, built for fewer manual steps and cleaner trip operations.",
  "Golfo Nuevo Admin":
    "Inventory and product control for a local shop, replacing scattered updates with one clear surface.",
  KeySwap:
    "A piano practice tool for symmetric inversion, shaped around fast sessions and low friction.",
  Claimence:
    "Claims coverage analysis that turns policy context into sharper decisions for financial lines teams.",
  Brixa:
    "Hotel operations assistant that answers guest questions with property-specific context.",
  "Grab & Eat":
    "Autonomous grocery checkout: scan, purchase, and leave without turning the store into a queue.",
  "Multi Step Form":
    "A polished onboarding flow with validation, motion, and calm step-by-step pacing.",
  "Feeling the Groove":
    "Personal event tracker for nights out, notes, and memories after the music fades.",
  "Rest Countries App":
    "Country browser challenge focused on search, filters, routing, and API state.",
};

const skillLogoItems = skillGroups.flatMap((group) =>
  group.skills.map((skill) => ({
    src: skill.src,
    alt: skill.alt,
    title: skill.name,
    width: skill.width,
    height: skill.height,
  })),
);

const normalizeVariant = (value: string | null, fallback: string) =>
  variants.some((variant) => variant.key === value)
    ? value ?? fallback
    : fallback;

const combineProjects = (
  workProjects: Project[],
  personalProjects: Project[],
) => [...workProjects, ...personalProjects];

const projectBlurb = (project: Project) =>
  projectCopy[project.title] ?? project.description;

const projectTags = (project: Project, count = 3) =>
  project.tags?.slice(0, count) ?? [];

const ProjectImage = ({
  project,
  className,
  priority = false,
  minHeight = "12rem",
}: {
  project: Project;
  className?: string;
  priority?: boolean;
  minHeight?: string;
}) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950",
      className,
    )}
    style={{ minHeight }}
  >
    {project.coverImageSm ? (
      <Image
        alt={project.title}
        src={project.coverImageSm}
        fill
        sizes="(min-width: 1024px) 520px, 100vw"
        priority={priority}
        className="object-cover"
      />
    ) : (
      <div className="size-full min-h-48 flex items-center justify-center bg-zinc-900 px-6 text-center text-xl font-semibold text-white">
        {project.title}
      </div>
    )}
  </div>
);

const Kicker = ({
  children,
  icon,
  className,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-normal",
      className,
    )}
  >
    <span aria-hidden="true">{icon}</span>
    {children}
  </div>
);

const ChatCard = ({ tone = "dark" }: { tone?: "dark" | "paper" }) => (
  <StarBorder
    as="section"
    color={tone === "paper" ? "#b7c8ff" : "#d8c7ff"}
    speed="7s"
    thickness={2}
    className="block w-full"
    innerClassName={cn(
      "flex flex-col gap-5 p-5 text-left !bg-none",
      tone === "paper"
        ? "!border-[#d8d6cc] !bg-[#fbfaf5] text-[#181713]"
        : "!border-white/10 !bg-[#101011] text-white",
    )}
  >
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      <ShinyIcon
        svg={SPARKLES_SVG}
        size={14}
        speed={2.4}
        color="#a1a1aa"
        shineColor={tone === "paper" ? "#6d7df7" : "#d8c7ff"}
      />
      <span>ask marcos</span>
    </div>
    <div className="flex flex-col gap-2">
      <h2 className="text-balance text-2xl font-semibold leading-tight">
        Ask about the work, not the buzzwords.
      </h2>
      <p
        className={cn(
          "text-sm leading-6",
          tone === "paper" ? "text-zinc-600" : "text-zinc-400",
        )}
      >
        Projects, tradeoffs, stack, availability. Short answers first; detail
        when you need it.
      </p>
    </div>
    <ChatBot />
  </StarBorder>
);

const SkillStrip = ({ tone = "dark" }: { tone?: "dark" | "paper" }) => (
  <section
    className={cn(
      "overflow-hidden rounded-xl border py-5",
      tone === "paper"
        ? "border-[#dedbd0] bg-[#fbfaf5]"
        : "border-white/10 bg-[#101011]",
    )}
  >
    <LogoLoop
      logos={skillLogoItems}
      speed={70}
      direction="left"
      logoHeight={32}
      gap={42}
      hoverSpeed={14}
      scaleOnHover
      fadeOut
      fadeOutColor={tone === "paper" ? "#fbfaf5" : "#101011"}
      ariaLabel="All technical skill logos"
      className="w-full"
    />
  </section>
);

const Shell = ({
  children,
  current,
  className,
}: {
  children: React.ReactNode;
  current: string;
  className: string;
}) => (
  <>
    <main
      className={cn(
        "relative left-1/2 min-h-screen w-screen -translate-x-1/2 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </main>
    <PrototypeVariantSwitcher variants={variants} current={current} />
  </>
);

const VariantCaseFile = ({
  projects,
  current,
}: {
  projects: Project[];
  current: string;
}) => {
  const featured = projects.slice(0, 4);
  const archive = projects.slice(4, 9);

  return (
    <Shell current={current} className="bg-[#060606] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[19rem_1fr]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="border-white/12 flex flex-col gap-5 border-y py-6">
            <Kicker
              icon={<UserRound className="size-3.5" />}
              className="border-white/10 bg-white/[0.04] text-zinc-200"
            >
              Marcos Fitzsimons
            </Kicker>
            <div>
              <h1 className="text-balance text-4xl font-semibold leading-tight">
                Product engineering with a paper trail.
              </h1>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                {profileLine} The shape here is slower, more edited, and less
                template.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center lg:grid-cols-1 lg:text-left">
              {["4+ years", "React / Native", "AWS / AI"].map((item) => (
                <div
                  key={item}
                  className="border-t border-white/10 px-1 py-3 text-xs uppercase tracking-normal text-zinc-500"
                >
                  {item}
                </div>
              ))}
            </div>
            <ChatCard />
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-6">
          <header className="border-b border-white/10 pb-6">
            <Kicker
              icon={<FolderOpenDot className="size-3.5" />}
              className="bg-[#d8c7ff]/8 border-[#d8c7ff]/20 text-[#ddd4ff]"
            >
              Case File
            </Kicker>
            <h2 className="text-balance mt-5 max-w-3xl text-4xl font-semibold leading-[0.98] sm:text-5xl">
              Four selected builds, treated like evidence.
            </h2>
          </header>

          <div className="divide-y divide-white/10">
            {featured.map((project, index) => (
              <article
                key={project.id}
                className="grid min-w-0 gap-5 py-7 lg:grid-cols-[8rem_minmax(0,1fr)] lg:items-start"
              >
                <div className="flex gap-4 text-xs text-zinc-500 lg:flex-col lg:gap-2">
                  <span className="font-mono tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{project.isPersonal ? "Lab" : "Client"}</span>
                  {project.year && <span>{project.year}</span>}
                </div>
                <div className="min-w-0">
                  <h3 className="text-balance text-3xl font-semibold">
                    {project.title}
                  </h3>
                  <p className="text-pretty mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                    {projectBlurb(project)}
                  </p>
                  <Button
                    asChild
                    className="mt-5 w-fit bg-[#f4f0e8] text-zinc-950 hover:bg-white"
                  >
                    <Link href={`/works/${project.id}`}>
                      View Case
                      <ArrowUpRight />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <section className="grid gap-3 sm:grid-cols-2">
            {archive.map((project) => (
              <Link
                key={project.id}
                href={`/works/${project.id}`}
                className="group flex items-center justify-between gap-4 border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-[#d8c7ff]/30 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8c7ff]"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {project.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {project.isPersonal ? "Lab" : "Client"}
                  </div>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-[#d8c7ff]" />
              </Link>
            ))}
          </section>
          <SkillStrip />
        </section>
      </div>
    </Shell>
  );
};

const VariantCommandDesk = ({
  projects,
  current,
}: {
  projects: Project[];
  current: string;
}) => {
  const hero = projects[0];
  const active = projects.slice(1, 5);
  const labs = projects.slice(5, 9);

  return (
    <Shell
      current={current}
      className="bg-[#070809] text-white [background-image:linear-gradient(90deg,rgba(183,200,255,0.055)_1px,transparent_1px),linear-gradient(rgba(214,234,223,0.04)_1px,transparent_1px)] [background-size:80px_80px]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-xl border border-white/10 bg-[#101113]/95 p-6 shadow-2xl shadow-black/30">
            <Kicker
              icon={<Terminal className="size-3.5" />}
              className="border-[#d6eadf]/25 bg-[#d6eadf]/10 text-[#d6eadf]"
            >
              Command Desk
            </Kicker>
            <h1 className="text-balance mt-5 max-w-4xl text-6xl font-semibold leading-[0.95]">
              A portfolio that behaves more like a workspace.
            </h1>
            <p className="text-pretty mt-5 max-w-2xl text-base leading-7 text-zinc-400">
              Less scrolling museum, more working surface. Ask, inspect, jump
              into the strongest builds.
            </p>
          </section>
          <ChatCard />
        </header>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-xl border border-white/10 bg-[#101113]/95 p-4">
            <div className="flex items-center justify-between gap-4">
              <Kicker
                icon={<FolderOpenDot className="size-3.5" />}
                className="border-white/10 bg-white/[0.04] text-zinc-300"
              >
                Focus
              </Kicker>
              <span className="font-mono text-xs text-zinc-600">01</span>
            </div>
            <ProjectImage
              project={hero}
              priority
              minHeight="18rem"
              className="mt-5 rounded-md"
            />
            <h2 className="text-balance mt-5 text-4xl font-semibold">
              {hero.title}
            </h2>
            <p className="text-pretty mt-3 text-sm leading-6 text-zinc-400">
              {projectBlurb(hero)}
            </p>
            <Button
              asChild
              className="mt-5 bg-[#d6eadf] text-[#07110d] hover:bg-[#e4f4eb]"
            >
              <Link href={`/works/${hero.id}`}>
                Open Project
                <ArrowUpRight />
              </Link>
            </Button>
          </article>

          <div className="grid gap-5">
            <section className="rounded-xl border border-white/10 bg-[#101113]/95 p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-normal text-zinc-400">
                  Active Builds
                </h2>
                <span className="font-mono text-xs tabular-nums text-zinc-600">
                  {active.length}
                </span>
              </div>
              <div className="grid gap-3">
                {active.map((project) => (
                  <Link
                    key={project.id}
                    href={`/works/${project.id}`}
                    className="hover:border-[#d6eadf]/35 group grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6eadf] sm:grid-cols-[7rem_1fr_auto] sm:items-center"
                  >
                    <ProjectImage project={project} minHeight="6rem" />
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold">
                        {project.title}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                        {projectBlurb(project)}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-[#d6eadf]" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              {labs.map((project) => (
                <Link
                  key={project.id}
                  href={`/works/${project.id}`}
                  className="rounded-xl border border-white/10 bg-[#101113]/95 p-4 transition-colors hover:border-[#b7c8ff]/40 hover:bg-[#15161a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7c8ff]"
                >
                  <div className="text-xs uppercase tracking-normal text-zinc-500">
                    {project.isPersonal ? "Lab" : "Client"}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <h3 className="truncate text-sm font-semibold">
                      {project.title}
                    </h3>
                    <ArrowUpRight className="size-4 shrink-0 text-[#b7c8ff]" />
                  </div>
                </Link>
              ))}
            </section>
          </div>
        </section>

        <SkillStrip />
      </div>
    </Shell>
  );
};

const VariantSoftGallery = ({
  projects,
  current,
}: {
  projects: Project[];
  current: string;
}) => {
  const featured = projects.slice(0, 3);
  const rest = projects.slice(3, 9);

  return (
    <Shell current={current} className="bg-[#f4f1ea] text-[#1d1a15]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="grid gap-6 border-b border-[#d8d2c3] pb-8 lg:grid-cols-[1fr_21rem] lg:items-end">
          <div>
            <Kicker
              icon={<MapPin className="size-3.5" />}
              className="border-[#d8d2c3] bg-[#fffaf0] text-[#5d574b]"
            >
              Argentina / Remote
            </Kicker>
            <h1 className="text-balance mt-6 max-w-5xl text-7xl font-semibold leading-[0.9]">
              Minimal, warmer, built around the work.
            </h1>
            <p className="text-pretty mt-6 max-w-2xl text-base leading-7 text-[#625d53]">
              Same Variant C intent, but less command-center black. More space,
              warmer surfaces, and fewer boxes competing for attention.
            </p>
          </div>
          <ChatCard tone="paper" />
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {featured.map((project, index) => (
            <article
              key={project.id}
              className={cn(
                "overflow-hidden rounded-xl border border-[#d8d2c3] bg-[#fbfaf5]",
                index === 0 && "lg:col-span-2",
              )}
            >
              <ProjectImage
                project={project}
                priority={index === 0}
                minHeight={index === 0 ? "20rem" : "13rem"}
                className="rounded-none border-0"
              />
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-[#777064]">
                  <Calendar className="size-3.5" />
                  <span>{project.year ?? "Selected"}</span>
                  <span>{project.isPersonal ? "Lab" : "Client"}</span>
                </div>
                <h2 className="text-balance text-3xl font-semibold">
                  {project.title}
                </h2>
                <p className="text-pretty mt-3 text-sm leading-6 text-[#625d53]">
                  {projectBlurb(project)}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {projectTags(project).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full border-[#d8d2c3] bg-[#fffaf0] text-[#49443b]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((project) => (
            <Link
              key={project.id}
              href={`/works/${project.id}`}
              className="group min-w-0 rounded-xl border border-[#d8d2c3] bg-[#fbfaf5] p-4 transition-colors hover:border-[#9fa8da] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fa8da]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="truncate text-lg font-semibold">
                  {project.title}
                </h3>
                <ArrowUpRight className="size-4 shrink-0 text-[#6f79d8] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#625d53]">
                {projectBlurb(project)}
              </p>
            </Link>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-[#d8d2c3] bg-[#fbfaf5] p-5">
            <Kicker
              icon={<MessageCircle className="size-3.5" />}
              className="border-[#d8d2c3] bg-[#fffaf0] text-[#5d574b]"
            >
              Human Check
            </Kicker>
            <p className="text-pretty mt-4 text-xl font-medium leading-8">
              This version is intentionally less “AI portfolio” and more edited
              studio page. It should feel quieter without becoming beige paste.
            </p>
          </div>
          <SkillStrip tone="paper" />
        </section>
      </div>
    </Shell>
  );
};

export default function PrototypeAppStyleCDirectionsClient({
  initialVariant,
  workProjects,
  personalProjects,
}: PrototypeAppStyleCDirectionsClientProps) {
  const searchParams = useSearchParams();
  const current = normalizeVariant(
    searchParams?.get("variant") ?? null,
    initialVariant,
  );
  const projects = combineProjects(workProjects, personalProjects);

  if (current === "B") {
    return <VariantCommandDesk current={current} projects={projects} />;
  }

  if (current === "C") {
    return <VariantSoftGallery current={current} projects={projects} />;
  }

  return <VariantCaseFile current={current} projects={projects} />;
}
