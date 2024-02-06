import Works from "@/components/works";
import { Suspense } from "react";
import PersonalProjects from "@/components/personal-projects";
import { Github } from "lucide-react";
import Link from "next/link";
import WorksSkeleton from "@/components/skeletons/works-skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Works",
};

const WorksPage = () => {
  return (
    <section className="flex flex-col gap-10 py-5 pb-10 sm:mx-auto sm:w-[80%]">
      <div className="flex flex-col gap-3">
        <div className="flex w-full items-end justify-between">
          <h2 className="text-lg font-medium leading-5">Works</h2>
          <Link
            href="https://github.com/Marcosfitzsimons"
            className=""
            target="_blank"
          >
            <span className="flex gap-1 text-xs font-light text-blue-600 underline transition-colors hover:text-blue-300">
              Source code <Github className="h-4 w-4" />
            </span>
          </Link>
        </div>
        <Suspense fallback={<WorksSkeleton />}>
          <Works />
        </Suspense>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Personal projects</h2>
        <Suspense fallback={<WorksSkeleton />}>
          <PersonalProjects />
        </Suspense>
      </div>
    </section>
  );
};

export default WorksPage;
