require("tsconfig-paths").register({ baseUrl: ".", paths: { "@/*": ["./*"] } });
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs", moduleResolution: "node" } });

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const {
  knowledgeRecords,
  knowledgeRecordsSchema,
} = require("../lib/ai/portfolio-agent/knowledge.ts");

describe("structured portfolio knowledge", () => {
  it("validates every record and keeps IDs unique", () => {
    knowledgeRecordsSchema.parse(knowledgeRecords);
    assert.equal(
      new Set(knowledgeRecords.map(record => record.id)).size,
      knowledgeRecords.length,
    );
  });

  it("covers every Specialist lens", () => {
    for (const lens of ["ai", "product", "cloud", "mobile"]) {
      assert.ok(
        knowledgeRecords.some(record => record.lenses.includes(lens)),
        `missing ${lens} knowledge`,
      );
    }
  });

  it("uses visitor-safe public labels", () => {
    for (const record of knowledgeRecords) {
      assert.doesNotMatch(record.publicLabel, /lib\/|knowledge\.md|project:\d/i);
    }
  });
});
