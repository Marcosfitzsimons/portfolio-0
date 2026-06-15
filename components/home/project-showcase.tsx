"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjectGradient } from "@/lib/project-gradients";
import type { Project } from "@/lib/project-types";
import { cn } from "@/lib/utils";
import { surfaceText } from "./section-label";

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
    "AI hotel operations platform automating guest communication and booking workflows, helping increase conversions while reducing repetitive work.",
  "Grab & Eat":
    "Autonomous grocery checkout: scan, purchase, leave without turning the store into a queue.",
  "Multi Step Form":
    "A polished form flow with validation and motion, useful as a small pattern library for onboarding.",
  "Cash Tally":
    "Small finance utility for tracking cash counts with less arithmetic friction.",
  "Feeling the Groove":
    "Personal event tracker for nights out, notes, and memories after the music fades.",
  "Rest Countries App":
    "Country browser challenge sharpened around search, filters, routing, and API state.",
};

const surface = surfaceText.ink;

const getProjectTags = (project: Project) => project.tags?.slice(0, 4) ?? [];

const getProjectDeckCopy = (project: Project) =>
  projectDeckCopy[project.title] ?? project.description;

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

const ProjectTags = ({ project }: { project: Project }) => {
  const tags = getProjectTags(project);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className={cn("rounded-full", surface.badge)}
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
  isLast = false,
}: {
  project: Project;
  index: number;
  isLast?: boolean;
}) => (
  <ScrollStackItem
    itemClassName={cn(
      "!mt-0 !h-auto !min-h-[29rem] !rounded-2xl !p-0",
      isLast ? "!mb-0" : "!mb-28",
      "overflow-hidden border shadow-2xl shadow-black/45",
      surface.panel,
    )}
  >
    <article className="grid min-h-[29rem] gap-0 lg:grid-cols-[0.9fr_1.1fr]">
      <ProjectVisual
        project={project}
        className="min-h-52 rounded-none lg:min-h-full"
      />
      <div className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <ProjectMeta project={project} className={surface.faint} />
            <span className="font-mono text-sm tabular-nums text-zinc-500">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-balance text-2xl font-semibold leading-tight sm:text-4xl">
              {project.title}
            </h3>
            <p className="text-pretty line-clamp-3 max-w-2xl text-sm leading-7 text-zinc-300">
              {getProjectDeckCopy(project)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <ProjectTags project={project} />
          <Button asChild className={cn("w-fit", surface.button)}>
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

export const ProjectStack = ({ projects }: { projects: Project[] }) => (
  <ScrollStack
    useWindowScroll={false}
    itemDistance={112}
    itemStackDistance={16}
    itemScale={0.012}
    baseScale={0.94}
    stackPosition="5%"
    scaleEndPosition="2%"
    className="h-[56vh] max-h-[36rem] min-h-[30rem] overflow-x-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    innerClassName="scroll-stack-inner min-h-full px-0 pb-8 pt-0"
  >
    {projects.map((project, index) => (
      <ProjectStackCard
        key={`${project.id}-${project.isPersonal ? "personal" : "work"}`}
        project={project}
        index={index}
        isLast={index === projects.length - 1}
      />
    ))}
  </ScrollStack>
);

export const ProjectArchive = ({ projects }: { projects: Project[] }) => {
  if (projects.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-normal text-zinc-400">
          More Works
        </h3>
        <span className="font-mono text-xs tabular-nums text-zinc-600">
          {projects.length}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={`${project.id}-${project.isPersonal ? "personal" : "work"}-archive`}
            href={`/works/${project.id}`}
            className={cn(
              "group flex min-w-0 items-center justify-between gap-4 rounded-xl border p-4 transition-colors hover:border-[#b7c8ff]/50 hover:bg-[#171719] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6eadf]",
              surface.panel,
            )}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {project.title}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {project.isPersonal ? "Lab" : "Client"}{" "}
                {project.year ? `· ${project.year}` : ""}
              </div>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-[#d6eadf] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
};
