import Skill from "@/components/skill";
import { skillGroups, SkillGroup } from "@/lib/skills-source";
import { Metadata } from "next";
import AnimatedContent from "@/components/AnimatedContent";

export const metadata: Metadata = {
  title: "About me",
};

const SkillGroupBlock = ({ group }: { group: SkillGroup }) => (
  <div className="flex flex-col gap-3">
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${group.labelClass}`}>
      <span>{group.emoji}</span>
      {group.category}
    </span>
    <ul className="flex flex-wrap items-center gap-10 py-2">
      {group.skills.map((skill) => (
        <Skill key={skill.name} {...skill} />
      ))}
    </ul>
  </div>
);

const [frontend, backend, databases, ai, cloud] = skillGroups;

const AboutePage = () => {
  return (
    <section className="flex flex-col gap-5 py-5 sm:mx-auto sm:w-[80%]">
      <AnimatedContent direction="horizontal" reverse={false} delay={0} className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">About me</h2>
        <p className="w-full indent-3 text-sm text-muted-foreground sm:indent-5">
          I&apos;m a Full-Stack Developer building web and mobile products that integrate AI and run on scalable cloud infrastructure. What started as a self-taught curiosity in 2021 has grown into 4+ years of shipping full-stack applications — from React interfaces to Node.js backends, AWS infrastructure, and AI-powered systems. I care about building things that are reliable, well-crafted, and actually solve real problems.
        </p>
        <span className="self-end text-sm font-light">from 🇦🇷 to the 🌏🚀</span>
      </AnimatedContent>
      <AnimatedContent direction="horizontal" reverse={false} delay={0.2} className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Skills</h2>
        <div className="flex flex-col gap-6 px-2 sm:px-5">
          <SkillGroupBlock group={frontend} />
          <SkillGroupBlock group={backend} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <SkillGroupBlock group={databases} />
            <SkillGroupBlock group={ai} />
          </div>
          <SkillGroupBlock group={cloud} />
        </div>
      </AnimatedContent>
    </section>
  );
};

export default AboutePage;
