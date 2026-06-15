const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

describe("PortfolioAgent component", () => {
  it("uses the canonical component filename and export", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "components", "portfolio-agent.tsx"),
      "utf8",
    );
    assert.match(source, /const PortfolioAgent/);
    assert.match(source, /export default PortfolioAgent/);
  });

  it("sends only the latest message with a persisted conversation ID", () => {
    const source = fs.readFileSync(
      path.join(__dirname, "..", "components", "portfolio-agent.tsx"),
      "utf8",
    );
    assert.match(source, /DefaultChatTransport/);
    assert.match(source, /prepareSendMessagesRequest/);
    assert.match(source, /messages\[messages\.length - 1\]/);
    assert.match(source, /portfolio-agent-conversation-id/);
  });
});
