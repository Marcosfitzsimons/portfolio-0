import Image from "next/image";
import { Skill as SkillType } from "@/lib/skills-source";

const Skill = ({ ...skill }: SkillType) => {
  return (
    <li className="group relative flex flex-col items-center justify-center">
      <div className="transition duration-300 group-hover:-translate-y-3 group-hover:text-white">
        <div className="relative flex items-center justify-center">
          <Image
            src={skill.src}
            alt={skill.alt}
            width={skill.width}
            height={skill.height}
          />
          {skill.badge && (
            <span className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 rounded border border-sky-500/40 bg-sky-500/20 px-1 py-0.5 text-[7px] font-semibold leading-none text-sky-400 backdrop-blur-sm">
              {skill.badge}
            </span>
          )}
        </div>
      </div>
      <div
        className={`absolute -bottom-2 translate-y-full whitespace-nowrap text-xs font-normal text-muted-foreground opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:text-white group-hover:opacity-100${skill.badge ? " -bottom-3" : ""}`}
      >
        {skill.name}
      </div>
    </li>
  );
};

export default Skill;
