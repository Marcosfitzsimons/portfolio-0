import Skill from "@/components/skill";
import { skills } from "@/lib/skills-source";
import { Metadata } from "next";
import AnimatedContent from "@/components/AnimatedContent";

export const metadata: Metadata = {
  title: "About me",
};

const AboutePage = () => {
  return (
    <section className="flex flex-col gap-5 py-5 sm:mx-auto sm:w-[80%]">
      <AnimatedContent direction="horizontal" reverse={false} delay={0} className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">About me</h2>
        <p className="w-full indent-3 text-sm text-muted-foreground sm:indent-5">
          As a self-taught front-end developer since 2021, I possess the
          qualifications necessary for developing user interfaces and web
          applications with a strong emphasis on responsive design and user
          experience
        </p>
        <span className="self-end text-sm font-light">from 🇦🇷 to the 🌏🚀</span>
      </AnimatedContent>
      <AnimatedContent direction="horizontal" reverse={false} delay={0.2} className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Skills</h2>
        <ul className="flex flex-wrap items-center gap-10 px-5 py-2">
          {skills.map((skill) => (
            <Skill key={skill.name} {...skill} />
          ))}
        </ul>
      </AnimatedContent>
    </section>
  );
};

export default AboutePage;
