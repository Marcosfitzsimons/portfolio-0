# Plan: Update Works Experience in Portfolio

## Context

The `/works` page displays professional projects fetched from a PostgreSQL database (via Prisma). Currently there's a **tags bug** where all projects show "Next.js" as a badge regardless of their actual tech stack — this is a data issue in the DB, not a code bug. Additionally, Marcos needs to add **5 new projects** (4 from Rocking Product + 1 personal) and update the **RAG knowledge base** so the AI chatbot can answer questions about them.

## Finalized Decisions

### New Projects

| Project | Type | Tags | Status | Date | siteUrl |
|---------|------|------|--------|------|---------|
| Grab & Eat | Work (`isPersonal: false`) | React Native, React, Node.js, PostgreSQL | live | 2024 - 2025 | _(none)_ |
| KeySwap | Work (`isPersonal: false`) | React, Node.js, PostgreSQL | live | 2024 - 2025 | _(none)_ |
| Claimence | Work (`isPersonal: false`) | React, Node.js, Terraform, AWS, PostgreSQL | live | 2025 - 2026 | _(none)_ |
| Brixa | Work (`isPersonal: false`) | React, Node.js, PostgreSQL | live | 2025 - 2026 | _(none)_ |
| Cash Tally | Personal (`isPersonal: true`) | Next.js, PostgreSQL | live | 2026 | _(none)_ |

**All Rocking Product projects are multi-tenant.**

### Descriptions

- **Grab & Eat** — Autonomous grocery store app. Clients download the app and buy without human assistance at checkout.
- **KeySwap** — Web app for mastering symmetrical inversion in piano, a technique for developing balanced piano skills.
- **Claimence** — AI-powered coverage analysis tool for Financial Lines Claims Professionals. Streamlines decisions from months to minutes.
- **Brixa** — Hotel management system with AI that answers guest questions with professional, secure language. Ensures consistent guest experiences.
- **Cash Tally** — Personal project to track daily cash tally for a grocery store.

### Existing Project Tag Fixes

| Project | Correct Tags |
|---------|-------------|
| Multi Step Form | Next.js, Framer Motion, TypeScript |
| Feeling the Groove | Next.js, TypeScript |
| Fabebus | MongoDB, Express, React, Node.js |

### Images

All empty/placeholder for now — to be added later.

### Implementation Approach

- **Prisma seed script** (`prisma/seed.ts`) to insert new projects + fix existing tags
- **knowledge.md** update to be discussed separately before implementation

## Steps

### Step 1: Gather project details from Marcos ✅ DONE

### Step 2: Create seed script (IN PROGRESS)
- Write `prisma/seed.ts` that:
  - Fixes tags on existing projects (by title match)
  - Inserts 5 new projects with all fields
- Configure `prisma.seed` in `package.json`

### Step 3: Run seed script
- Execute `npx prisma db seed` to apply changes

### Step 4: Update RAG knowledge base (PENDING — needs discussion)
- Expand Rocking Product section with individual project details
- Mention multi-tenant architecture
- Add Cash Tally entry
- **Approach TBD with Marcos**

### Step 5: Verify
- Run dev server and check `/works` page
- Check project detail pages
- Test chatbot with new project questions

## Key Files

- `prisma/schema.prisma` — Project model definition
- `prisma/seed.ts` — Seed script (to be created)
- `lib/projects.ts` — DB query functions
- `components/work.tsx` — Work card component
- `lib/ai/knowledge.md` — RAG knowledge base (update pending discussion)
- `lib/project-types.ts` — TypeScript types & status config
