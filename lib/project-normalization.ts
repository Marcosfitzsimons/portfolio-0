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
