require("ts-node/register/transpile-only");

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  getVisualViewportMetrics,
} = require("../hooks/use-visual-viewport.ts");

test("rounds visual viewport metrics", () => {
  assert.deepEqual(
    getVisualViewportMetrics({ height: 512.4, offsetTop: 18.6 }, 844),
    { height: 512, offsetTop: 19 },
  );
});

test("uses the fallback height without a visual viewport", () => {
  assert.deepEqual(getVisualViewportMetrics(null, 844), {
    height: 844,
    offsetTop: 0,
  });
});
