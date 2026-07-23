#!/usr/bin/env node
/**
 * ORCHESTRATION-CONTROLLER.mjs
 *
 * Manages parallel subagent story generation across 6 eras.
 * 
 * Usage:
 *   npm run generate:batch -- --eras all --count 6 --themes governance,warfare,philosophy
 *   npm run generate:batch -- --eras oudheid,middeleeuwen --count 3 --themes trade
 *   npm run generate:batch -- --eras twintigste-eeuw --count 6 --themes liberation
 *
 * Env vars:
 *   ANTHROPIC_API_KEY (required)
 *   BATCH_TIMEOUT_MS (default 180000, 180 seconds per subagent)
 *   BATCH_MAX_RETRIES (default 2)
 *   GIT_COMMIT (default "false"; set to "true" to auto-commit)
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Constants
const ERAS = [
  { id: "oudheid", label: "Antiquity", color: "#ffd89b" },
  { id: "middeleeuwen", label: "Middle Ages", color: "#e8b4a8" },
  { id: "vroegmoderne-tijd", label: "Early Modern", color: "#d4a574" },
  { id: "industriele-revolutie", label: "Industrial Revolution", color: "#b8956a" },
  { id: "twintigste-eeuw", label: "20th Century", color: "#9b7d5c" },
  { id: "hedendaags", label: "Contemporary", color: "#8fa3a8" },
];

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Master Orchestrator for an autonomous historical story generation system.

Your job:
1. Parse a user's batch generation request (eras, count, themes)
2. Break it into 6 parallel subagent tasks (one per era)
3. Return a JSON task breakdown

Return only valid JSON. No markdown, no preamble.

Task breakdown format:
{
  "timestamp": "2024-01-15T09:30:00Z",
  "description": "Brief summary of the batch",
  "tasks": [
    {
      "era": "oudheid",
      "label": "Antiquity",
      "count": 6,
      "themes": ["governance", "warfare", "philosophy"],
      "instruction": "Generate 6 new stories for Antiquity..."
    },
    ... (5 more for other eras)
  ]
}`;

const SUBAGENT_SYSTEM_PROMPTS = {
  oudheid: `You are a historical storyteller specializing in Antiquity (3000 BCE – 500 CE).
You generate historically accurate stories about Egypt, Mesopotamia, Greece, Rome, Persia, China, India.

Return ONLY a valid JSON array of story objects. No markdown, no preamble.
Each story must have:
- id: lowercase kebab-case, unique, <40 chars
- titel, korteBeschrijving, beschrijving: { en: string }
- themas: string[]
- afbeelding: string (URL placeholder)
- jaar: number (representative year within the era)
- blokken: array with >=1 tekst, >=1 citaat, >=1 quiz block
- illustratieKleur: "#ffd89b"
- uitgelicht: false
- volgorde: null
- tijdperkId: "oudheid"

Historical accuracy prioritized. No anachronisms. Cite sources honestly.`,

  middeleeuwen: `You are a historical storyteller specializing in the Middle Ages (500–1500 CE).
You generate stories about feudalism, chivalry, religion, plague, exploration, and the Renaissance.

Return ONLY a valid JSON array of story objects. No markdown, no preamble.
Each story must have:
- id: lowercase kebab-case, unique, <40 chars
- titel, korteBeschrijving, beschrijving: { en: string }
- themas: string[]
- afbeelding: string (URL placeholder)
- jaar: number (representative year within the era)
- blokken: array with >=1 tekst, >=1 citaat, >=1 quiz block
- illustratieKleur: "#e8b4a8"
- uitgelicht: false
- volgorde: null
- tijdperkId: "middeleeuwen"

Humanize both sides of conflicts and changes.`,

  "vroegmoderne-tijd": `You are a historical storyteller specializing in the Early Modern Period (1500–1800 CE).
You generate stories about Renaissance, exploration, Reformation, Scientific Revolution, absolute monarchies.

Return ONLY a valid JSON array of story objects. No markdown, no preamble.
Each story must have:
- id: lowercase kebab-case, unique, <40 chars
- titel, korteBeschrijving, beschrijving: { en: string }
- themas: string[]
- afbeelding: string (URL placeholder)
- jaar: number (representative year within the era)
- blokken: array with >=1 tekst, >=1 citaat, >=1 quiz block
- illustratieKleur: "#d4a574"
- uitgelicht: false
- volgorde: null
- tijdperkId: "vroegmoderne-tijd"

Include moral ambiguity: exploration brought knowledge AND colonization.`,

  "industriele-revolutie": `You are a historical storyteller specializing in the Industrial Revolution (1800–1900 CE).
You generate stories about mechanization, urbanization, ideology, and global industrialization.

Return ONLY a valid JSON array of story objects. No markdown, no preamble.
Each story must have:
- id: lowercase kebab-case, unique, <40 chars
- titel, korteBeschrijving, beschrijving: { en: string }
- themas: string[]
- afbeelding: string (URL placeholder)
- jaar: number (representative year within the era)
- blokken: array with >=1 tekst, >=1 citaat, >=1 quiz block
- illustratieKleur: "#b8956a"
- uitgelicht: false
- volgorde: null
- tijdperkId: "industriele-revolutie"

Humanize both sides: worker and factory owner, colonizer and colonized.`,

  "twintigste-eeuw": `You are a historical storyteller specializing in the 20th Century (1900–2000 CE).
You generate stories about World Wars, ideological struggles, decolonization, civil rights, scientific breakthroughs.

Return ONLY a valid JSON array of story objects. No markdown, no preamble.
Each story must have:
- id: lowercase kebab-case, unique, <40 chars
- titel, korteBeschrijving, beschrijving: { en: string }
- themas: string[]
- afbeelding: string (URL placeholder)
- jaar: number (representative year within the era)
- blokken: array with >=1 tekst, >=1 citaat, >=1 quiz block
- illustratieKleur: "#9b7d5c"
- uitgelicht: false
- volgorde: null
- tijdperkId: "twintigste-eeuw"

Trauma and hope coexist. Avoid simplistic heroism; include moral complexity.`,

  hedendaags: `You are a historical storyteller specializing in the Contemporary Era (2000–present).
You generate stories about digital revolution, climate crisis, social movements, pandemics, geopolitical shifts.

Return ONLY a valid JSON array of story objects. No markdown, no preamble.
Each story must have:
- id: lowercase kebab-case, unique, <40 chars
- titel, korteBeschrijving, beschrijving: { en: string }
- themas: string[]
- afbeelding: string (URL placeholder)
- jaar: number (representative year within the era)
- blokken: array with >=1 tekst, >=1 citaat, >=1 quiz block
- illustratieKleur: "#8fa3a8"
- uitgelicht: false
- volgorde: null
- tijdperkId: "hedendaags"

Recency breeds false certainty. Balance hope with ongoing uncertainty. Avoid hagiography.`,
};

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    eras: "all",
    count: 6,
    themes: "",
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--eras" && i + 1 < args.length)
      opts.eras = args[i + 1];
    if (args[i] === "--count" && i + 1 < args.length)
      opts.count = parseInt(args[i + 1]);
    if (args[i] === "--themes" && i + 1 < args.length)
      opts.themes = args[i + 1];
  }

  if (opts.eras === "all") {
    opts.eras = ERAS.map((e) => e.id);
  } else {
    opts.eras = opts.eras.split(",").map((e) => e.trim());
  }

  opts.themes = opts.themes
    ? opts.themes.split(",").map((t) => t.trim())
    : [];

  return opts;
}

// Initialize Anthropic client
function initClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY env var not set");
  }
  return new Anthropic({ apiKey });
}

// Call master orchestrator to plan batch
async function planBatch(client, opts) {
  console.log("[Master Orchestrator] Planning batch...");
  console.log(`  Eras: ${opts.eras.join(", ")}`);
  console.log(`  Stories per era: ${opts.count}`);
  console.log(`  Themes: ${opts.themes.join(", ") || "(none specified)"}`);

  const userMessage = `Plan a batch generation:
- Eras: ${opts.eras.join(", ")}
- Stories per era: ${opts.count}
- Themes to emphasize: ${opts.themes.join(", ") || "balanced across all themes"}

Create a task breakdown with one task per era. Each task should have:
- era: the era id
- label: the English label
- count: ${opts.count}
- themes: relevant themes for this era
- instruction: how to generate the stories`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2000,
      system: ORCHESTRATOR_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from orchestrator");
    }

    const plan = JSON.parse(content.text);
    console.log(`[Master Orchestrator] Plan created at ${plan.timestamp}`);
    return plan;
  } catch (err) {
    console.error("[Master Orchestrator] Error:", err.message);
    throw err;
  }
}

// Load existing story IDs from each era file
async function loadExistingIds() {
  const ids = {};
  for (const era of ERAS) {
    ids[era.id] = [];
    const filePath = `src/content/verhalen/${era.id}.ts`;
    try {
      const content = await fs.readFile(filePath, "utf-8");
      // Regex to extract id values: id: "value"
      const matches = content.matchAll(/id:\s*"([^"]+)"/g);
      for (const match of matches) {
        ids[era.id].push(match[1]);
      }
    } catch {
      // File doesn't exist yet; that's fine
    }
  }
  return ids;
}

// Call a single subagent
async function callSubagent(
  client,
  era,
  label,
  count,
  themes,
  existingIds,
  attempt = 1
) {
  const systemPrompt = SUBAGENT_SYSTEM_PROMPTS[era];
  const userMessage = `Generate ${count} new stories for the ${label} era.

Theme emphasis: ${themes.join(", ") || "balanced"}

Existing story IDs in ${label} (must NOT collide with these):
${existingIds.map((id) => `- ${id}`).join("\n")}

Return only a JSON array. No markdown, no preamble. Valid JSON only.`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      timeout: parseInt(process.env.BATCH_TIMEOUT_MS || "180000"),
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from subagent");
    }

    const stories = JSON.parse(content.text);
    if (!Array.isArray(stories)) {
      throw new Error("Response is not a JSON array");
    }

    // Basic validation
    const ids = stories.map((s) => s.id);
    const collisions = ids.filter((id) => existingIds.includes(id));
    if (collisions.length > 0) {
      throw new Error(
        `ID collision detected: ${collisions.join(", ")}. Regenerating...`
      );
    }

    return { success: true, stories, era };
  } catch (err) {
    const maxRetries = parseInt(process.env.BATCH_MAX_RETRIES || "2");
    if (attempt < maxRetries) {
      console.warn(
        `[${label}] Attempt ${attempt} failed: ${err.message}. Retrying...`
      );
      await new Promise((r) => setTimeout(r, 2000)); // backoff
      return callSubagent(client, era, label, count, themes, existingIds, attempt + 1);
    } else {
      console.error(`[${label}] Failed after ${maxRetries} attempts:`, err.message);
      return { success: false, era, error: err.message };
    }
  }
}

// Merge results into era files
async function mergeResults(allResults) {
  const summary = { generated: 0, errors: 0, eras: {} };

  for (const result of allResults) {
    const era = result.era;
    const label = ERAS.find((e) => e.id === era)?.label || era;

    if (result.success) {
      const stories = result.stories;
      const count = stories.length;
      summary.generated += count;
      summary.eras[era] = { count, status: "ok" };

      // Format as TypeScript export
      const tsContent = `export const ${era.replace(/-/g, "_")} = ${JSON.stringify(stories, null, 2)} as const;`;

      const dirPath = "src/content/verhalen";
      const filePath = `${dirPath}/${era}.ts`;

      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, tsContent, "utf-8");
      console.log(`[${label}] Wrote ${count} stories to ${filePath}`);
    } else {
      summary.errors++;
      summary.eras[era] = { status: "error", error: result.error };
      console.error(
        `[${label}] FAILED: ${result.error}. Skipping this era.`
      );
    }
  }

  return summary;
}

// Validate content
async function validateContent() {
  console.log("\n[Validation] Running npm run validate:content...");
  try {
    const output = execSync("npm run validate:content", {
      encoding: "utf-8",
      stdio: "pipe",
    });
    console.log(output);
    return true;
  } catch (err) {
    console.error("[Validation] validate:content failed:");
    console.error(err.stdout || err.message);
    return false;
  }
}

// Type-check
async function typeCheck() {
  console.log("[TypeCheck] Running npx tsc --noEmit...");
  try {
    execSync("npx tsc --noEmit", { stdio: "pipe" });
    console.log("[TypeCheck] ✓ All types OK");
    return true;
  } catch (err) {
    console.error("[TypeCheck] tsc failed:");
    console.error(err.stdout || err.message);
    return false;
  }
}

// Lint
async function lint() {
  console.log("[Lint] Running npm run lint...");
  try {
    execSync("npm run lint", { stdio: "pipe" });
    console.log("[Lint] ✓ Lint passed");
    return true;
  } catch (err) {
    console.error("[Lint] ESLint failed:");
    console.error(err.stdout || err.message);
    return false;
  }
}

// Commit to git (optional)
async function commitIfRequested(summary) {
  const shouldCommit = process.env.GIT_COMMIT === "true";
  if (!shouldCommit) {
    console.log("[Git] Skipping commit (set GIT_COMMIT=true to auto-commit)");
    return;
  }

  console.log("[Git] Committing changes...");
  try {
    execSync('git add src/content/verhalen', { stdio: "pipe" });
    const message = `R8: Generated ${summary.generated} new stories across eras (${Object.keys(summary.eras).length} eras)`;
    execSync(`git commit -m "${message}"`, { stdio: "pipe" });
    console.log(`[Git] ✓ Committed: ${message}`);
  } catch (err) {
    console.warn("[Git] Commit failed (non-fatal):", err.message);
  }
}

// Main
async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("    ORCHESTRATION CONTROLLER: Multi-Era Story Generation");
  console.log("═══════════════════════════════════════════════════════════════\n");

  try {
    const opts = parseArgs();
    const client = initClient();

    // Step 1: Plan batch
    const plan = await planBatch(client, opts);

    // Step 2: Load existing IDs
    console.log("\n[Loading] Existing story IDs from era files...");
    const existingIds = await loadExistingIds();
    Object.entries(existingIds).forEach(([era, ids]) => {
      console.log(`  ${era}: ${ids.length} existing stories`);
    });

    // Step 3: Spawn parallel subagents
    console.log("\n[Subagents] Spawning parallel calls...");
    const subagentPromises = plan.tasks.map((task) =>
      callSubagent(
        client,
        task.era,
        task.label,
        task.count,
        task.themes,
        existingIds[task.era] || []
      )
    );

    const allResults = await Promise.all(subagentPromises);

    // Step 4: Merge results
    console.log("\n[Merge] Writing results to era files...");
    const summary = await mergeResults(allResults);

    // Step 5: Validate
    console.log("\n[Checkpoints]");
    const validOk = await validateContent();
    const typeOk = await typeCheck();
    const lintOk = await lint();

    if (!validOk || !typeOk || !lintOk) {
      console.error(
        "\n❌ VALIDATION FAILED. Rollback or fix errors manually."
      );
      process.exit(1);
    }

    // Step 6: Commit
    await commitIfRequested(summary);

    // Summary
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("✅ BATCH COMPLETE");
    console.log(`   Generated: ${summary.generated} stories`);
    console.log(`   Errors: ${summary.errors}`);
    console.log("   Status: All checks passed ✓");
    console.log("═══════════════════════════════════════════════════════════════\n");
  } catch (err) {
    console.error("\n❌ FATAL ERROR:", err.message);
    process.exit(1);
  }
}

main();
