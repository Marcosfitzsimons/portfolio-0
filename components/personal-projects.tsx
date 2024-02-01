import { getPersonalProjects } from "@/lib/projects";
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

const PersonalProjects = async () => {
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
    | null = await getPersonalProjects();

  if (data === null) {
    return (
      <div className="flex justify-center items-center mt-16">
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

export default PersonalProjects;
