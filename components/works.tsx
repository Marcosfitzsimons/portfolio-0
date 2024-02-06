import { getWorkProjects } from "@/lib/projects";
import Work from "./work";
import WorksContainer from "./works-container";

// Development
// async function getAllProjects() {
//   const res = await fetch(
//     `${process.env.BASE_URL}/api/projects/getAllProjects`,
//     {
//       cache: "no-store",
//     }
//   );
//   return res.json();
// }

const Works = async () => {
  const data:
    | {
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
      }[]
    | null = await getWorkProjects();

  if (data === null) {
    return (
      <div className="mt-16 flex items-center justify-center">
        Projects not found
      </div>
    );
  }

  return (
    <WorksContainer>
      {data.map((project) => (
        <Work key={project.id} {...project} />
      ))}
    </WorksContainer>
  );
};

export default Works;
