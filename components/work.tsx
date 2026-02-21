import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  type Project,
  type ProjectStatus,
  statusConfig,
} from "@/lib/project-types";
import { Calendar } from "lucide-react";

const Work = ({ ...project }: Project) => {
  const displayTags = project.tags?.slice(0, 3) || [];
  const isValidStatus = (
    status: string | undefined | null,
  ): status is ProjectStatus => {
    return status !== undefined && status !== null && status in statusConfig;
  };

  const statusConfigEntry =
    project.status && isValidStatus(project.status)
      ? statusConfig[project.status]
      : null;

  return (
    <article className="group w-full max-w-sm">
      <Link href={`/works/${project.id}`} className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            alt={project.title}
            src={project.coverImageSm || "/placeholder.svg"}
            width={450}
            height={350}
            sizes="100vw"
            className="h-[13rem] w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-[10rem]"
          />
          {statusConfigEntry && (
            <div className="absolute right-3 top-3">
              <Badge
                variant={statusConfigEntry.variant}
                className="bg-background/80 backdrop-blur-sm"
              >
                {statusConfigEntry.label}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-balance font-semibold leading-tight transition-colors group-hover:text-primary">
              {project.title}
            </h3>
          </div>

          {project.year && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{project.year}</span>
            </div>
          )}

          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          {displayTags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {displayTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags && project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default Work;
