/**
 * ADIP TypeScript SDK — quickstart example.
 * Run the backend first, then: npx tsx examples/quickstart.ts
 */
import { ADIPClient, ADIPError } from "../src/index.js";

async function main(): Promise<void> {
  const client = new ADIPClient({ baseUrl: "http://localhost:8000" });
  try {
    console.log("Health:", await client.health());

    const projects = (await client.listProjects(1, 5)) as { items?: Array<{ id: number }> };
    const items = projects.items ?? [];
    console.log(`Projects: ${items.length}`);
    if (items.length === 0) return;
    const pid = items[0].id;

    const result = (await client.orchestrate(
      "Implement UPI Auto-Reversal with NPCI reconciliation.",
    )) as { phases?: unknown[] };
    console.log("Orchestration phases:", result.phases?.length ?? 0);

    const artifact = (await client.generateArtifact(pid, "BRD")) as {
      reference: string;
      sections: unknown[];
    };
    console.log("Artifact:", artifact.reference, "sections:", artifact.sections.length);

    const reg = (await client.regressionCompare(
      "Implement UPI reversal.",
      "Implement UPI reversal with reconciliation & audit.",
    )) as { overall_verdict: string };
    console.log("Regression verdict:", reg.overall_verdict);
  } catch (err) {
    if (err instanceof ADIPError) {
      console.error(`ADIP error: ${err.message} (status=${err.status})`);
    } else {
      throw err;
    }
  }
}

main();
