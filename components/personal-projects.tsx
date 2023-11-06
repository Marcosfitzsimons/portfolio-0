import { Skeleton } from "./ui/skeleton";
import Work from "./work";
import WorksContainer from "./works-container";

async function getAllProjects() {
  const res = await fetch(
    `${process.env.BASE_URL}/api/projects/getAllProjects`
  );
  // console.log(res);
  return res.json();
}

const PersonalProjects = async () => {
  if (!process.env.BASE_URL) {
    return null;
  }
  const data: {
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
  }[] = await getAllProjects();
  const personalProjects = data.filter((project) => project.isPersonal);

  return (
    <WorksContainer>
      {personalProjects.map((project) => (
        <Work key={project.id} {...project} />
      ))}
    </WorksContainer>
  );
};

export default PersonalProjects;
