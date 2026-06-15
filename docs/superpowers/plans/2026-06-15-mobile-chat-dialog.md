# Mobile Chat Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile Vaul drawer with a visual-viewport-aware Radix dialog that opens full-screen and keeps its composer above the iOS keyboard, without changing desktop behavior.

**Architecture:** Keep chat state and the `768px` presentation split in `components/chat-bot.tsx`. Add a focused hook that owns visual viewport measurement, render the mobile presentation with Radix Dialog and Motion, and expose stable test identifiers for browser geometry checks. Add a development-only fixture route so agent-browser can validate the component without the Prisma-backed home page.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Radix Dialog, Motion, Tailwind CSS, Node test runner, ts-node, agent-browser.

---

## File Structure

- Create `hooks/use-visual-viewport.ts`: read and subscribe to visual viewport height and top offset with SSR-safe fallbacks.
- Create `tests/visual-viewport.test.cjs`: unit coverage for visual viewport metrics and fallback behavior.
- Modify `components/chat-bot.tsx`: remove the mobile Vaul path, add the viewport-aware mobile Radix dialog, and leave the desktop branch behavior unchanged.
- Create `tests/mobile-chat-dialog.test.cjs`: source contract that prevents Vaul from returning to the mobile component and verifies the required dialog hooks and test identifiers.
- Create `app/chat-dialog-test/page.tsx`: development-only browser fixture that renders `ChatBot` without database queries.
- Modify `package.json`: add one command that runs all Node tests.

### Task 1: Visual Viewport Measurement

**Files:**
- Create: `tests/visual-viewport.test.cjs`
- Create: `hooks/use-visual-viewport.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the failing viewport metrics test**

Create `tests/visual-viewport.test.cjs`:

```js
require("ts-node/register/transpile-only");

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  getVisualViewportMetrics,
} = require("../hooks/use-visual-viewport.ts");

describe("visual viewport metrics", () => {
  it("uses the visual viewport height and top offset when available", () => {
    assert.deepEqual(
      getVisualViewportMetrics(
        {
          height: 512.4,
          offsetTop: 18.6,
        },
        844,
      ),
      {
        height: 512,
        offsetTop: 19,
      },
    );
  });

  it("falls back to the layout viewport when visualViewport is unavailable", () => {
    assert.deepEqual(getVisualViewportMetrics(null, 844), {
      height: 844,
      offsetTop: 0,
    });
  });
});
```

- [ ] **Step 2: Add the repository test command**

Add this script to `package.json`:

```json
"test": "node --test tests/*.test.cjs"
```

The complete scripts object becomes:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "node --test tests/*.test.cjs"
}
```

- [ ] **Step 3: Run the test and verify it fails**

Run:

```powershell
npm test
```

Expected: `tests/visual-viewport.test.cjs` fails because `hooks/use-visual-viewport.ts` does not exist.

- [ ] **Step 4: Implement the viewport hook**

Create `hooks/use-visual-viewport.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export type VisualViewportMetrics = {
  height: number;
  offsetTop: number;
};

type VisualViewportSource = Pick<VisualViewport, "height" | "offsetTop">;

const INITIAL_METRICS: VisualViewportMetrics = {
  height: 0,
  offsetTop: 0,
};

export function getVisualViewportMetrics(
  viewport: VisualViewportSource | null | undefined,
  fallbackHeight: number,
): VisualViewportMetrics {
  return {
    height: Math.round(viewport?.height ?? fallbackHeight),
    offsetTop: Math.round(viewport?.offsetTop ?? 0),
  };
}

export function useVisualViewport(): VisualViewportMetrics {
  const [metrics, setMetrics] =
    useState<VisualViewportMetrics>(INITIAL_METRICS);

  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      setMetrics(getVisualViewportMetrics(viewport, window.innerHeight));
    };

    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return metrics;
}
```

- [ ] **Step 5: Run unit tests and type checking**

Run:

```powershell
npm test
npx tsc --noEmit --pretty false
```

Expected: all Node tests pass and TypeScript exits with code `0`.

- [ ] **Step 6: Commit the viewport hook**

```powershell
git add package.json hooks/use-visual-viewport.ts tests/visual-viewport.test.cjs
git commit -m "test: cover mobile visual viewport metrics"
```

### Task 2: Mobile Radix Dialog

**Files:**
- Create: `tests/mobile-chat-dialog.test.cjs`
- Modify: `components/chat-bot.tsx:8-18`
- Modify: `components/chat-bot.tsx:118-124`
- Modify: `components/chat-bot.tsx:386-512`

- [ ] **Step 1: Add the failing mobile presentation contract**

Create `tests/mobile-chat-dialog.test.cjs`:

```js
const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "..", "components", "chat-bot.tsx"),
  "utf8",
);

describe("mobile chat dialog source contract", () => {
  it("does not use Vaul in the chat component", () => {
    assert.doesNotMatch(source, /@\/components\/ui\/drawer/);
    assert.doesNotMatch(source, /<Drawer(?:Content|Header|Footer|Close|Title|Description)?\b/);
  });

  it("uses visual viewport metrics for the mobile dialog", () => {
    assert.match(source, /useVisualViewport/);
    assert.match(source, /data-testid="mobile-chat-dialog"/);
    assert.match(source, /height:\s*mobileViewport\.height/);
    assert.match(source, /top:\s*mobileViewport\.offsetTop/);
  });

  it("keeps distinct mobile and desktop dialog surfaces", () => {
    assert.match(source, /data-testid="desktop-chat-dialog"/);
    assert.match(source, /aria-label="Open chat"/);
  });
});
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run:

```powershell
node --test tests/mobile-chat-dialog.test.cjs
```

Expected: failures report the existing Drawer import and missing mobile viewport/test identifier contracts.

- [ ] **Step 3: Replace the Vaul imports with viewport and reduced-motion imports**

In `components/chat-bot.tsx`, remove:

```ts
import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerFooter,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
```

Add:

```ts
import { useVisualViewport } from "@/hooks/use-visual-viewport";
```

Change the Motion import to:

```ts
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
```

- [ ] **Step 4: Read mobile viewport state without changing chat state**

Immediately after the existing `isDesktop` declaration, add:

```ts
const mobileViewport = useVisualViewport();
const prefersReducedMotion = useReducedMotion();
```

Do not change `useChat`, `messages`, submission, suggestions, intro timing, or the desktop breakpoint.

- [ ] **Step 5: Give the collapsed trigger an accessible browser locator**

Add this property to the existing collapsed `role="button"` element:

```tsx
aria-label="Open chat"
```

- [ ] **Step 6: Add a desktop test identifier without changing desktop layout**

Add this property to the existing desktop panel `motion.div`:

```tsx
data-testid="desktop-chat-dialog"
```

Keep its existing classes exactly:

```tsx
className={cn(
  "fixed bottom-0 left-0 right-0 z-50 mx-auto flex flex-col overflow-hidden",
  "h-[95vh] w-[min(95vw,1100px)] rounded-t-2xl",
  "border border-b-0 border-white/10 bg-background/95 shadow-2xl backdrop-blur-md",
)}
```

- [ ] **Step 7: Replace only the mobile Drawer branch**

Replace the branch beginning with `<Drawer` and ending with `</Drawer>` with:

```tsx
<DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
  <AnimatePresence>
    {isOpen && (
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay asChild forceMount>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content asChild forceMount>
          <motion.div
            data-testid="mobile-chat-dialog"
            initial={prefersReducedMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: prefersReducedMotion ? 0 : "100%" }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
            }
            style={{
              height: mobileViewport.height
                ? `${mobileViewport.height}px`
                : "100dvh",
              top: mobileViewport.offsetTop
                ? `${mobileViewport.offsetTop}px`
                : 0,
            }}
            className="fixed inset-x-0 z-50 flex flex-col overflow-hidden border-0 bg-background/95 backdrop-blur-md"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
              <div className="flex items-center gap-2 text-sm text-white">
                <ShinyIcon
                  svg={SPARKLES_SVG}
                  size={20}
                  speed={2.4}
                  color="#9ca3af"
                  shineColor="#ffffff"
                />
                <DialogPrimitive.Title className="sr-only">
                  {AI_LABEL}
                </DialogPrimitive.Title>
              </div>
              <DialogPrimitive.Description className="sr-only">
                {DIALOG_DESCRIPTION}
              </DialogPrimitive.Description>
              <DialogPrimitive.Close
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </header>

            <div className="relative flex min-h-0 flex-1 flex-col px-4 pt-3">
              <ScrollArea
                ref={messagesScrollAreaRef}
                className="h-full w-full pr-2"
              >
                {messagesList}
              </ScrollArea>
              {introCallout}
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-white/10 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              {suggestionsCarousel}
              {inputArea}
            </footer>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    )}
  </AnimatePresence>
</DialogPrimitive.Root>
```

Important geometry rules:

- Do not add `bottom-0` to the mobile panel.
- Do not add `h-screen`, `h-dvh`, `max-h-*`, or another keyboard offset.
- Let `height` and `top` from `useVisualViewport` be the only final mobile geometry owners.
- Keep the message region `min-h-0 flex-1`.
- Keep the header and footer `shrink-0`.

- [ ] **Step 8: Run the focused contract, all tests, and type checking**

Run:

```powershell
node --test tests/mobile-chat-dialog.test.cjs
npm test
npx tsc --noEmit --pretty false
```

Expected: all commands exit with code `0`.

- [ ] **Step 9: Commit the mobile dialog replacement**

```powershell
git add components/chat-bot.tsx tests/mobile-chat-dialog.test.cjs
git commit -m "fix: stabilize mobile chat dialog viewport"
```

### Task 3: Development Browser Fixture

**Files:**
- Create: `app/chat-dialog-test/page.tsx`

- [ ] **Step 1: Add the database-independent fixture route**

Create `app/chat-dialog-test/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import ChatBot from "@/components/chat-bot";

export default function ChatDialogTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-[160vh] bg-[#050505] px-4 py-24 text-white">
      <div className="mx-auto max-w-xl">
        <p className="mb-6 text-sm text-zinc-400">
          Mobile chat dialog development fixture
        </p>
        <ChatBot />
        <div aria-hidden className="h-[100vh]" />
      </div>
    </main>
  );
}
```

This route must render in `next dev` without calling Prisma and must return a 404 in production.

- [ ] **Step 2: Verify the fixture compiles**

Run:

```powershell
npx tsc --noEmit --pretty false
```

Expected: TypeScript exits with code `0`.

- [ ] **Step 3: Commit the fixture**

```powershell
git add app/chat-dialog-test/page.tsx
git commit -m "test: add mobile chat browser fixture"
```

### Task 4: Agent-Browser Mobile Validation

**Files:**
- Verify: `components/chat-bot.tsx`
- Verify: `hooks/use-visual-viewport.ts`
- Verify: `app/chat-dialog-test/page.tsx`
- Capture: `.agents/mobile-chat-open.png`
- Capture: `.agents/mobile-chat-keyboard-simulated.png`

- [ ] **Step 1: Start the development server**

Run the server on port `3100` in a hidden background process:

```powershell
$stdout = ".next/mobile-chat-dev.stdout.log"
$stderr = ".next/mobile-chat-dev.stderr.log"
Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev","--","-p","3100" -WorkingDirectory (Get-Location) -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
```

Wait until this returns HTTP `200`:

```powershell
Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3100/chat-dialog-test"
```

- [ ] **Step 2: Open the mobile fixture**

```powershell
npx agent-browser --session mobile-chat close
npx agent-browser --session mobile-chat set viewport 390 844
npx agent-browser --session mobile-chat open http://127.0.0.1:3100/chat-dialog-test
npx agent-browser --session mobile-chat wait --load domcontentloaded
npx agent-browser --session mobile-chat snapshot -i -c
```

Expected: the accessibility snapshot contains the `Open chat` button and no open dialog.

- [ ] **Step 3: Open and measure the mobile dialog**

```powershell
npx agent-browser --session mobile-chat find role button click --name "Open chat"
npx agent-browser --session mobile-chat wait "[data-testid='mobile-chat-dialog']"
npx agent-browser --session mobile-chat screenshot .agents/mobile-chat-open.png
npx agent-browser --session mobile-chat eval "JSON.stringify((() => { const panel = document.querySelector('[data-testid=mobile-chat-dialog]'); const rect = panel.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, height: rect.height, viewportHeight: window.visualViewport?.height ?? window.innerHeight, closeVisible: !!document.querySelector('[aria-label=\"Close chat\"]')?.getClientRects().length }; })())"
```

Expected:

- `top` is within one pixel of `window.visualViewport.offsetTop`.
- `height` is within one pixel of `viewportHeight`.
- `bottom` is within one pixel of `top + viewportHeight`.
- `closeVisible` is `true`.

- [ ] **Step 4: Focus and type in the composer**

```powershell
npx agent-browser --session mobile-chat find placeholder "Pick a suggestion or ask anything about me..." fill "Tell me about your cloud work"
npx agent-browser --session mobile-chat get value "textarea"
```

Expected: the textarea value is `Tell me about your cloud work`.

- [ ] **Step 5: Simulate the keyboard-open visual viewport**

```powershell
npx agent-browser --session mobile-chat set viewport 390 500
npx agent-browser --session mobile-chat wait 250
npx agent-browser --session mobile-chat screenshot .agents/mobile-chat-keyboard-simulated.png
npx agent-browser --session mobile-chat eval "JSON.stringify((() => { const panel = document.querySelector('[data-testid=mobile-chat-dialog]'); const textarea = document.querySelector('textarea'); const close = document.querySelector('[aria-label=\"Close chat\"]'); const panelRect = panel.getBoundingClientRect(); const textareaRect = textarea.getBoundingClientRect(); const closeRect = close.getBoundingClientRect(); return { panelTop: panelRect.top, panelBottom: panelRect.bottom, viewportHeight: window.visualViewport?.height ?? window.innerHeight, textareaBottom: textareaRect.bottom, closeTop: closeRect.top, textareaVisible: textareaRect.bottom <= panelRect.bottom && textareaRect.top >= panelRect.top, closeVisible: closeRect.top >= panelRect.top && closeRect.bottom <= panelRect.bottom }; })())"
```

Expected:

- `panelBottom - panelTop` is within one pixel of `viewportHeight`.
- `textareaVisible` is `true`.
- `closeVisible` is `true`.
- The panel has no gap below it and no content extends beneath its bottom edge.

- [ ] **Step 6: Restore the viewport and verify clean recovery**

```powershell
npx agent-browser --session mobile-chat set viewport 390 844
npx agent-browser --session mobile-chat wait 250
npx agent-browser --session mobile-chat eval "JSON.stringify((() => { const rect = document.querySelector('[data-testid=mobile-chat-dialog]').getBoundingClientRect(); return { top: rect.top, height: rect.height, viewportHeight: window.visualViewport?.height ?? window.innerHeight }; })())"
```

Expected: panel height returns to the restored viewport height without a stale bottom offset.

- [ ] **Step 7: Verify repeated close and reopen**

```powershell
npx agent-browser --session mobile-chat find role button click --name "Close chat"
npx agent-browser --session mobile-chat wait 500
npx agent-browser --session mobile-chat find role button click --name "Open chat"
npx agent-browser --session mobile-chat wait "[data-testid='mobile-chat-dialog']"
npx agent-browser --session mobile-chat find role button click --name "Close chat"
npx agent-browser --session mobile-chat wait 500
npx agent-browser --session mobile-chat find role button click --name "Open chat"
npx agent-browser --session mobile-chat wait "[data-testid='mobile-chat-dialog']"
```

Expected: every open reaches the same full-height final geometry and every close returns focus to the collapsed trigger.

- [ ] **Step 8: Verify background scroll restoration**

Close the dialog, scroll the fixture, record the page position, reopen without scrolling the trigger into view, close, then compare:

```powershell
npx agent-browser --session mobile-chat find role button click --name "Close chat"
npx agent-browser --session mobile-chat scroll down 600
npx agent-browser --session mobile-chat eval "window.scrollY"
npx agent-browser --session mobile-chat eval "document.querySelector('[aria-label=\"Open chat\"]').click()"
npx agent-browser --session mobile-chat wait "[data-testid='mobile-chat-dialog']"
npx agent-browser --session mobile-chat find role button click --name "Close chat"
npx agent-browser --session mobile-chat wait 500
npx agent-browser --session mobile-chat eval "window.scrollY"
```

Expected: the two `window.scrollY` values are equal within one pixel.

- [ ] **Step 9: Close the mobile browser session**

```powershell
npx agent-browser --session mobile-chat close
```

### Task 5: Desktop Regression and Final Verification

**Files:**
- Verify: `components/chat-bot.tsx`
- Verify: `tests/mobile-chat-dialog.test.cjs`
- Verify: `tests/visual-viewport.test.cjs`

- [ ] **Step 1: Validate the unchanged desktop surface**

```powershell
npx agent-browser --session desktop-chat close
npx agent-browser --session desktop-chat set viewport 1024 900
npx agent-browser --session desktop-chat open http://127.0.0.1:3100/chat-dialog-test
npx agent-browser --session desktop-chat find role button click --name "Open chat"
npx agent-browser --session desktop-chat wait "[data-testid='desktop-chat-dialog']"
npx agent-browser --session desktop-chat eval "JSON.stringify({ desktopDialogs: document.querySelectorAll('[data-testid=desktop-chat-dialog]').length, mobileDialogs: document.querySelectorAll('[data-testid=mobile-chat-dialog]').length, rect: document.querySelector('[data-testid=desktop-chat-dialog]').getBoundingClientRect().toJSON() })"
```

Expected:

- `desktopDialogs` is `1`.
- `mobileDialogs` is `0`.
- Desktop width is no more than `1100px` and approximately `95vw`.
- Desktop height is approximately `95vh`.

- [ ] **Step 2: Close the desktop browser session**

```powershell
npx agent-browser --session desktop-chat close
```

- [ ] **Step 3: Run the complete verification suite**

```powershell
npm test
npm run lint
npx tsc --noEmit --pretty false
git diff --check
```

Expected: tests, lint, type checking, and whitespace validation all pass.

- [ ] **Step 4: Review the final diff for scope**

Run:

```powershell
git diff HEAD~3 -- components/chat-bot.tsx hooks/use-visual-viewport.ts app/chat-dialog-test/page.tsx tests/visual-viewport.test.cjs tests/mobile-chat-dialog.test.cjs package.json
git status --short
```

Confirm:

- No chatbot rename or agent capability work is present.
- No chat API, prompt, persistence, or message behavior changed.
- No desktop styling or animation changed.
- `CONTEXT.md` remains an unrelated user modification and is not staged.

- [ ] **Step 5: Record the physical iPhone acceptance checklist**

After deploying a preview, verify in Mobile Safari:

```text
[ ] Open and close repeatedly with Safari toolbar expanded.
[ ] Open and close repeatedly with Safari toolbar collapsed.
[ ] Focus the prompt, type multiple lines, dismiss the keyboard, and focus again.
[ ] Scroll messages while the keyboard is open.
[ ] Rotate portrait -> landscape -> portrait.
[ ] Confirm the composer remains above the keyboard.
[ ] Confirm the panel fills the visible viewport in every state.
```

- [ ] **Step 6: Commit any final verification-only adjustments**

Only if verification required a code adjustment:

```powershell
git add components/chat-bot.tsx hooks/use-visual-viewport.ts app/chat-dialog-test/page.tsx tests/visual-viewport.test.cjs tests/mobile-chat-dialog.test.cjs package.json
git commit -m "test: verify mobile chat dialog behavior"
```

Do not stage or commit `CONTEXT.md`.
