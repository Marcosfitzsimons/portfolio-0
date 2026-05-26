# Variant C Main App Migration Design

## Goal

Adopt the chosen Variant C prototype as the production portfolio experience while preserving the project detail route.

Variant C is the desired app shape: a dark command-story portfolio with a sticky identity sidebar, chat-first entry point, selected project stack, archive links, skills, social links, mobile section navigation, and a back-to-top action.

## Scope

Phase 1 migrates Variant C into the real app and stops for owner QA.

- `/` becomes the production one-page Variant C portfolio.
- `/works/[id]` remains the project detail route and receives a light restyle to match Variant C.
- `/about` redirects to `/#skills`.
- `/works` redirects to `/#works`.
- Prototype routes remain available during QA.
- Prototype-only controls do not appear in production.

Phase 2 cleanup happens only after owner QA approval.

- Remove prototype routes and prototype-only components.
- Remove old standalone home, about, and works list UI where unused.
- Remove legacy global nav, footer, and LightPillar shell if no longer referenced.
- Re-run verification after cleanup.

## App Structure

The root layout will provide only global app concerns: metadata, font setup, body basics, and the toaster. It will no longer force every page into the old narrow centered wrapper with global nav, footer, and LightPillar background.

Pages own their layout:

- Home renders the full-width Variant C experience.
- Project detail renders a focused dark detail page.
- Redirect pages preserve existing URLs without keeping old experiences.

## Component Boundaries

Production will not depend directly on the prototype switcher file. Variant C behavior will move into focused production components.

Production components:

- `HomeApp`: page composition for the one-page portfolio.
- `CommandBackground`: dark aurora/grid background.
- `CommandChatPanel`: chat-first section wrapper.
- `ProjectStack` and project card helpers: selected project presentation.
- `ProjectArchive`: compact links for remaining projects.
- `SkillList` and `SkillsLogoBanner`: skills sections.
- `MobileSectionNav` and `BackToTopButton`: client-side navigation helpers.

The prototype implementation remains intact during Phase 1 as the QA comparison source.

## Data Flow

Home remains server-driven:

- Fetch work projects with `getWorkProjects()`.
- Fetch personal projects with `getPersonalProjects()`.
- Normalize nullable Prisma fields into the existing `Project` type.
- Combine projects using existing Showcase Order.
- Show the first five projects in the selected project stack.
- Show the remaining projects in the archive list.

Project detail continues to fetch with `getSingleProject(params.id)`.

## Project Detail Restyle

`/works/[id]` will match Variant C without becoming a large new experience.

It keeps the existing content surface:

- cover image or gradient fallback
- breadcrumb/back path
- title and date/status metadata
- description
- tags
- website link when present
- stack
- image galleries

The restyle will use the same dark background, restrained borders, muted text, and command-story typography feel from Variant C.

## QA Gate

Phase 1 ends before any cleanup.

Owner QA compares:

- `/`
- `/prototype/app-style?variant=C`
- at least one `/works/[id]` page
- redirects from `/about` and `/works`

Cleanup does not start until the owner confirms the real app contains all desired Variant C behavior.

## Verification

Before handing Phase 1 to QA:

- run `npm run build`
- browser-check `/`
- browser-check `/prototype/app-style?variant=C`
- browser-check at least one `/works/[id]`
- browser-check `/about` and `/works` redirects

After Phase 2 cleanup:

- run `npm run build`
- repeat browser checks for production routes

## Out Of Scope

- No changes to the chat assistant policy or knowledge behavior.
- No data model changes.
- No new project ordering rules.
- No cleanup of prototype routes before owner QA approval.
