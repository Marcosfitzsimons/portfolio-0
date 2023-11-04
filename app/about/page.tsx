import Skill from "@/components/skill";
import { skills } from "@/lib/skills-source";

const AboutePage = () => {
  return (
    <section className="flex flex-col gap-5 py-5 sm:w-[80%] sm:mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="font-medium text-lg">About me</h2>
        <p className="w-full text-muted-foreground text-sm indent-3 sm:indent-5">
          As a self-taught front-end developer since 2021, I possess the
          qualifications necessary for developing user interfaces and web
          applications with a strong emphasis on responsive design and user
          experience
        </p>
        <span className="text-sm self-end font-light">from 🇦🇷 to the 🌏🚀</span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-medium text-lg">Skills</h2>
        <ul className="px-5 py-2 flex items-center gap-10 flex-wrap">
          {skills.map((skill) => (
            <Skill key={skill.name} {...skill} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AboutePage;
