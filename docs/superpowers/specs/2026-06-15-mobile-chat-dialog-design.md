# Mobile Chat Dialog Design

## Goal

Fix the two mobile-only chat presentation failures:

1. The chat sometimes opens as a partial or incorrectly positioned drawer.
2. Focusing the prompt textarea causes the panel and composer layout to break when the software keyboard appears.

The desktop chat presentation at the existing `768px` breakpoint remains unchanged. Renaming the chatbot, adding agent capabilities, and changing chat behavior are outside this design.

## Investigation

The mobile path in `components/chat-bot.tsx` uses Vaul through the shared `Drawer` component. Its content forces both `height` and `max-height` to `100dvh`.

Vaul 1.1.2 also listens to `window.visualViewport.resize` and writes inline `height` and `bottom` values to its drawer when an input is focused. On iOS Safari, the visual viewport changes as browser chrome and the software keyboard appear. The application CSS and Vaul therefore compete to control the same panel geometry.

The full-height change was introduced in commit `1d164c8`, replacing the earlier `90dvh` mobile sheet. The reported screenshots match the resulting failure modes:

- A panel that remains partially translated or opens with the wrong visible height.
- A composer/footer that is displaced or clipped after keyboard focus.

Direct automated reproduction against the current deployment is constrained because the local page blocks on its Prisma-backed project queries, the configured public domains are unavailable, and the immutable Vercel deployment requires authentication. The source, dependency behavior, commit history, and supplied iPhone captures provide consistent evidence for the root cause.

## Architecture

Below `768px`, replace the Vaul drawer path with a Radix Dialog dedicated to the mobile presentation. Keep the current desktop Radix Dialog path unchanged.

The mobile dialog will still look and enter like a drawer:

- A fixed overlay fades over the page.
- A fixed panel animates upward from the bottom.
- Closing animates the panel downward.

It will not support drag-to-dismiss. Removing Vaul from this path removes its transform, body-lock, and keyboard repositioning logic so the application has one owner for mobile geometry.

## Mobile Layout

The mobile panel has three vertical regions:

1. A shrink-resistant header containing the assistant icon, accessible title and description, and close button.
2. A `min-height: 0` message region whose Radix ScrollArea owns conversation scrolling.
3. A shrink-resistant footer containing suggestions and the prompt input.

The panel height follows the visible viewport. A small hook will return `height` and `offsetTop`: values from `window.visualViewport` when available, with `window.innerHeight` and `0` as fallbacks. The mobile panel applies those values directly through its `height` and `top` inline styles while leaving `bottom` unset. The hook updates on visual viewport `resize` and `scroll`, because iOS Safari can move the visual viewport as browser chrome and the keyboard change.

This contract anchors the panel to the visual viewport instead of assuming that the visible viewport always begins at layout-viewport coordinate zero.

Safe-area padding uses `env(safe-area-inset-top)` for the header and `env(safe-area-inset-bottom)` for the footer. Keyboard-induced viewport reduction naturally moves the footer above the keyboard because the entire panel follows the visible viewport height rather than applying an additional keyboard offset.

## Interaction Behavior

- Opening from the collapsed input mounts the overlay and mobile dialog immediately.
- The entrance animation does not control the panel's final layout dimensions.
- The document behind the modal cannot scroll or receive pointer interaction.
- The message region remains independently scrollable.
- Focusing and typing in the textarea cannot translate the whole panel or add a second bottom offset.
- Closing through the close button, Escape where available, or the existing modal dismissal behavior restores focus and page position.
- Reopening starts from a clean final geometry rather than a stale keyboard-adjusted height.

The existing message rendering, suggestions, prompt submission, intro callout, and chat state remain unchanged.

## Component Boundaries

`components/chat-bot.tsx` will continue to own chat state and choose the desktop or mobile presentation at the current media-query breakpoint.

The mobile viewport measurement will be isolated in `hooks/use-visual-viewport.ts`. Its interface exposes `{ height, offsetTop }`, the values needed to position and size the mobile dialog. It must:

- Avoid reading browser globals during server rendering.
- Initialize after mount without causing an incorrect permanent height.
- Register and remove visual viewport listeners.
- Fall back safely when `window.visualViewport` is unavailable.

The mobile dialog remains inside `chat-bot.tsx`. Only the viewport measurement moves to the focused hook; this bug fix does not include a broader chatbot refactor.

## Accessibility

- Use Radix Dialog semantics, focus trapping, and focus restoration.
- Keep an accessible dialog title and description, even when visually hidden.
- Retain an explicitly labelled close button.
- Avoid automatic textarea focus on open so the keyboard does not appear unexpectedly.
- Respect reduced-motion preferences by reducing or removing the panel transition.

## Validation

Automated validation will use agent-browser with an iPhone-sized viewport.

### Opening

- Open the page at `390x844`.
- Record the collapsed state.
- Open the chat and wait for the entrance animation.
- Assert the overlay and dialog are visible.
- Measure the panel rectangle and confirm it fills the configured visible viewport without a gap below it.
- Confirm the header, message region, suggestions, and composer are visible.

### Keyboard Simulation

Chromium automation cannot summon the real iOS software keyboard, so validation will simulate the visual viewport reduction by changing the browser viewport while the textarea is focused.

- Focus the textarea.
- Type text and verify the value remains editable.
- Reduce the viewport height to a representative keyboard-open size.
- Assert the panel height follows the reduced viewport.
- Assert the footer remains within the viewport and below the message region.
- Assert the header remains visible.
- Restore the viewport and assert the panel returns to full height.

### Repeated Use

- Close and reopen the dialog several times.
- Repeat focus, type, resize, restore, and close.
- Confirm no stale inline dimensions, offsets, or transforms remain.
- Verify background scroll position is restored after close.

### Regression Coverage

- Verify the desktop presentation at and above `768px` retains its current dimensions, entrance animation, close behavior, and content.
- Run the existing lint, type-check, and test commands available in the repository.

### Physical iPhone Check

Before considering the bug fully resolved in production:

- Open and close the chat repeatedly in Safari.
- Test with Safari's bottom toolbar expanded and collapsed.
- Focus the prompt, type multiple lines, dismiss the keyboard, and focus again.
- Scroll messages while the keyboard is open.
- Rotate once between portrait and landscape, then return to portrait.
- Confirm the composer always sits above the keyboard and the panel always fills the visible screen.

## Non-Goals

- Renaming `ChatBot` or changing assistant branding.
- Implementing the separate agentic chatbot proposal.
- Changing the chat API, prompts, persistence, or message model.
- Redesigning desktop chat behavior.
- Preserving swipe-to-dismiss on mobile.
