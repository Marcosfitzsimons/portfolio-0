import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fix tags on existing projects
const tagFixes: Record<string, string[]> = {
  Brixa: ["OpenAI API", "React.js", "Node.js", "PostgreSQL"],
  "Travel Booking App": [
    "MongoDB",
    "Express.js",
    "React.js",
    "Node.js",
    "Mercado Pago",
  ],
  "Grab & Eat": ["React Native", "React.js", "Node.js", "PostgreSQL"],
  Claimence: ["AWS", "Terraform", "React.js", "Node.js", "PostgreSQL"],
  KeySwap: ["React.js", "Node.js", "PostgreSQL", "TypeScript"],
  "Golfo Nuevo Admin": [
    "Next.js",
    "React.js",
    "TypeScript",
    "TailwindCSS",
    "shadcn/ui",
    "Node.js",
    "Express.js",
    "MongoDB",
  ],
  "Multi Step Form": ["Next.js", "Motion", "TypeScript"],
  "Feeling the Groove": ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
  "Cash Tally": ["Next.js", "PostgreSQL"],
  "Rest Countries App": ["Next.js", "TypeScript", "React.js", "TailwindCSS"],
  "Ecommerce Product Page": ["React.js", "TailwindCSS"],
};

const showcaseOrderByTitle: Record<string, number> = {
  Brixa: 10,
  "Travel Booking App": 20,
  "Grab & Eat": 30,
  Claimence: 40,
  KeySwap: 50,
  "Golfo Nuevo Admin": 60,
  "Multi Step Form": 100,
  "Cash Tally": 110,
  "Feeling the Groove": 120,
  "Rest Countries App": 130,
  "Ecommerce Product Page": 140,
};

const projectCopyUpdates: Record<
  string,
  {
    description: string;
    stack: string;
    date: string;
    year: string;
  }
> = {
  Brixa: {
    description:
      "AI hotel operations platform automating guest communication and booking workflows, helping increase conversions while reducing repetitive operational work.",
    stack: "OpenAI API, React.js, Node.js, PostgreSQL, Microservices",
    date: "2025 - Present",
    year: "2025 - Present",
  },
  "Travel Booking App": {
    description:
      "Production travel booking platform built for Fabebus with client booking, authentication, seat reservations, Mercado Pago payments, and a React admin dashboard.",
    stack:
      "Node.js, Express.js, MongoDB, React.js, TypeScript, shadcn/ui, Mercado Pago API",
    date: "2023 - 2024",
    year: "2023 - 2024",
  },
  "Grab & Eat": {
    description:
      "Autonomous grocery store platform with a React Native customer app, React admin/backoffice, Node.js backend, and staffless checkout flows.",
    stack: "React Native, React.js, Node.js, PostgreSQL",
    date: "2024 - 2025",
    year: "2024 - 2025",
  },
  Claimence: {
    description:
      "AI-powered coverage analysis product where I owned much of the AWS/Terraform infrastructure and deployment setup across dev/stage/prod environments.",
    stack: "AWS, Terraform, React.js, Node.js, PostgreSQL",
    date: "2025 - 2026",
    year: "2025 - 2026",
  },
  "Cash Tally": {
    description:
      "Personal Next.js application built to track daily cash tally for a grocery store.",
    stack: "Next.js, PostgreSQL",
    date: "2026",
    year: "2026",
  },
};

// New projects to insert
const newProjects = [
  {
    title: "Grab & Eat",
    ...projectCopyUpdates["Grab & Eat"],
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: false,
    tags: ["React Native", "React.js", "Node.js", "PostgreSQL"],
    status: "live",
    showcaseOrder: showcaseOrderByTitle["Grab & Eat"],
  },
  {
    title: "KeySwap",
    description:
      "Web application for mastering symmetrical inversion in piano, a powerful technique for developing balanced piano skills.",
    stack: "React.js, Node.js, PostgreSQL",
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: false,
    date: "2024 - 2025",
    tags: ["React.js", "Node.js", "PostgreSQL", "TypeScript"],
    status: "live",
    year: "2024",
    showcaseOrder: showcaseOrderByTitle.KeySwap,
  },
  {
    title: "Claimence",
    ...projectCopyUpdates.Claimence,
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: false,
    tags: ["AWS", "Terraform", "React.js", "Node.js", "PostgreSQL"],
    status: "live",
    showcaseOrder: showcaseOrderByTitle.Claimence,
  },
  {
    title: "Brixa",
    ...projectCopyUpdates.Brixa,
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: false,
    tags: ["OpenAI API", "React.js", "Node.js", "PostgreSQL"],
    status: "live",
    showcaseOrder: showcaseOrderByTitle.Brixa,
  },
  {
    title: "Cash Tally",
    ...projectCopyUpdates["Cash Tally"],
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: true,
    tags: ["Next.js", "PostgreSQL"],
    status: "live",
    showcaseOrder: showcaseOrderByTitle["Cash Tally"],
  },
];

async function main() {
  console.log("Fixing tags on existing projects...");
  for (const [title, tags] of Object.entries(tagFixes)) {
    const result = await prisma.project.updateMany({
      where: { title },
      data: { tags },
    });
    console.log(`  ${title}: updated ${result.count} record(s)`);
  }

  console.log("\nUpdating showcase order...");
  for (const [title, showcaseOrder] of Object.entries(showcaseOrderByTitle)) {
    const result = await prisma.project.updateMany({
      where: { title },
      data: { showcaseOrder },
    });
    console.log(`  ${title}: updated ${result.count} record(s)`);
  }

  console.log("\nUpdating project copy...");
  for (const [title, data] of Object.entries(projectCopyUpdates)) {
    const result = await prisma.project.updateMany({
      where: { title },
      data,
    });
    console.log(`  ${title}: updated ${result.count} record(s)`);
  }

  console.log("\nInserting new projects...");
  for (const project of newProjects) {
    const existing = await prisma.project.findFirst({
      where: { title: project.title },
    });
    if (existing) {
      console.log(`  ${project.title}: already exists, skipping`);
      continue;
    }
    await prisma.project.create({ data: project });
    console.log(`  ${project.title}: created`);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
