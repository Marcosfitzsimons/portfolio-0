import { getWorkProjects } from "@/lib/projects";
import Work from "./work";
import WorksContainer from "./works-container";
import type { Project } from "@/lib/project-types";

const Works = async () => {
  const data = await getWorkProjects();

  if (data === null || data.length === 0) {
    return (
      <div className="mt-16 flex items-center justify-center text-muted-foreground">
        Projects not found
      </div>
    );
  }

  return (
    <WorksContainer>
      {data.map((project) => (
        <Work key={project.id} {...(project as Project)} />
      ))}
    </WorksContainer>
  );
};

export default Works;
