import { getSingleProject } from "@/lib/projects";
import { ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

// Development:

// async function getProject(projectId: string) {
//   const res = await fetch(`${process.env.BASE_URL}/api/projects/${projectId}`, {
//     cache: "no-store",
//   });
//   // console.log(res);
//   return res.json();
// }

export const metadata: Metadata = {
  title: "Single project",
};

export default async function SingleWorkPage({
  params,
}: {
  params: { id: string };
}) {
  const project: {
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
  } | null = await getSingleProject(params.id);

  if (project === null) {
    // Handle the case where data is null, such as showing an error message
    return (
      <div className="mt-16 flex items-center justify-center">
        Project not found
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center gap-5 pb-10 pt-5 sm:mx-auto sm:w-[80%]">
      <Image
        src={project.coverImage}
        alt="Project cover image"
        sizes="100vw"
        className="h-auto w-full rounded-2xl"
        width={500}
        height={300}
      />

      <div className="flex flex-wrap items-center gap-1 self-start">
        <Link href="/works" className="font-light">
          Works
        </Link>
        <ChevronRight className="relative top-[1px] h-4 w-4" />
        <p className="font-medium text-white">{project.title}</p>
        <span className="select-none rounded-2xl bg-violet-400 px-2 py-0.5 text-xs font-medium sm:ml-1">
          {project.date}
        </span>
      </div>
      <p className="w-full indent-3 text-sm text-muted-foreground sm:indent-5">
        {project.description}
      </p>
      <div className="flex w-full flex-col gap-1 text-sm">
        <div className="flex flex-col">
          <p className="text-white">Website</p>
          <Link
            href={project.siteUrl}
            className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-300"
            target="_blank"
          >
            {project.siteUrl}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-col">
          <p className="text-white">Stack</p>
          <p className="font-light">{project.stack}</p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        {project.images.map((image) => (
          <Image
            key={image}
            src={image}
            alt="Project image"
            sizes="100vw"
            className="h-auto w-full rounded-2xl"
            width={500}
            height={300}
          />
        ))}
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2 sm:grid sm:w-full sm:max-w-full sm:grid-cols-2">
        {project.mobileImages.map((image) => (
          <Image
            key={image}
            src={image}
            alt="Project image"
            sizes="100vw"
            className="h-auto w-full rounded-2xl"
            width={400}
            height={800}
          />
        ))}
      </div>
    </section>
  );
}
