import PrototypeAppStyleClient from "./prototype-app-style-client";
import { getPersonalProjects, getWorkProjects } from "@/lib/projects";
import { toProject } from "@/lib/project-normalization";

export const metadata = {
  title: "Prototype - App Style",
};

const variants = ["A", "B", "C"];
type PrototypeAppStylePageProps = {
  searchParams?: {
    variant?: string;
  };
};

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
      workProjects={workProjects.map(toProject)}
      personalProjects={personalProjects.map(toProject)}
    />
  );
}
