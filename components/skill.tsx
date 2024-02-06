import Image from "next/image";

const Skill = ({ ...skill }) => {
  return (
    <li className="group relative flex flex-col items-center justify-center">
      <div className="transition duration-300 group-hover:-translate-y-3 group-hover:text-white">
        <div className="flex items-center justify-center">
          <Image
            src={skill.src}
            alt="express"
            width={skill.width}
            height={skill.height}
          />
        </div>
      </div>
      <div className="absolute -bottom-2 translate-y-full text-xs font-light text-muted-foreground opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:text-white group-hover:opacity-100">
        {skill.name}
      </div>
    </li>
  );
};

export default Skill;
