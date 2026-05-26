# Variant C Main App Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the chosen Variant C prototype into the production portfolio while preserving and lightly restyling `/works/[id]`, then stop for owner QA before prototype cleanup.

**Architecture:** The root layout becomes a thin global shell. The production home page fetches project data on the server and renders a focused client app copied from the chosen Variant C behavior without prototype switcher controls. Project detail owns its own dark command-story layout.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS, Prisma project data, existing `ChatBot`, `ScrollStack`, `SoftAurora`, `LogoLoop`, shadcn `Badge` and `Button`, lucide icons.

---

## File Structure

- Create `lib/project-normalization.ts`: converts Prisma project records into the existing `Project` type.
- Create `components/home/command-background.tsx`: client-only Variant C background using `SoftAurora`.
- Create `components/home/back-to-top-button.tsx`: client-only scroll visibility button.
- Create `components/home/mobile-section-nav.tsx`: mobile sticky in-page navigation.
- Create `components/home/section-label.tsx`: shared pill label used on the home page.
- Create `components/home/project-showcase.tsx`: selected project stack and archive.
- Create `components/home/skills-showcase.tsx`: skills grid and logo banner.
- Create `components/home/command-chat-panel.tsx`: chat-first panel.
- Create `components/home/home-app.tsx`: production Variant C composition.
- Modify `app/page.tsx`: server fetches projects and renders `HomeApp`.
- Modify `app/layout.tsx`: remove legacy centered wrapper, global nav/footer, and LightPillar background.
- Modify `app/about/page.tsx`: redirect to `/#skills`.
- Modify `app/works/page.tsx`: redirect to `/#works`.
- Modify `app/works/[id]/page.tsx`: light Variant C restyle.

---

### Task 1: Add Shared Project Normalization

**Files:**
- Create: `lib/project-normalization.ts`
- Modify: `app/prototype/app-style/page.tsx`

- [ ] **Step 1: Create the normalization helper**

Create `lib/project-normalization.ts` with:

```ts
import type { Project, ProjectStatus } from "@/lib/project-types";

const projectStatuses = new Set(["live", "in-progress", "archived"]);

type RawProject = {
  id: number;
  title: string;
  description: string;
  stack: string;
  siteUrl: string;
  coverImageSm: string;
  coverImage: string;
  images: string[];
  mobileImages: string[];
  isPersonal: boolean;
  date: string;
  tags: string[];
  status: string | null;
  year: string | null;
  showcaseOrder: number;
};

export const toProject = (project: RawProject): Project => ({
  ...project,
  status: projectStatuses.has(project.status ?? "")
    ? (project.status as ProjectStatus)
    : undefined,
  year: project.year ?? undefined,
});
```

- [ ] **Step 2: Reuse the helper in the prototype page**

In `app/prototype/app-style/page.tsx`, replace the local `Project`, `ProjectStatus`, `projectStatuses`, and `toPrototypeProject` definitions with:

```ts
import { toProject } from "@/lib/project-normalization";
```

Then change the render props to:

```tsx
<PrototypeAppStyleClient
  initialVariant={initialVariant}
  workProjects={workProjects.map(toProject)}
  personalProjects={personalProjects.map(toProject)}
/>
```

- [ ] **Step 3: Run TypeScript build check**

Run: `npm run build`

Expected: the build may still fail on existing unrelated issues, but it must not fail because `toPrototypeProject`, `Project`, or `ProjectStatus` are missing from `app/prototype/app-style/page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add lib/project-normalization.ts app/prototype/app-style/page.tsx
git commit -m "refactor: share project normalization"
```

---

### Task 2: Create Production Home Building Blocks

**Files:**
- Create: `components/home/section-label.tsx`
- Create: `components/home/command-background.tsx`
- Create: `components/home/back-to-top-button.tsx`
- Create: `components/home/mobile-section-nav.tsx`

- [ ] **Step 1: Add `SectionLabel`**

Create `components/home/section-label.tsx` with:

```tsx
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
```

- [ ] **Step 2: Add the production command background**

Create `components/home/command-background.tsx` with:

```tsx
"use client";

import dynamic from "next/dynamic";

const SoftAurora = dynamic(() => import("@/components/SoftAurora"), {
  ssr: false,
});

export const CommandBackground = () => (
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
    <div className="absolute inset-0 bg-[#050505]/78 backdrop-blur-[1px]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(5,5,5,0.35)_38%,#050505_82%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(215,200,255,0.025)_1px,transparent_1px),linear-gradient(rgba(214,234,223,0.02)_1px,transparent_1px)] bg-[size:96px_96px]" />
  </div>
);
```

- [ ] **Step 3: Add back-to-top button**

Create `components/home/back-to-top-button.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const BackToTopButton = () => {
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
        "fixed bottom-4 right-4 z-40 flex size-11 items-center justify-center rounded-full border border-[#303030] bg-[#d6eadf] text-[#07110d] shadow-2xl shadow-black/40 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
};
```

- [ ] **Step 4: Add mobile section navigation**

Create `components/home/mobile-section-nav.tsx` with:

```tsx
import { ArrowUpRight, FolderOpenDot, Layers3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const sectionLinks = [
  { label: "Ask", href: "#ask", icon: <Sparkles className="size-4" /> },
  { label: "Works", href: "#works", icon: <FolderOpenDot className="size-4" /> },
  { label: "Skills", href: "#skills", icon: <Layers3 className="size-4" /> },
];

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

export const MobileSectionNav = () => (
  <div className="sticky top-3 z-30 lg:hidden">
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#101010]/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <SectionNavigation compact />
    </div>
  </div>
);
```

- [ ] **Step 5: Run build check**

Run: `npm run build`

Expected: no import or JSX errors from the new `components/home/*` files.

- [ ] **Step 6: Commit**

```bash
git add components/home/section-label.tsx components/home/command-background.tsx components/home/back-to-top-button.tsx components/home/mobile-section-nav.tsx
git commit -m "feat: add command home building blocks"
```

---

### Task 3: Create Production Home Feature Sections

**Files:**
- Create: `components/home/command-chat-panel.tsx`
- Create: `components/home/project-showcase.tsx`
- Create: `components/home/skills-showcase.tsx`

- [ ] **Step 1: Add command chat panel**

Create `components/home/command-chat-panel.tsx` with:

```tsx
import ChatBot from "@/components/chat-bot";
import { ShinyIcon, SPARKLES_SVG } from "@/components/shiny-text";
import StarBorder from "@/components/star-border";

export const CommandChatPanel = () => (
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
```

- [ ] **Step 2: Add project showcase**

Create `components/home/project-showcase.tsx` by copying these production-safe pieces from `app/prototype/app-style/prototype-app-style-client.tsx`:

```ts
projectDeckCopy
getProjectTags
getProjectDeckCopy
ProjectVisual
ProjectMeta
ProjectTags
ProjectStackCard
ProjectStack
ProjectArchive
```

Use these imports at the top:

```tsx
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
```

Export only:

```ts
export const ProjectStack = ...
export const ProjectArchive = ...
```

Keep only the `surface="ink"` path. Remove `Surface`, `surface` props, `layout`, and paper/dark branches. Production project cards use:

```tsx
const surface = surfaceText.ink;
```

Keep the contained compact `ScrollStack` settings from Variant C:

```tsx
useWindowScroll={false}
itemDistance={112}
itemStackDistance={16}
itemScale={0.012}
baseScale={0.94}
stackPosition="5%"
scaleEndPosition="2%"
className="h-[56vh] max-h-[36rem] min-h-[30rem] overflow-x-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
innerClassName="scroll-stack-inner min-h-full px-0 pb-8 pt-0"
```

- [ ] **Step 3: Add skills showcase**

Create `components/home/skills-showcase.tsx` with:

```tsx
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
        <div key={group.category} className={cn("rounded-xl border p-4", surfaceText.ink.panel)}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className={cn("inline-flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-lg", category.className)}>
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
```

- [ ] **Step 4: Run build check**

Run: `npm run build`

Expected: no errors from the new home feature section files.

- [ ] **Step 5: Commit**

```bash
git add components/home/command-chat-panel.tsx components/home/project-showcase.tsx components/home/skills-showcase.tsx
git commit -m "feat: add command home sections"
```

---

### Task 4: Wire Production Home

**Files:**
- Create: `components/home/home-app.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `HomeApp`**

Create `components/home/home-app.tsx` with:

```tsx
import { FolderOpenDot, Layers3, UserRound } from "lucide-react";
import { CommandBackground } from "./command-background";
import { BackToTopButton } from "./back-to-top-button";
import { MobileSectionNav } from "./mobile-section-nav";
import { CommandChatPanel } from "./command-chat-panel";
import { ProjectArchive, ProjectStack } from "./project-showcase";
import { SectionLabel } from "./section-label";
import { SkillList, SkillsLogoBanner } from "./skills-showcase";
import SocialLinks from "@/components/social-links";
import type { Project } from "@/lib/project-types";

type HomeAppProps = {
  workProjects: Project[];
  personalProjects: Project[];
};

const sidebarCopy =
  "TypeScript developer building web, mobile, cloud, and AI-powered systems for real teams.";

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
      <div className="fixed inset-0 -z-[9] bg-[#050505] text-white" aria-hidden="true">
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
                    Full-stack products, from interface to infrastructure.
                  </h1>
                  <p className="mt-4 text-pretty text-sm leading-6 text-zinc-400">
                    {sidebarCopy}
                  </p>
                </div>
                <div className="flex flex-col">
                  {["4+ years shipping", "Web / Mobile", "AI / Cloud"].map((item) => (
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
                  <h2 className="mt-4 max-w-2xl text-balance text-4xl font-semibold leading-tight">
                    Selected projects.
                  </h2>
                  <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-zinc-400">
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
```

- [ ] **Step 2: Replace `app/page.tsx`**

Replace `app/page.tsx` with:

```tsx
import { HomeApp } from "@/components/home/home-app";
import { getPersonalProjects, getWorkProjects } from "@/lib/projects";
import { toProject } from "@/lib/project-normalization";

export default async function Home() {
  const [workProjects, personalProjects] = await Promise.all([
    getWorkProjects(),
    getPersonalProjects(),
  ]);

  return (
    <HomeApp
      workProjects={workProjects.map(toProject)}
      personalProjects={personalProjects.map(toProject)}
    />
  );
}
```

- [ ] **Step 3: Run build check**

Run: `npm run build`

Expected: `/` compiles and does not import `PrototypeVariantSwitcher`.

- [ ] **Step 4: Browser check home**

Run:

```bash
npx agent-browser --session home-check open http://localhost:3000/
npx agent-browser --session home-check wait --load networkidle
npx agent-browser --session home-check snapshot -i
npx agent-browser --session home-check screenshot --full
npx agent-browser --session home-check close
```

Expected snapshot includes `Skip the scroll. Just ask.`, `Selected projects.`, `Brixa`, `MORE WORKS`, `Frontend`, `Backend`, and no `Prototype C - Command Story`.

- [ ] **Step 5: Commit**

```bash
git add components/home/home-app.tsx app/page.tsx
git commit -m "feat: make variant c the home app"
```

---

### Task 5: Thin The Root Layout And Add Redirects

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/works/page.tsx`

- [ ] **Step 1: Replace root layout**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s - Marcos Fitzsimons",
    default: "Portfolio - Marcos Fitzsimons",
  },
  description:
    "Explore Marcos Fitzsimons' portfolio of full-stack, AI, cloud, and product work.",
  metadataBase: new URL("https://www.marcosfitzsimons.com.ar"),
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased`}
      >
        {props.children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `/about` with redirect**

Replace `app/about/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function AboutPage() {
  redirect("/#skills");
}
```

- [ ] **Step 3: Replace `/works` with redirect**

Replace `app/works/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function WorksPage() {
  redirect("/#works");
}
```

- [ ] **Step 4: Run build check**

Run: `npm run build`

Expected: no `Header`, `Nav`, `Footer`, or `LightPillar` imports in `app/layout.tsx`.

- [ ] **Step 5: Browser check redirects**

Run:

```bash
npx agent-browser --session redirect-about open http://localhost:3000/about
npx agent-browser --session redirect-about wait --load networkidle
npx agent-browser --session redirect-about get url
npx agent-browser --session redirect-about close
npx agent-browser --session redirect-works open http://localhost:3000/works
npx agent-browser --session redirect-works wait --load networkidle
npx agent-browser --session redirect-works get url
npx agent-browser --session redirect-works close
```

Expected URLs end with `/#skills` and `/#works`.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/about/page.tsx app/works/page.tsx
git commit -m "refactor: simplify app shell and redirect legacy pages"
```

---

### Task 6: Restyle Project Detail Route

**Files:**
- Modify: `app/works/[id]/page.tsx`

- [ ] **Step 1: Replace detail page layout**

Keep the existing imports for `getSingleProject`, `Image`, `Link`, `Metadata`, `getProjectGradient`, `Badge`, `skillTagMap`, and `Project`. Add:

```ts
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CommandBackground } from "@/components/home/command-background";
```

Remove `ChevronRight` from the icon import.

Replace the returned JSX for a found project with:

```tsx
return (
  <>
    <div className="fixed inset-0 -z-[9] bg-[#050505] text-white" aria-hidden="true">
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
              <span>{project.isPersonal ? "Exploration" : "Client Work"}</span>
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
            <p className="max-w-3xl text-pretty text-sm leading-7 text-zinc-400 sm:text-base">
              {project.description}
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
```

- [ ] **Step 2: Restyle not-found state**

Use this not-found return:

```tsx
return (
  <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f10] p-6 text-center">
      Project not found
    </div>
  </main>
);
```

- [ ] **Step 3: Run build check**

Run: `npm run build`

Expected: no missing imports and no TypeScript errors in `app/works/[id]/page.tsx`.

- [ ] **Step 4: Browser check a project detail**

Pick an ID from the home snapshot, then run:

```bash
npx agent-browser --session detail-check open http://localhost:3000/works/1
npx agent-browser --session detail-check wait --load networkidle
npx agent-browser --session detail-check snapshot -i
npx agent-browser --session detail-check screenshot --full
npx agent-browser --session detail-check close
```

Expected snapshot includes a `Works` back link, the project title, stack content, and no old top nav.

- [ ] **Step 5: Commit**

```bash
git add app/works/[id]/page.tsx
git commit -m "feat: restyle project detail page"
```

---

### Task 7: Phase 1 QA Handoff

**Files:**
- Modify: none

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: build completes successfully.

- [ ] **Step 2: Browser check production home**

Run:

```bash
npx agent-browser --session qa-home open http://localhost:3000/
npx agent-browser --session qa-home wait --load networkidle
npx agent-browser --session qa-home snapshot -i
npx agent-browser --session qa-home screenshot --full
npx agent-browser --session qa-home close
```

Expected: home has Variant C content and no prototype switcher.

- [ ] **Step 3: Browser check prototype comparison source**

Run:

```bash
npx agent-browser --session qa-prototype open "http://localhost:3000/prototype/app-style?variant=C"
npx agent-browser --session qa-prototype wait --load networkidle
npx agent-browser --session qa-prototype snapshot -i
npx agent-browser --session qa-prototype screenshot --full
npx agent-browser --session qa-prototype close
```

Expected: prototype still renders with `Prototype C - Command Story`.

- [ ] **Step 4: Browser check redirects and detail**

Run:

```bash
npx agent-browser --session qa-about open http://localhost:3000/about
npx agent-browser --session qa-about wait --load networkidle
npx agent-browser --session qa-about get url
npx agent-browser --session qa-about close
npx agent-browser --session qa-works open http://localhost:3000/works
npx agent-browser --session qa-works wait --load networkidle
npx agent-browser --session qa-works get url
npx agent-browser --session qa-works close
npx agent-browser --session qa-detail open http://localhost:3000/works/1
npx agent-browser --session qa-detail wait --load networkidle
npx agent-browser --session qa-detail snapshot -i
npx agent-browser --session qa-detail close
```

Expected: `/about` lands on `/#skills`, `/works` lands on `/#works`, and detail renders without the old nav.

- [ ] **Step 5: Stop and request owner QA**

Do not delete prototype routes. Report:

```text
Phase 1 is ready for QA. Please compare:
- http://localhost:3000/
- http://localhost:3000/prototype/app-style?variant=C
- one or more project detail pages under /works/:id

Cleanup will wait until you approve the real app.
```

---

### Task 8: Phase 2 Cleanup After Owner Approval

**Files:**
- Delete: `app/prototype/app-style/page.tsx`
- Delete: `app/prototype/app-style/prototype-app-style-client.tsx`
- Delete: `app/prototype/app-style/NOTES.md`
- Delete: `app/prototype/app-style-c-directions/page.tsx`
- Delete: `app/prototype/app-style-c-directions/prototype-app-style-c-directions-client.tsx`
- Delete: `app/prototype/app-style-c-directions/NOTES.md`
- Delete if unreferenced: `components/prototype-variant-switcher.tsx`
- Delete if unreferenced: `components/header.tsx`
- Delete if unreferenced: `components/nav.tsx`
- Delete if unreferenced: `components/footer.tsx`
- Delete if unreferenced: `components/LightPillar.jsx`
- Delete if unreferenced: `components/LightPillar.css`

- [ ] **Step 1: Confirm owner approval exists**

Proceed only after the owner explicitly says the real app matches Variant C and cleanup can start.

- [ ] **Step 2: Search references**

Run:

```bash
rg "prototype-variant-switcher|PrototypeVariantSwitcher|Header|Nav|Footer|LightPillar|app-style-c-directions|app-style" app components
```

Expected: references are limited to files being deleted or no longer needed.

- [ ] **Step 3: Delete prototype routes**

Use PowerShell:

```powershell
Remove-Item -LiteralPath app\prototype\app-style\page.tsx
Remove-Item -LiteralPath app\prototype\app-style\prototype-app-style-client.tsx
Remove-Item -LiteralPath app\prototype\app-style\NOTES.md
Remove-Item -LiteralPath app\prototype\app-style-c-directions\page.tsx
Remove-Item -LiteralPath app\prototype\app-style-c-directions\prototype-app-style-c-directions-client.tsx
Remove-Item -LiteralPath app\prototype\app-style-c-directions\NOTES.md
```

- [ ] **Step 4: Delete unreferenced legacy components**

Only delete files whose names did not appear in remaining `rg` output:

```powershell
Remove-Item -LiteralPath components\prototype-variant-switcher.tsx
Remove-Item -LiteralPath components\header.tsx
Remove-Item -LiteralPath components\nav.tsx
Remove-Item -LiteralPath components\footer.tsx
Remove-Item -LiteralPath components\LightPillar.jsx
Remove-Item -LiteralPath components\LightPillar.css
```

- [ ] **Step 5: Run cleanup verification**

Run:

```bash
npm run build
rg "Prototype C|PrototypeVariantSwitcher|LightPillar" app components
```

Expected: build passes and `rg` finds no production references.

- [ ] **Step 6: Browser check production routes**

Run:

```bash
npx agent-browser --session cleanup-home open http://localhost:3000/
npx agent-browser --session cleanup-home wait --load networkidle
npx agent-browser --session cleanup-home snapshot -i
npx agent-browser --session cleanup-home close
npx agent-browser --session cleanup-detail open http://localhost:3000/works/1
npx agent-browser --session cleanup-detail wait --load networkidle
npx agent-browser --session cleanup-detail snapshot -i
npx agent-browser --session cleanup-detail close
```

Expected: home and detail still render.

- [ ] **Step 7: Commit cleanup**

```bash
git add app components
git commit -m "chore: remove prototype app style routes"
```

---

## Self-Review Notes

- Spec coverage: Phase 1 migration, `/works/[id]` restyle, redirects, QA gate, and Phase 2 cleanup each have a task.
- Placeholder scan: no `TODO`, `TBD`, or open implementation placeholders remain.
- Type consistency: `Project`, `toProject`, `HomeAppProps`, and home component imports use the existing project model names.
