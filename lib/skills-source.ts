export type Skill = {
  name: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  badge?: string;
};

export type SkillGroup = {
  category: string;
  emoji: string;
  labelClass: string;
  skills: Skill[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: "Frontend",
    emoji: "🖥️",
    labelClass: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    skills: [
      {
        name: "JavaScript",
        src: "/javascript.svg",
        alt: "JavaScript logo",
        width: 24,
        height: 24,
      },
      {
        name: "TypeScript",
        src: "/typescript-icon.svg",
        alt: "TypeScript logo",
        width: 24,
        height: 24,
      },
      {
        name: "React.js",
        src: "/react.svg",
        alt: "React logo",
        width: 24,
        height: 24,
      },
      {
        name: "Next.js",
        src: "/nextjs-icon.svg",
        alt: "Next.js logo",
        width: 32,
        height: 32,
      },
      {
        name: "React Native",
        src: "/react.svg",
        alt: "React Native logo",
        width: 24,
        height: 24,
        badge: "Native",
      },
      {
        name: "CSS",
        src: "/css-3.svg",
        alt: "CSS logo",
        width: 24,
        height: 24,
      },
      {
        name: "TailwindCSS",
        src: "/tailwindcss-icon.svg",
        alt: "TailwindCSS logo",
        width: 24,
        height: 24,
      },
      {
        name: "shadcn/ui",
        src: "/shadcn.svg",
        alt: "shadcn/ui logo",
        width: 24,
        height: 24,
      },
      {
        name: "Motion",
        src: "/motion.svg",
        alt: "Motion logo",
        width: 16,
        height: 16,
      },
    ],
  },
  {
    category: "Backend",
    emoji: "⚙️",
    labelClass:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    skills: [
      {
        name: "Node.js",
        src: "/nodejs.svg",
        alt: "Node.js logo",
        width: 45,
        height: 45,
      },
      {
        name: "Express.js",
        src: "/express.svg",
        alt: "Express.js logo",
        width: 50,
        height: 50,
      },
      {
        name: "Prisma",
        src: "/prisma.svg",
        alt: "Prisma logo",
        width: 50,
        height: 50,
      },
      {
        name: "TypeORM",
        src: "/typeorm.png",
        alt: "TypeORM logo",
        width: 24,
        height: 24,
      },
    ],
  },
  {
    category: "Databases",
    emoji: "🗄️",
    labelClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    skills: [
      {
        name: "MongoDB",
        src: "/mongodb.svg",
        alt: "MongoDB logo",
        width: 50,
        height: 50,
      },
      {
        name: "PostgreSQL",
        src: "/postgresql.svg",
        alt: "PostgreSQL logo",
        width: 25,
        height: 25,
      },
    ],
  },
  {
    category: "AI & Automation",
    emoji: "🤖",
    labelClass: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    skills: [
      {
        name: "OpenAI API",
        src: "/openai.svg",
        alt: "OpenAI logo",
        width: 24,
        height: 24,
      },
      {
        name: "LangChain",
        src: "/langchain.svg",
        alt: "LangChain logo",
        width: 32,
        height: 32,
      },
      {
        name: "Vercel AI SDK",
        src: "/ai-sdk.svg",
        alt: "Vercel AI SDK logo",
        width: 38,
        height: 38,
      },
    ],
  },
  {
    category: "Cloud & Infra",
    emoji: "☁️",
    labelClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    skills: [
      {
        name: "AWS",
        src: "/aws.png",
        alt: "AWS logo",
        width: 40,
        height: 24,
      },
      {
        name: "Docker",
        src: "/docker.svg",
        alt: "Docker logo",
        width: 32,
        height: 32,
      },
      {
        name: "Terraform",
        src: "/terraform.svg",
        alt: "Terraform logo",
        width: 24,
        height: 24,
      },
      {
        name: "Digital Ocean",
        src: "/digital-ocean.svg",
        alt: "Digital Ocean logo",
        width: 24,
        height: 24,
      },
    ],
  },
];

export const skillTagMap = new Map<
  string,
  { labelClass: string; groupOrder: number }
>(
  skillGroups.flatMap((group, i) =>
    group.skills.map((skill) => [
      skill.name,
      { labelClass: group.labelClass, groupOrder: i },
    ]),
  ),
);
