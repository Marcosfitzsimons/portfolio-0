import { FolderOpenDot, Layers3, UserRound } from "lucide-react";
import SocialLinks from "@/components/social-links";
import type { Project } from "@/lib/project-types";
import { BackToTopButton } from "./back-to-top-button";
import { CommandBackground } from "./command-background";
import { CommandChatPanel } from "./command-chat-panel";
import { MobileSectionNav } from "./mobile-section-nav";
import { ProjectArchive, ProjectStack } from "./project-showcase";
import { SectionLabel } from "./section-label";
import { SkillList, SkillsLogoBanner } from "./skills-showcase";

type HomeAppProps = {
  workProjects: Project[];
  personalProjects: Project[];
};

const sidebarCopy =
  "Building production AI systems and full-stack software across interfaces, backend services, and infrastructure.";

const combineProjects = (
  workProjects: Project[],
  personalProjects: Project[],
) => [...workProjects, ...personalProjects];

export const HomeApp = ({ workProjects, personalProjects }: HomeAppProps) => {
  const projects = combineProjects(workProjects, personalProjects).slice(0, 9);
  const featuredProjects = projects.slice(0, 5);
  const archiveProjects = projects.slice(5);

  return (
    <>
      <div
        className="fixed inset-0 -z-[9] bg-[#050505] text-white"
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
          <div className="grid gap-8 lg:grid-cols-[19rem_1fr]">
            <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
              <div className="flex flex-col gap-5 border-y border-white/10 py-6">
                <SectionLabel icon={<UserRound className="size-3.5" />}>
                  Marcos Valentín Fitzsimons
                </SectionLabel>
                <div>
                  <h1 className="text-balance text-4xl font-semibold leading-tight">
                    <span className="block">AI product builder.</span>
                    <span className="block">Full-stack developer.</span>
                  </h1>
                  <p className="text-pretty mt-4 text-sm leading-6 text-zinc-400">
                    {sidebarCopy}
                  </p>
                </div>
                <div className="flex flex-col">
                  {[
                    "4+ years shipping software",
                    "Production AI systems",
                    "Web / Mobile / Cloud",
                  ].map((item) => (
                    <div
                      key={item}
                      className="border-t border-white/10 px-1 py-3 text-xs uppercase tracking-normal text-zinc-500"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 border-b border-white/10 pb-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-normal text-zinc-500">
                  Elsewhere
                </div>
                <SocialLinks />
              </div>
            </aside>

            <div className="flex min-w-0 flex-col gap-8">
              <section id="ask" className="scroll-mt-24">
                <CommandChatPanel />
              </section>

              <section id="works" className="flex scroll-mt-24 flex-col gap-6">
                <div>
                  <SectionLabel icon={<FolderOpenDot className="size-3.5" />}>
                    Works
                  </SectionLabel>
                  <h2 className="text-balance mt-4 max-w-2xl text-4xl font-semibold leading-tight">
                    Selected projects.
                  </h2>
                  <p className="text-pretty mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                    A short, scrollable look at the work worth opening first.
                  </p>
                </div>
                <ProjectStack projects={featuredProjects} />
                <ProjectArchive projects={archiveProjects} />
              </section>

              <section id="skills" className="flex scroll-mt-24 flex-col gap-6">
                <SectionLabel icon={<Layers3 className="size-3.5" />}>
                  Skills
                </SectionLabel>
                <SkillList />
                <SkillsLogoBanner />
              </section>
            </div>
          </div>
        </div>
      </main>
      <BackToTopButton />
    </>
  );
};
