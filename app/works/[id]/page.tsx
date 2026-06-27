import { CommandBackground } from "@/components/home/command-background";
import { Badge } from "@/components/ui/badge";
import { getProjectGradient } from "@/lib/project-gradients";
import type { Project } from "@/lib/project-types";
import { getSingleProject } from "@/lib/projects";
import { skillTagMap } from "@/lib/skills-source";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Single project",
};

const projectDetailCopy: Record<string, string> = {
  Brixa:
    "AI hotel operations platform automating guest communication and booking workflows, helping increase conversions while reducing repetitive operational work.",
};

const getProjectDescription = (project: Project) =>
  projectDetailCopy[project.title] ?? project.description;

export default async function SingleWorkPage({
  params,
}: {
  params: { id: string };
}) {
  const raw = await getSingleProject(params.id);
  const project: Project | null = raw
    ? {
        ...raw,
        status: (raw.status as Project["status"]) ?? undefined,
        year: raw.year ?? undefined,
        tags: raw.tags ?? undefined,
      }
    : null;

  if (project === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f10] p-6 text-center">
          Project not found
        </div>
      </main>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 -z-[9] bg-[#050505] text-white"
        aria-hidden="true"
      >
        <CommandBackground />
      </div>
      <main className="relative left-1/2 w-screen -translate-x-1/2 px-4 pb-24 pt-8 text-white sm:px-6 lg:px-8">
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <Link
            href="/#works"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2d2d30] bg-[#171719] px-3 py-1 text-xs font-semibold uppercase tracking-normal text-zinc-100 transition-colors hover:border-[#b7c8ff]/50"
          >
            <ArrowLeft className="size-3.5" />
            Works
          </Link>

          <header className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-normal text-zinc-500">
                <span>
                  {project.isPersonal ? "Exploration" : "Client Work"}
                </span>
                <span aria-hidden="true">/</span>
                <span>{project.year ?? project.date}</span>
                {project.status && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span>{project.status}</span>
                  </>
                )}
              </div>
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
                {project.title}
              </h1>
              <p className="text-pretty max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                {getProjectDescription(project)}
              </p>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f10] p-4">
              <div className="flex flex-col gap-4 text-sm">
                {project.siteUrl && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-normal text-zinc-500">
                      Website
                    </span>
                    <Link
                      href={project.siteUrl}
                      className="inline-flex items-center gap-1 break-all text-[#d6eadf] transition-colors hover:text-[#e4f4eb]"
                      target="_blank"
                    >
                      {project.siteUrl}
                      <ExternalLink className="size-4 shrink-0" />
                    </Link>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-normal text-zinc-500">
                    Stack
                  </span>
                  <p className="leading-6 text-zinc-300">{project.stack}</p>
                </div>
              </div>
            </div>
          </header>

          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={`${project.title} cover image`}
              sizes="100vw"
              className="h-auto w-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f10]"
              width={1200}
              height={720}
              priority
            />
          ) : (
            <div
              className="flex aspect-video w-full items-center justify-center rounded-2xl border border-[#2a2a2a]"
              style={{ background: getProjectGradient(project.title) }}
            >
              <span className="px-6 text-center text-4xl font-bold text-white/30">
                {project.title}
              </span>
            </div>
          )}

          {project.tags && project.tags.length > 0 && (
            <div className="flex w-full flex-wrap gap-1.5">
              {[...project.tags]
                .sort((a, b) => {
                  const aOrder = skillTagMap.get(a)?.groupOrder ?? Infinity;
                  const bOrder = skillTagMap.get(b)?.groupOrder ?? Infinity;
                  return aOrder - bOrder;
                })
                .map((tag) => (
                  <Badge
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.045] text-xs text-zinc-100 hover:bg-white/[0.075]"
                  >
                    {tag}
                  </Badge>
                ))}
            </div>
          )}

          <div className="flex w-full flex-col gap-3">
            {project.images.map((image) => (
              <Image
                key={image}
                src={image}
                alt={`${project.title} project image`}
                sizes="100vw"
                className="h-auto w-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f10]"
                width={1200}
                height={720}
              />
            ))}
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3 sm:grid sm:w-full sm:max-w-full sm:grid-cols-2">
            {project.mobileImages.map((image) => (
              <Image
                key={image}
                src={image}
                alt={`${project.title} mobile project image`}
                sizes="100vw"
                className="h-auto w-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f10]"
                width={400}
                height={800}
              />
            ))}
          </div>
        </article>
      </main>
    </>
  );
}
