# Agentic Chatbot Upgrade: "Fitz"

## Context

The current chatbot is a basic RAG-only implementation that injects knowledge chunks into the system prompt on every request. It has no persistence, no user context, generic branding ("AI Chatbot"), and a limited UX. This upgrade transforms it into an agentic chatbot named **Fitz** that uses tools (including RAG as a tool), persists conversations in PostgreSQL, collects visitor info naturally, and has a polished conversational UI.

**Key insight**: RAG and agentic are NOT opposed — RAG becomes one tool the agent can call when it needs factual info. The agent decides *when* to retrieve knowledge vs. respond from conversation context alone.

---

## Phase 1: Database Schema (Prisma)

**File: `prisma/schema.prisma`** — Add two new models:

```prisma
model ChatSession {
  id             String        @id @default(cuid())
  visitorName    String?
  visitorCompany String?
  visitorRole    String?       // "recruiter", "developer", "hiring_manager"
  intention      String?       // "hiring", "collaboration", "curiosity"
  summary        String?       // LLM-generated conversation summary
  messageCount   Int           @default(0)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  messages       ChatMessage[]
}

model ChatMessage {
  id        String      @id @default(cuid())
  sessionId String
  session   ChatSession @relation(fields: [sessionId], references: [id])
  role      String      // "user" | "assistant"
  content   String
  createdAt DateTime    @default(now())
}
```

Run `npx prisma migrate dev` after adding the models.

---

## Phase 2: Agentic Backend

### 2a. Tool Definitions

**New file: `lib/ai/tools.ts`**

Define 3 tools using AI SDK's `tool()`:

1. **`retrieveKnowledge`** — Wraps existing `findRelevantContent` from `lib/ai/rag.ts`. Params: `{ query: string }`. The agent calls this when it needs factual info about Marcos (skills, experience, projects, etc.).

2. **`getProjects`** — Queries Prisma `Project` model. Params: `{ tag?: string }`. Returns project details when someone asks about specific projects or technologies.

3. **`saveUserInfo`** — Persists visitor info to `ChatSession`. Params: `{ name?: string, company?: string, role?: string }`. The agent calls this when the user shares identifying info (name, company, what they do).

### 2b. System Prompt

**New file: `lib/ai/system-prompt.ts`**

Build the system prompt dynamically based on session context. The prompt should:
- Establish "Fitz" persona — Marcos's AI assistant, friendly, conversational
- Instruct Fitz to ask for the visitor's name naturally in the first response
- Instruct to call `retrieveKnowledge` when it needs facts about Marcos
- Instruct to call `saveUserInfo` when visitor shares their name/company/role
- Include session context if available (visitor name, previous summary, intention)
- Keep scope: only answer about Marcos, politely redirect off-topic questions

### 2c. Context Management

**New file: `lib/ai/context.ts`**

Server-side functions for session CRUD:
- `getOrCreateSession(chatId?: string)` — Returns existing session or creates new one
- `saveMessage(sessionId, role, content)` — Persists a message
- `updateSessionContext(sessionId, data)` — Updates visitor info, intention, summary
- `getSessionContext(sessionId)` — Returns session with recent messages for context

### 2d. Route Rewrite

**File: `app/api/chat/route.ts`** — Major rewrite:

```
1. Parse { messages, chatId } from request body
2. Get or create ChatSession via chatId
3. Build system prompt with session context
4. Call streamText() with:
   - model: openai("gpt-4o-mini")
   - system: dynamic system prompt
   - tools: { retrieveKnowledge, getProjects, saveUserInfo }
   - maxSteps: 3 (allows tool call → result → final response)
   - messages: converted message history
5. Persist user message and assistant response to DB (async, non-blocking)
6. Return streaming response
```

Key change: RAG is no longer called unconditionally — the agent decides when to retrieve knowledge via the `retrieveKnowledge` tool.

---

## Phase 3: UI/UX Improvements

### 3a. New Components

**New file: `components/chat-bot/chat-avatar.tsx`**
- Fitz avatar: Gradient circle with "F" monogram matching site theme (purple/pink gradient using existing `#5227FF` / `#FF9FFC` colors)
- User avatar: First letter of their name in a circle (falls back to User icon if no name)

**New file: `components/chat-bot/chat-message.tsx`**
- Extracted message bubble component from `chat-bot.tsx`
- Takes: message content, role, userName, isStreaming
- Renders avatar + name label + styled bubble + markdown for assistant

**New file: `components/chat-bot/typing-indicator.tsx`**
- Animated 3-dot typing indicator (replaces "generating..." text)
- Shows inside a minimal assistant bubble

### 3b. Refactor chat-bot.tsx

**File: `components/chat-bot.tsx`** — Refactor:

- Replace "AI Chatbot" label → "Fitz"
- Replace Google Sparkle GIF → Fitz gradient avatar component
- Replace "You" label → visitor's name when known
- Use extracted `ChatMessage` and `TypingIndicator` components
- Increase message area from `max-h-[200px]` → `max-h-[350px]`
- Remove inner `ScrollArea` on individual messages (keep outer one)
- Add `chatId` state (generate with `nanoid` on first message, store in localStorage)
- Pass `chatId` in request body to API
- Store visitor name in localStorage when received from API context
- Auto-greeting: Use `initialMessages` prop on `useChat` to show Fitz's welcome message

### 3c. Branding Updates

- All "AI Chatbot" references → "Fitz"
- Placeholder text: "Ask me anything..." → "Chat with Fitz..." or similar
- Remove dependency on external Google Sparkle GIF URL

---

## Phase 4: Conversation Context Fields

The `ChatSession` model stores these fields, populated by the agent via tools and server-side logic:

| Field | Source | Purpose |
|-------|--------|---------|
| `visitorName` | Agent extracts from conversation via `saveUserInfo` tool | Personalize responses |
| `visitorCompany` | Agent extracts via `saveUserInfo` | Marcos can see who's visiting |
| `visitorRole` | Agent infers and saves | Tailor responses (recruiter vs dev) |
| `intention` | Server-side inference from messages | "hiring", "collaboration", "curiosity" |
| `summary` | Generated periodically server-side | Provide conversation context without full history |
| `messageCount` | Auto-incremented | Engagement signal |

The `recentTurns`, `lastTurn` context the user mentioned will be derived at request time from the stored `ChatMessage` records — no need to store them as separate fields since they're just views over the message history.

---

## Files Summary

| Action | File |
|--------|------|
| **Modify** | `prisma/schema.prisma` — Add ChatSession + ChatMessage models |
| **Modify** | `app/api/chat/route.ts` — Full rewrite with tools + maxSteps |
| **Modify** | `components/chat-bot.tsx` — Refactor UI, add chatId/name state |
| **Create** | `lib/ai/tools.ts` — Tool definitions |
| **Create** | `lib/ai/system-prompt.ts` — Dynamic system prompt builder |
| **Create** | `lib/ai/context.ts` — Session CRUD functions |
| **Create** | `components/chat-bot/chat-avatar.tsx` — Avatar components |
| **Create** | `components/chat-bot/chat-message.tsx` — Message bubble component |
| **Create** | `components/chat-bot/typing-indicator.tsx` — Animated typing dots |
| **Keep** | `lib/ai/rag.ts` — No changes, called from tool now |
| **Keep** | `lib/ai/knowledge.md` — No changes |

---

## Verification

1. **DB migration**: Run `npx prisma migrate dev`, verify ChatSession and ChatMessage tables created
2. **Tool calling**: Send a message, verify in server logs that the agent calls `retrieveKnowledge` when it needs facts
3. **Name collection**: Open chat, verify Fitz greets and asks name. Respond with name, verify `saveUserInfo` tool is called and session updated in DB
4. **Persistence**: Check PostgreSQL — sessions and messages should be stored
5. **UI**: Verify Fitz avatar shows for assistant messages, user initial/icon for user messages
6. **Typing indicator**: Verify animated dots appear while streaming (not "generating..." text)
7. **localStorage**: Refresh page, verify chatId persists and name is remembered
8. **Edge case**: Ask an off-topic question, verify Fitz redirects politely
