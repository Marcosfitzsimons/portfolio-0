import { z } from "zod";
import { specialistSchema } from "./schemas";

export const knowledgeRecordSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  publicLabel: z.string().min(1),
  lenses: z.array(specialistSchema).min(1),
  project: z.string().min(1).optional(),
  factType: z.enum([
    "profile",
    "contact",
    "skill",
    "education",
    "role",
    "responsibility",
    "impact",
    "boundary",
    "language",
  ]),
  content: z.string().min(20),
});

export const knowledgeRecordsSchema = z.array(knowledgeRecordSchema).min(1);
export type KnowledgeRecord = z.infer<typeof knowledgeRecordSchema>;

export const knowledgeRecords: KnowledgeRecord[] = knowledgeRecordsSchema.parse(
  [
    {
      id: "profile-summary",
      publicLabel: "Professional profile",
      lenses: ["ai", "product", "cloud", "mobile"],
      factType: "profile",
      content:
        "Marcos Fitzsimons is an AI product builder and Full-Stack Developer from Buenos Aires with 4+ years shipping software across production AI systems, web, mobile, and cloud-backed products.",
    },
    {
      id: "profile-contact",
      publicLabel: "Contact and availability",
      lenses: ["ai", "product", "cloud", "mobile"],
      factType: "contact",
      content:
        "Marcos is open to opportunities involving full-stack products, AI features, or cloud-backed systems. Contact: marcosfitzsimons@gmail.com. GitHub: github.com/marcosfitzsimons.",
    },
    {
      id: "brixa-role",
      publicLabel: "Brixa role and responsibilities",
      lenses: ["ai", "product"],
      project: "Brixa",
      factType: "responsibility",
      content:
        "Brixa is an AI hotel operations platform with tool-using agents for guest communication, booking and reservation workflows, follow-ups, and operational coordination. Marcos has been a core developer from the initial phase and now serves as the primary developer working with the client's technical and product team.",
    },
    {
      id: "brixa-boundaries",
      publicLabel: "Brixa factual boundaries",
      lenses: ["ai", "product"],
      project: "Brixa",
      factType: "boundary",
      content:
        "Describe Brixa as a hotel operations platform, not only a booking system. Do not say Marcos built it alone. Do not attribute machine learning, model training, AI research, RAG, vector search, embeddings, LangChain, or Vercel AI SDK to Brixa.",
    },
    {
      id: "claimence-infrastructure",
      publicLabel: "Claimence cloud experience",
      lenses: ["cloud"],
      project: "Claimence",
      factType: "responsibility",
      content:
        "Marcos's Claimence role focused on DevOps and infrastructure: AWS and Terraform environments, dev/stage/prod setup, S3, bastion access, load balancers, and CI/CD and autodeploy architecture.",
    },
    {
      id: "grab-and-eat-mobile",
      publicLabel: "Grab & Eat mobile experience",
      lenses: ["mobile", "product"],
      project: "Grab & Eat",
      factType: "responsibility",
      content:
        "Grab & Eat is an autonomous grocery store platform with a React Native customer application, React admin and backoffice, Node.js backend, and PostgreSQL. Marcos delivered most of the technical implementation while working closely with the project manager.",
    },
    {
      id: "fabebus-product",
      publicLabel: "Fabebus product experience",
      lenses: ["product"],
      project: "Travel Booking App",
      factType: "responsibility",
      content:
        "The Fabebus travel booking platform includes a customer booking frontend, authentication, seat reservations, real-time availability, Mercado Pago payments, a React admin dashboard, and a shared Node.js, Express, and MongoDB backend.",
    },
    {
      id: "cloud-platforms",
      publicLabel: "Cloud platform experience",
      lenses: ["cloud", "product"],
      factType: "skill",
      content:
        "Use the phrase cloud infrastructure across AWS and DigitalOcean. Claimence is the strongest AWS and Terraform proof point. Other Rocking Product systems commonly use DigitalOcean App Platform for backends and static website resources for frontends.",
    },
    {
      id: "technical-skills",
      publicLabel: "Technical skills",
      lenses: ["ai", "product", "cloud", "mobile"],
      factType: "skill",
      content:
        "Core skills include TypeScript, React, Next.js, React Native, Node.js, Express, PostgreSQL, MongoDB, Prisma, TypeORM, OpenAI API, Claude API, AI agents, tool calling, structured outputs, prompt design, context engineering, evaluations, guardrails, human-in-the-loop workflows, lifecycle hooks, AWS, Terraform, Docker, DigitalOcean, and CI/CD.",
    },
    {
      id: "education-background",
      publicLabel: "Education and learning",
      lenses: ["product"],
      factType: "education",
      content:
        "Marcos is self-taught through structured courses, documentation, and hands-on projects from University of Helsinki, FreeCodeCamp, Frontend Mentor, Udemy, FutureLearn, Platzi, Anthropic Courses, and YouTube. Recruiter-fit answers should lead with production experience rather than education.",
    },
    {
      id: "language-behavior",
      publicLabel: "Language and communication",
      lenses: ["ai", "product", "cloud", "mobile"],
      factType: "language",
      content:
        "Marcos is based in Buenos Aires, speaks Spanish natively and English professionally, and is comfortable working remotely with international teams. Answer in the visitor's language when possible.",
    },
    {
      id: "rocking-product-role",
      publicLabel: "Rocking Product role",
      lenses: ["ai", "product", "cloud", "mobile"],
      factType: "role",
      content:
        "Since 2024 Marcos has worked remotely as a Full-Stack Developer at Rocking Product across production client products involving AI agents, React and React Native frontends, Node.js backends, PostgreSQL, Docker, and cloud infrastructure across AWS and DigitalOcean.",
    },
    {
      id: "rocking-product-multitenancy",
      publicLabel: "Multi-tenant product experience",
      lenses: ["product", "cloud"],
      factType: "responsibility",
      content:
        "Rocking Product projects use multi-tenant architectures that support multiple clients or organizations from a shared codebase.",
    },
    {
      id: "brixa-platform-capabilities",
      publicLabel: "Brixa platform capabilities",
      lenses: ["ai", "product"],
      project: "Brixa",
      factType: "impact",
      content:
        "Brixa combines property-aware question answering, booking and reservation automation, guest communication, prompt-driven automation, OpenAI API integrations, multi-tenant architecture, microservices, and production-grade full-stack services.",
    },
    {
      id: "brixa-production-ai-practices",
      publicLabel: "Brixa production AI practices",
      lenses: ["ai", "product"],
      project: "Brixa",
      factType: "responsibility",
      content:
        "On Brixa, Marcos designed production AI workflows using agents, tool calling, structured outputs, prompt design, context engineering, evaluations, guardrails, human-in-the-loop review, and lifecycle hooks around model and workflow execution.",
    },
    {
      id: "brixa-business-impact",
      publicLabel: "Brixa business impact",
      lenses: ["ai", "product"],
      project: "Brixa",
      factType: "impact",
      content:
        "Brixa's AI workflows helped increase booking conversions and contributed to higher sales while reducing repetitive guest communication and operational work. Describe the direction of impact without publishing unavailable figures or attributing the result solely to AI.",
    },
    {
      id: "brixa-team-coordination",
      publicLabel: "Brixa team coordination",
      lenses: ["product", "ai"],
      project: "Brixa",
      factType: "responsibility",
      content:
        "Early in Brixa, Marcos helped coordinate a small developer team by assigning tasks, planning sprints, and executing development. He now works as the primary developer with the client's technical and product team.",
    },
    {
      id: "claimence-product-boundary",
      publicLabel: "Claimence role boundary",
      lenses: ["cloud", "ai"],
      project: "Claimence",
      factType: "boundary",
      content:
        "Claimence is an AI-powered coverage analysis product for Financial Lines Claims Professionals. It is AI-adjacent evidence for Marcos, but do not imply that he owned or implemented its core AI integration.",
    },
    {
      id: "keyswap-context",
      publicLabel: "KeySwap project context",
      lenses: ["product"],
      project: "KeySwap",
      factType: "responsibility",
      content:
        "KeySwap is a React, Node.js, and PostgreSQL web application for mastering symmetrical inversion in piano. Keep it lower-priority unless the question concerns music education, interactive learning, or domain variety.",
    },
    {
      id: "golfo-nuevo-context",
      publicLabel: "Golfo Nuevo Admin context",
      lenses: ["product"],
      project: "Golfo Nuevo Admin",
      factType: "boundary",
      content:
        "Golfo Nuevo Admin is supporting legacy work. It may appear in broad project lists but should rarely lead an answer.",
    },
    {
      id: "fabebus-naming-boundary",
      publicLabel: "Fabebus naming and role boundary",
      lenses: ["product"],
      project: "Travel Booking App",
      factType: "boundary",
      content:
        "Use Travel Booking App as the portfolio title and Fabebus travel booking platform in prose. Fabebus was the client. Mention freelance only when the visitor asks about freelance, client, independent, or contracting experience.",
    },
    {
      id: "cash-tally-context",
      publicLabel: "Cash Tally personal project",
      lenses: ["product"],
      project: "Cash Tally",
      factType: "impact",
      content:
        "Cash Tally is a Next.js and PostgreSQL personal project built for Marcos's father's grocery business to simplify end-of-day cash reconciliation. It is the strongest personal project because it solves a real business need.",
    },
    {
      id: "feeling-the-groove-context",
      publicLabel: "Feeling the Groove personal project",
      lenses: ["product"],
      project: "Feeling the Groove",
      factType: "responsibility",
      content:
        "Feeling the Groove tracks attended parties and uses the Next.js App Router, server components, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and PostgreSQL.",
    },
    {
      id: "multi-step-form-context",
      publicLabel: "Multi Step Form personal project",
      lenses: ["product"],
      project: "Multi Step Form",
      factType: "responsibility",
      content:
        "Multi Step Form is a Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui project with custom data management and Motion step transitions.",
    },
    {
      id: "early-frontend-projects",
      publicLabel: "Earlier frontend projects",
      lenses: ["product"],
      factType: "responsibility",
      content:
        "Rest Countries App and Ecommerce Product Page are earlier portfolio projects that support claims about React, API practice, and UI implementation.",
    },
    {
      id: "project-emphasis",
      publicLabel: "Project emphasis guidance",
      lenses: ["ai", "product", "cloud", "mobile"],
      factType: "boundary",
      content:
        "Default project emphasis is Brixa, Fabebus travel booking platform, Grab & Eat, Claimence, KeySwap, then Golfo Nuevo Admin. For cloud lead with Claimence; for mobile lead with Grab & Eat; for AI lead with Brixa. Personal-project emphasis is Cash Tally, Feeling the Groove, Multi Step Form, Rest Countries App, then Ecommerce Product Page.",
    },
  ],
);
