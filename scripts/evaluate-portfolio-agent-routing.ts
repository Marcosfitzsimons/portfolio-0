import { routingCases } from "../tests/fixtures/portfolio-agent-routing-cases";
import { classifyPortfolioRequest } from "../lib/ai/portfolio-agent/classifier";
import type { PortfolioAgentMessage } from "../lib/ai/portfolio-agent/schemas";

function toMessages(lines: string[]): PortfolioAgentMessage[] {
  return lines.map((text, index) => ({
    id: `eval-${index}`,
    role: index % 2 === 0 ? "user" : "assistant",
    parts: [{ type: "text", text }],
  }));
}

async function main() {
  let incorrectRoutes = 0;
  let outOfScopeSpecialistRoutes = 0;

  for (const testCase of routingCases) {
    const actual = await classifyPortfolioRequest({
      messages: toMessages(testCase.messages),
    });
    const lensesMatch =
      [...actual.lenses].sort().join(",") ===
      [...testCase.expected.lenses].sort().join(",");
    const passed =
      actual.scope === testCase.expected.scope &&
      actual.complexity === testCase.expected.complexity &&
      lensesMatch;

    if (!passed) incorrectRoutes += 1;
    if (
      testCase.expected.scope === "out_of_scope" &&
      actual.lenses.some(lens =>
        ["ai", "product", "cloud", "mobile"].includes(lens),
      )
    ) {
      outOfScopeSpecialistRoutes += 1;
    }

    console.log(`${passed ? "PASS" : "FAIL"} ${testCase.name}`, actual);
  }

  if (outOfScopeSpecialistRoutes > 0 || incorrectRoutes > 1) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
