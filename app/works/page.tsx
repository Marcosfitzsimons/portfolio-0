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
    <section className="flex flex-col gap-16 py-5 pb-10 sm:mx-auto sm:w-[80%]">
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-semibold leading-tight">Works</h2>
            <p className="text-sm text-muted-foreground">
              Professional projects built for clients and real-world
              applications
            </p>
          </div>
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-semibold leading-tight">
            Exploration & Learning
          </h2>
          <p className="text-sm text-muted-foreground">
            Projects built to explore new technologies and deepen technical
            skills
          </p>
        </div>
        <Suspense fallback={<WorksSkeleton />}>
          <PersonalProjects />
        </Suspense>
      </div>
    </section>
  );
};

export default WorksPage;
