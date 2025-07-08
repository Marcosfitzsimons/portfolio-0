# Portfolio Project - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [UI Components](#ui-components)
4. [Custom Components](#custom-components)
5. [Server Actions](#server-actions)
6. [Database Functions](#database-functions)
7. [Utility Functions](#utility-functions)
8. [Validation Schemas](#validation-schemas)
9. [Database Models](#database-models)
10. [Usage Examples](#usage-examples)

## Overview

This is a modern portfolio website built with Next.js 14, featuring a chatbot, project showcase, and responsive design. The application uses the latest Next.js features including the App Router, Server Components, and Server Actions.

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Geist font family
- **Notifications**: Sonner toast library

---

## UI Components

### Button Component

**Location**: `components/ui/button.tsx`

A versatile button component with multiple variants and sizes.

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}
```

#### Usage

```tsx
import { Button } from "@/components/ui/button"

// Basic button
<Button>Click me</Button>

// Button variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Settings</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// As child component
<Button asChild>
  <Link href="/about">About</Link>
</Button>
```

### Input Component

**Location**: `components/ui/input.tsx`

A styled input component with focus effects and validation styling.

#### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

#### Usage

```tsx
import { Input } from "@/components/ui/input"

<Input 
  type="email" 
  placeholder="Enter your email"
  className="w-full"
/>
```

### Form Components

**Location**: `components/ui/form.tsx`

React Hook Form integration with accessible form components.

#### Components

- `Form` - Form provider wrapper
- `FormField` - Field controller
- `FormItem` - Form item container
- `FormLabel` - Accessible form label
- `FormControl` - Form control wrapper
- `FormDescription` - Field description
- `FormMessage` - Error message display

#### Usage

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const form = useForm({
  resolver: zodResolver(schema),
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="Enter email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Dialog Component

**Location**: `components/ui/dialog.tsx`

Modal dialog component built on Radix UI.

#### Components

- `Dialog` - Root component
- `DialogTrigger` - Trigger button
- `DialogContent` - Modal content
- `DialogHeader` - Modal header
- `DialogTitle` - Modal title
- `DialogDescription` - Modal description
- `DialogFooter` - Modal footer
- `DialogClose` - Close button

#### Usage

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Additional UI Components

#### Tooltip
**Location**: `components/ui/tooltip.tsx`
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Scroll Area
**Location**: `components/ui/scroll-area.tsx`
```tsx
import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="h-[200px] w-full">
  {/* Scrollable content */}
</ScrollArea>
```

#### Skeleton
**Location**: `components/ui/skeleton.tsx`
```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-[250px]" />
```

---

## Custom Components

### ChatBot Component

**Location**: `components/chat-bot.tsx`

An interactive chatbot component that answers questions about the portfolio owner.

#### Features

- Real-time chat interface
- Form validation with Zod
- Auto-scrolling messages
- Loading states
- Error handling with toast notifications

#### Usage

```tsx
import ChatBot from "@/components/chat-bot"

<ChatBot />
```

#### Dependencies

- Uses `generateChatResponse` server action
- Integrates with Google's Gemini AI API
- Form validation with `questionSchema`

### Works Component

**Location**: `components/works.tsx`

Displays a grid of work projects fetched from the database.

#### Usage

```tsx
import Works from "@/components/works"

// Server component - automatically fetches data
<Works />
```

#### Data Structure

```typescript
type Project = {
  id: number
  title: string
  description: string
  stack: string
  siteUrl: string
  coverImageSm: string
  coverImage: string
  images: string[]
  mobileImages: string[]
  isPersonal: boolean
  date: string
}
```

### Work Component

**Location**: `components/work.tsx`

Individual project card component.

#### Props

```typescript
interface WorkProps {
  id: number
  title: string
  description: string
  stack: string
  siteUrl: string
  coverImageSm: string
  coverImage: string
  images: string[]
  mobileImages: string[]
  isPersonal: boolean
  date: string
}
```

### PrimaryButton Component

**Location**: `components/primary-button.tsx`

Animated navigation button with hover effects.

#### Features

- Smooth icon transitions
- Link to works page
- Responsive design

#### Usage

```tsx
import PrimaryButton from "@/components/primary-button"

<PrimaryButton />
```

### Social Components

#### SocialLinks
**Location**: `components/social-links.tsx`
```tsx
import SocialLinks from "@/components/social-links"

<SocialLinks />
```

#### SocialLink
**Location**: `components/social-link.tsx`
```tsx
import SocialLink from "@/components/social-link"

<SocialLink href="https://github.com" icon={GitHubIcon} />
```

### Layout Components

#### Header
**Location**: `components/header.tsx`
```tsx
import Header from "@/components/header"

<Header />
```

#### Footer
**Location**: `components/footer.tsx`
```tsx
import Footer from "@/components/footer"

<Footer />
```

---

## Server Actions

### generateChatResponse

**Location**: `app/actions/actions.ts`

Server action that generates AI responses using Google's Gemini API.

#### Function Signature

```typescript
export const generateChatResponse = async (question: string): Promise<string>
```

#### Parameters

- `question: string` - User's question (3-160 characters)

#### Returns

- `Promise<string>` - AI-generated response

#### Usage

```tsx
import { generateChatResponse } from "@/app/actions/actions"

const handleSubmit = async (question: string) => {
  try {
    const response = await generateChatResponse(question)
    console.log(response)
  } catch (error) {
    console.error("Failed to generate response:", error)
  }
}
```

#### Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Error Handling

The function includes built-in error handling and will throw if the API request fails. Always wrap calls in try-catch blocks.

---

## Database Functions

**Location**: `lib/projects.ts`

### getAllProjects

Fetches all projects from the database.

```typescript
export const getAllProjects = async (): Promise<Project[]>
```

#### Usage

```tsx
import { getAllProjects } from "@/lib/projects"

const projects = await getAllProjects()
```

### getWorkProjects

Fetches only work projects (non-personal projects).

```typescript
export const getWorkProjects = async (): Promise<Project[]>
```

#### Usage

```tsx
import { getWorkProjects } from "@/lib/projects"

const workProjects = await getWorkProjects()
```

### getPersonalProjects

Fetches personal projects ordered by ID.

```typescript
export const getPersonalProjects = async (): Promise<Project[]>
```

#### Usage

```tsx
import { getPersonalProjects } from "@/lib/projects"

const personalProjects = await getPersonalProjects()
```

### getSingleProject

Fetches a single project by ID.

```typescript
export const getSingleProject = async (id: string): Promise<Project | null>
```

#### Parameters

- `id: string` - Project ID

#### Usage

```tsx
import { getSingleProject } from "@/lib/projects"

const project = await getSingleProject("1")
if (project) {
  console.log(project.title)
}
```

---

## Utility Functions

### cn (Class Name Utility)

**Location**: `lib/utils.ts`

Utility function for merging Tailwind CSS classes with conflict resolution.

#### Function Signature

```typescript
export function cn(...inputs: ClassValue[]): string
```

#### Usage

```tsx
import { cn } from "@/lib/utils"

const className = cn(
  "base-class",
  condition && "conditional-class",
  { "object-class": someCondition },
  "override-class"
)
```

### generateRandomId

**Location**: `lib/utils/generateRandomId.ts`

Generates a random ID for components.

#### Function Signature

```typescript
const generateRandomId = (): number
```

#### Usage

```tsx
import generateRandomId from "@/lib/utils/generateRandomId"

const id = generateRandomId() // Returns: random number 0-99999
```

### isPathMatching

**Location**: `lib/utils/isPathMatching.ts`

Utility for path matching (implementation details not shown).

---

## Validation Schemas

### Question Schema

**Location**: `lib/validations/question.ts`

Zod schema for validating chatbot questions.

#### Schema Definition

```typescript
export const questionSchema = z.object({
  question: z
    .string()
    .min(3, { message: "Question must be at least 3 characters" })
    .max(160, { message: "Question cannot be longer than 160 characters" }),
})
```

#### Usage

```tsx
import { questionSchema } from "@/lib/validations/question"
import { zodResolver } from "@hookform/resolvers/zod"

const form = useForm({
  resolver: zodResolver(questionSchema),
  defaultValues: { question: "" }
})
```

---

## Database Models

### Project Model

**Location**: `prisma/schema.prisma`

#### Schema Definition

```prisma
model Project {
  id           Int      @id @default(autoincrement())
  title        String
  description  String
  stack        String
  siteUrl      String
  coverImageSm String
  coverImage   String
  images       String[]
  mobileImages String[]
  isPersonal   Boolean
  date         String
}
```

#### TypeScript Type

```typescript
type Project = {
  id: number
  title: string
  description: string
  stack: string
  siteUrl: string
  coverImageSm: string
  coverImage: string
  images: string[]
  mobileImages: string[]
  isPersonal: boolean
  date: string
}
```

---

## Usage Examples

### Creating a New Page with Components

```tsx
// app/example/page.tsx
import { Button } from "@/components/ui/button"
import { getAllProjects } from "@/lib/projects"
import Works from "@/components/works"

export default async function ExamplePage() {
  const projects = await getAllProjects()
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Example Page</h1>
      
      <div className="mb-8">
        <Button variant="outline" size="lg">
          Get Started
        </Button>
      </div>
      
      <Works />
      
      <div className="mt-8 text-center">
        <p>Found {projects.length} projects</p>
      </div>
    </div>
  )
}
```

### Using the ChatBot Component

```tsx
// app/chat/page.tsx
import ChatBot from "@/components/chat-bot"

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Ask Me Anything
      </h1>
      
      <div className="flex justify-center">
        <ChatBot />
      </div>
    </div>
  )
}
```

### Form with Validation

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

type FormData = z.infer<typeof formSchema>

export default function ContactForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  })

  const onSubmit = (values: FormData) => {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Database Operations

```tsx
// app/projects/page.tsx
import { getWorkProjects, getPersonalProjects } from "@/lib/projects"

export default async function ProjectsPage() {
  const [workProjects, personalProjects] = await Promise.all([
    getWorkProjects(),
    getPersonalProjects(),
  ])

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Work Projects</h2>
        <div className="grid gap-4">
          {workProjects.map((project) => (
            <div key={project.id} className="border p-4 rounded">
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
              <p className="text-xs mt-2">Stack: {project.stack}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Personal Projects</h2>
        <div className="grid gap-4">
          {personalProjects.map((project) => (
            <div key={project.id} className="border p-4 rounded">
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

---

## Environment Setup

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# AI Chatbot
GEMINI_API_KEY="your_gemini_api_key"

# Optional
BASE_URL="http://localhost:3000"
```

### Installation

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Database Migration

```bash
# Create migration
npx prisma migrate dev --name init

# Reset database
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy
```

---

This documentation covers all the public APIs, components, and functions in your portfolio project. Each section includes detailed examples and usage instructions to help developers understand and utilize the codebase effectively.