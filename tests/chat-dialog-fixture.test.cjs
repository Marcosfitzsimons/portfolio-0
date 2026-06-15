const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const pagePath = path.join(__dirname, "..", "app", "chat-dialog-test", "page.tsx");

test("chat dialog fixture page is development-only and database independent", () => {
  const source = fs.readFileSync(pagePath, "utf8");

  assert.match(source, /import\s+\{\s*notFound\s*\}\s+from\s+["']next\/navigation["'];?/);
  assert.match(source, /import\s+ChatBot\s+from\s+["']@\/components\/chat-bot["'];?/);
  assert.match(source, /process\.env\.NODE_ENV\s*===\s*["']production["']/);
  assert.match(source, /notFound\(\)/);
  assert.match(source, /Mobile chat dialog development fixture/);
  assert.match(source, /<ChatBot\s*\/>/);
  assert.doesNotMatch(source, /prisma/i);
  assert.doesNotMatch(source, /getProjects/);
});
