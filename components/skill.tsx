import Image from "next/image";

const Skill = ({ ...skill }) => {
  console.log(skill);
  return (
    <li className="relative group flex flex-col items-center justify-center">
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
      <div className="opacity-0 translate-y-full font-light text-muted-foreground text-xs absolute -bottom-2 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-white">
        {skill.name}
      </div>
    </li>
  );
};

export default Skill;
