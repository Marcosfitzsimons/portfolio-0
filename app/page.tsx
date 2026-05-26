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
