import Works from "@/components/works";
import { Suspense } from "react";
import PersonalProjects from "@/components/personal-projects";
import { Github } from "lucide-react";
import Link from "next/link";
import WorksSkeleton from "@/components/skeletons/works-skeleton";

const WorksPage = () => {
  return (
    <section className="flex flex-col gap-10 py-5 pb-10 sm:w-[80%] sm:mx-auto">
      <div className="flex flex-col gap-3">
        <div className="w-full flex items-end justify-between">
          <h2 className="font-medium text-lg leading-5">Works</h2>
          <Link
            href="https://github.com/Marcosfitzsimons"
            className=""
            target="_blank"
          >
            <span className="text-xs font-light flex underline text-blue-600 gap-1 transition-colors hover:text-blue-300">
              Source code <Github className="h-4 w-4" />
            </span>
          </Link>
        </div>
        <Suspense fallback={<WorksSkeleton />}>
          <Works />
        </Suspense>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-medium text-lg">Personal projects</h2>
        <Suspense fallback={<WorksSkeleton />}>
          <PersonalProjects />
        </Suspense>
      </div>
    </section>
  );
};

export default WorksPage;
