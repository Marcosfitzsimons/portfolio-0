import Image from "next/image";
import Link from "next/link";

interface WorkProps {
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
}
const Work = ({ ...project }: WorkProps) => {
  return (
    <article className="w-full max-w-sm text-center">
      <Link
        href={`/works/${project.id}`}
        className="flex flex-col items-center gap-2"
      >
        <Image
          alt={project.title}
          src={project.coverImageSm}
          width={450}
          height={350}
          sizes="100vw"
          className="h-[13rem] w-full rounded-2xl sm:h-[10rem]"
        />
        <h3 className="font-medium">{project.title}</h3>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </Link>
    </article>
  );
};

export default Work;
