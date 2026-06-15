require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  detectNamedProject,
  rankProjects,
  quarantineConflicts,
} = require("../lib/ai/portfolio-agent/evidence.ts");

const projects = [
  {
    id: 1,
    title: "Brixa",
    description: "Hotel operations",
    stack: "React, Node.js",
    siteUrl: "",
    tags: ["AI", "Fullstack"],
    status: "live",
    year: "2025",
    showcaseOrder: 1,
  },
  {
    id: 2,
    title: "Claimence",
    description: "Coverage analysis",
    stack: "AWS, Terraform",
    siteUrl: "",
    tags: ["AWS", "Terraform", "DevOps"],
    status: "live",
    year: "2025",
    showcaseOrder: 4,
  },
];

describe("portfolio evidence", () => {
  it("matches named projects before lens ranking", () => {
    assert.equal(
      detectNamedProject("How was Claimence deployed?", projects)?.title,
      "Claimence",
    );
  });

  it("ranks cloud-tagged projects ahead of Showcase Order", () => {
    assert.equal(rankProjects(projects, ["cloud"])[0].title, "Claimence");
  });

  it("quarantines same-owner contradictions", () => {
    const result = quarantineConflicts([
      { key: "project:1:status", owner: "prisma", value: "live", sourceId: "a" },
      { key: "project:1:status", owner: "prisma", value: "archived", sourceId: "b" },
    ]);

    assert.deepEqual(result.facts, []);
    assert.deepEqual(result.conflicts[0].sourceIds.sort(), ["a", "b"]);
  });
});
