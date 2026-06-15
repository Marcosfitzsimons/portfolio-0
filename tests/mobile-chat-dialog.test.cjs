const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { describe, it } = require("node:test");

const chatBotSource = fs.readFileSync(
  path.join(__dirname, "../components/chat-bot.tsx"),
  "utf8",
);

describe("mobile chat dialog source contract", () => {
  it("removes the Vaul drawer implementation", () => {
    assert.doesNotMatch(chatBotSource, /@\/components\/ui\/drawer/);
    assert.doesNotMatch(chatBotSource, /<Drawer(?:[A-Z]|\b)/);
  });

  it("uses visual viewport metrics for mobile geometry", () => {
    assert.match(chatBotSource, /useVisualViewport/);
    assert.match(chatBotSource, /data-testid="mobile-chat-dialog"/);
    assert.match(
      chatBotSource,
      /height:\s*mobileViewport\.height\s*\?\s*`\$\{mobileViewport\.height\}px`\s*:\s*"100dvh"/,
    );
    assert.match(
      chatBotSource,
      /top:\s*mobileViewport\.offsetTop\s*\?\s*`\$\{mobileViewport\.offsetTop\}px`\s*:\s*0/,
    );
  });

  it("keeps identifiable and accessible desktop and collapsed controls", () => {
    assert.match(chatBotSource, /data-testid="desktop-chat-dialog"/);
    assert.match(chatBotSource, /aria-label="Open chat"/);
  });

  it("restores focus to the collapsed trigger when the mobile dialog closes", () => {
    assert.match(
      chatBotSource,
      /const collapsedTriggerRef = React\.useRef<HTMLDivElement \| null>\(null\)/,
    );
    assert.match(chatBotSource, /ref=\{collapsedTriggerRef\}/);
    assert.match(
      chatBotSource,
      /const handleMobileCloseAutoFocus = \(event: Event\) => \{[\s\S]*?event\.preventDefault\(\);[\s\S]*?collapsedTriggerRef\.current\?\.focus\(\);[\s\S]*?\};/,
    );
    assert.equal(
      chatBotSource.match(
        /onCloseAutoFocus=\{handleMobileCloseAutoFocus\}/g,
      )?.length,
      1,
    );
    const desktopDialogIndex = chatBotSource.indexOf(
      'data-testid="desktop-chat-dialog"',
    );
    const closeAutoFocusIndex = chatBotSource.indexOf(
      "onCloseAutoFocus={handleMobileCloseAutoFocus}",
    );
    const mobileDialogIndex = chatBotSource.indexOf(
      'data-testid="mobile-chat-dialog"',
    );
    assert.ok(desktopDialogIndex < closeAutoFocusIndex);
    assert.ok(closeAutoFocusIndex < mobileDialogIndex);
  });
});
