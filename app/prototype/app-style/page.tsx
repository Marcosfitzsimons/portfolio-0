import PrototypeAppStyleClient from "./prototype-app-style-client";
import { getPersonalProjects, getWorkProjects } from "@/lib/projects";
import type { Project, ProjectStatus } from "@/lib/project-types";

export const metadata = {
  title: "Prototype - App Style",
};

const variants = ["A", "B", "C"];
const projectStatuses = new Set(["live", "in-progress", "archived"]);

type PrototypeAppStylePageProps = {
  searchParams?: {
    variant?: string;
  };
};

const toPrototypeProject = (project: {
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
}): Project => ({
  ...project,
  status: projectStatuses.has(project.status ?? "")
    ? (project.status as ProjectStatus)
    : undefined,
  year: project.year ?? undefined,
});

export default async function PrototypeAppStylePage({
  searchParams,
}: PrototypeAppStylePageProps) {
  const [workProjects, personalProjects] = await Promise.all([
    getWorkProjects(),
    getPersonalProjects(),
  ]);

  const initialVariant = variants.includes(searchParams?.variant ?? "")
    ? searchParams?.variant ?? "A"
    : "A";

  return (
    <PrototypeAppStyleClient
      initialVariant={initialVariant}
      workProjects={workProjects.map(toPrototypeProject)}
      personalProjects={personalProjects.map(toPrototypeProject)}
    />
  );
}
