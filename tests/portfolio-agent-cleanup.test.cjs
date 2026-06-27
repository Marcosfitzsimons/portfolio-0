const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const route = fs.readFileSync(
  path.join(
    __dirname,
    "..",
    "app",
    "api",
    "internal",
    "portfolio-agent",
    "cleanup",
    "route.ts",
  ),
  "utf8",
);
const vercel = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "vercel.json"), "utf8"),
);

describe("Portfolio Agent retention cleanup", () => {
  it("requires the cron bearer secret", () => {
    assert.match(route, /CRON_SECRET/);
    assert.match(route, /authorization/);
  });

  it("runs daily", () => {
    assert.deepEqual(vercel.crons, [
      {
        path: "/api/internal/portfolio-agent/cleanup",
        schedule: "0 3 * * *",
      },
    ]);
  });
});
