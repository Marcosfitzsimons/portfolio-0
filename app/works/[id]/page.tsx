import { getSingleProject } from "@/lib/projects";
import { ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Development:

// async function getProject(projectId: string) {
//   const res = await fetch(`${process.env.BASE_URL}/api/projects/${projectId}`, {
//     cache: "no-store",
//   });
//   // console.log(res);
//   return res.json();
// }

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
      <div className="flex justify-center items-center mt-16">
        Project not found
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center gap-5 py-5 sm:w-[80%] sm:mx-auto">
      <Image
        src={project.coverImage}
        alt="Project cover image"
        sizes="100vw"
        className="w-full h-auto rounded-2xl"
        width={500}
        height={300}
      />

      <div className="self-start flex items-center gap-1 flex-wrap">
        <Link href="/works" className="font-light">
          Works
        </Link>
        <ChevronRight className="w-4 h-4 relative top-[1px]" />
        <p className="font-medium text-white">{project.title}</p>
        <span className="select-none text-xs font-medium rounded-2xl sm:ml-1 px-2 py-0.5 bg-violet-400">
          {project.date}
        </span>
      </div>
      <p className="w-full text-muted-foreground text-sm indent-3 sm:indent-5">
        {project.description}
      </p>
      <div className="w-full flex flex-col gap-1 text-sm">
        <div className="flex flex-col">
          <p className="text-white">Website</p>
          <Link
            href={project.siteUrl}
            className="text-blue-600 flex items-center gap-1 transition-colors hover:text-blue-300"
            target="_blank"
          >
            {project.siteUrl}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex flex-col">
          <p className="text-white">Stack</p>
          <p className="font-light">{project.stack}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {project.images.map((image) => (
          <Image
            key={image}
            src={image}
            alt="Project image"
            sizes="100vw"
            className="w-full h-auto rounded-2xl"
            width={500}
            height={300}
          />
        ))}
      </div>
      <div className="flex gap-2">
        {project.mobileImages.map((image) => (
          <Image
            key={image}
            src={image}
            alt="Project image"
            sizes="100vw"
            className="w-full h-auto rounded-2xl"
            width={400}
            height={800}
          />
        ))}
      </div>
    </section>
  );
}
