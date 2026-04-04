import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fix tags on existing projects
const tagFixes: Record<string, string[]> = {
  "Multi Step Form": ["Next.js", "Framer Motion", "TypeScript"],
  "Feeling the Groove": ["Next.js", "TypeScript"],
  Fabebus: ["MongoDB", "Express", "React", "Node.js"],
};

// New projects to insert
const newProjects = [
  {
    title: "Grab & Eat",
    description:
      "Autonomous grocery store app that allows clients to download the app and purchase items without human assistance at checkout.",
    stack: "React Native, React, Node.js, PostgreSQL",
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: false,
    date: "2024 - 2025",
    tags: ["React Native", "React", "Node.js", "PostgreSQL"],
    status: "live",
    year: "2024",
  },
  {
    title: "KeySwap",
    description:
      "Web application for mastering symmetrical inversion in piano, a powerful technique for developing balanced piano skills.",
    stack: "React, Node.js, PostgreSQL",
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: false,
    date: "2024 - 2025",
    tags: ["React", "Node.js", "PostgreSQL"],
    status: "live",
    year: "2024",
  },
  {
    title: "Claimence",
    description:
      "AI-powered coverage analysis tool for Financial Lines Claims Professionals. Streamlines decisions from months to minutes.",
    stack: "React, Node.js, Terraform, AWS, PostgreSQL",
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: false,
    date: "2025 - 2026",
    tags: ["React", "Node.js", "Terraform", "AWS", "PostgreSQL"],
    status: "live",
    year: "2025",
  },
  {
    title: "Brixa",
    description:
      "Hotel management system with AI that answers every guest question with professional, secure language. Ensures consistent guest experiences even with new team members.",
    stack: "React, Node.js, PostgreSQL",
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: false,
    date: "2025 - 2026",
    tags: ["React", "Node.js", "PostgreSQL"],
    status: "live",
    year: "2025",
  },
  {
    title: "Cash Tally",
    description:
      "A Next.js application to track daily cash tally for a grocery store.",
    stack: "Next.js, PostgreSQL",
    siteUrl: "",
    coverImageSm: "",
    coverImage: "",
    images: [],
    mobileImages: [],
    isPersonal: true,
    date: "2026",
    tags: ["Next.js", "PostgreSQL"],
    status: "live",
    year: "2026",
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
