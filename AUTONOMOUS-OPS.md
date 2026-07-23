# AUTONOMOUS-OPS.md

Guide to running the orchestration system long-term, autonomously.

---

## Quick start

### 1. Install dependencies

```bash
npm install @anthropic-ai/sdk
# orchestration-controller.mjs is already bundled; no extra deps needed beyond @anthropic-ai/sdk
```

### 2. Add npm script to `package.json`

```json
{
  "scripts": {
    "generate:batch": "node orchestration-controller.mjs",
    "generate:batch:validate": "npm run validate:content && npx tsc --noEmit && npm run lint"
  }
}
```

### 3. Set environment

```bash
export ANTHROPIC_API_KEY="sk-..."
export BATCH_TIMEOUT_MS=180000       # 3 minutes per subagent
export BATCH_MAX_RETRIES=2            # retry up to 2 times on failure
export GIT_COMMIT=false                # don't auto-commit yet (set to true when confident)
```

### 4. Run a batch

```bash
# Generate 6 stories per era, rotating themes
npm run generate:batch -- --eras all --count 6 --themes governance,warfare,philosophy,science,trade,culture

# Generate only for 3 eras, specific theme
npm run generate:batch -- --eras oudheid,middeleeuwen,vroegmoderne-tijd --count 4 --themes trade

# Generate 8 stories for one era
npm run generate:batch -- --eras twintigste-eeuw --count 8 --themes liberation
```

---

## Operational modes

### Mode 1: Manual batch (developer-triggered)

**When:** You want to manually trigger content generation.

```bash
# Terminal
ANTHROPIC_API_KEY="sk-..." npm run generate:batch -- --eras all --count 6

# Output: new stories written to src/content/verhalen/*.ts
# Check git status, review changes, test app
git diff src/content/
npm run web

# If happy, commit:
git add src/content/
git commit -m "R8: Generated 36 new stories (6 per era)"
git push
```

### Mode 2: Scheduled batch (cron / GitHub Actions)

**When:** You want autonomous, recurring content generation (e.g., monthly).

#### Option A: Local cron

```bash
# Add to crontab
crontab -e

# Generate 3 stories per era, first Monday of every month, 8 AM
0 8 1-7 * 1 cd /path/to/app && ANTHROPIC_API_KEY=$API_KEY GIT_COMMIT=true npm run generate:batch -- --eras all --count 3

# Or: every Friday at 5 PM, 1 story per era (quick refresh)
0 17 * * 5 cd /path/to/app && ANTHROPIC_API_KEY=$API_KEY npm run generate:batch -- --eras all --count 1
```

#### Option B: GitHub Actions workflow

Create `.github/workflows/monthly-content.yml`:

```yaml
name: Monthly Content Generation

on:
  schedule:
    # Every first Monday of the month at 8 AM UTC
    - cron: '0 8 1-7 * 1'
  workflow_dispatch:  # also allow manual trigger from GitHub UI

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm install

      - name: Generate batch
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          BATCH_TIMEOUT_MS: 180000
          BATCH_MAX_RETRIES: 2
          GIT_COMMIT: "true"
        run: npm run generate:batch -- --eras all --count 3

      - name: Validate
        run: |
          npm run validate:content
          npx tsc --noEmit
          npm run lint

      - name: Push
        run: |
          git config user.name "ContentBot"
          git config user.email "bot@example.com"
          git push origin main

      - name: Notify
        if: always()
        run: |
          # Optional: send Slack/email notification
          echo "Batch complete. Status: ${{ job.status }}"
```

**Secrets setup:**
```bash
# In GitHub repo settings → Secrets and variables → Actions
# Add ANTHROPIC_API_KEY
```

### Mode 3: Event-driven (webhook)

**When:** External trigger (e.g., "new theme library released").

Create a lightweight HTTP endpoint:

```javascript
// server.mjs (optional; shows the pattern)
import express from 'express';
import { execSync } from 'child_process';

const app = express();
app.use(express.json());

app.post('/webhook/generate-content', async (req, res) => {
  const { eras, count, themes, secret } = req.body;

  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const eraList = (eras || 'all').split(',').join(',');
    const themeList = (themes || '').split(',').join(',');
    
    // Spawn the orchestrator as a background job
    execSync(
      `ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY} npm run generate:batch -- --eras ${eraList} --count ${count} --themes ${themeList}`,
      { detached: true, stdio: 'ignore' }
    );

    res.json({ message: 'Batch job started', status: 'queued' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Webhook server on :3000'));
```

Then trigger via:
```bash
curl -X POST http://localhost:3000/webhook/generate-content \
  -H "Content-Type: application/json" \
  -d '{"eras": "oudheid,middeleeuwen", "count": 4, "themes": "governance", "secret": "..."}'
```

---

## Monitoring and observability

### Logs

The orchestrator prints structured output:

```
[Master Orchestrator] Planning batch...
[Antiquity] Attempt 1 complete: 6 stories
[Middle Ages] Attempt 1 complete: 6 stories
...
[Validation] Running npm run validate:content...
36 verhalen across 6 tijdperken, 2 collecties (OK)
[TypeCheck] ✓ All types OK
[Lint] ✓ Lint passed
[Git] Committed: R8: Generated 36 new stories...

✅ BATCH COMPLETE
```

Capture to file:
```bash
npm run generate:batch -- --eras all --count 6 2>&1 | tee batch-$(date +%s).log
```

### Health checks

After each batch, verify:

```bash
# 1. Validate content
npm run validate:content
# Expected: "36 verhalen across 6 tijdperken, 2 collecties" (or updated count)

# 2. Type safety
npx tsc --noEmit
# Expected: exit 0, no errors

# 3. Visual spot check
npm run web -- --clear
# Expected: Home shows all era sections with new stories; no crashes

# 4. No id collisions
git diff src/content/verhalen | grep "^+.*id:" | cut -d'"' -f2 | sort | uniq -d
# Expected: (empty; no duplicates)
```

### Alerting (optional)

Send notifications on failure:

```bash
# Wrap orchestrator call
if npm run generate:batch -- --eras all --count 6; then
  echo "✅ Batch succeeded" | mail -s "Content generation OK" ops@example.com
else
  echo "❌ Batch FAILED" | mail -s "ALERT: Content generation failed" ops@example.com
  exit 1
fi
```

Or integrate with Slack:

```bash
SLACK_WEBHOOK="https://hooks.slack.com/services/..."

send_slack() {
  local message=$1
  curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{\"text\": \"$message\"}"
}

npm run generate:batch -- --eras all --count 6 && \
  send_slack "✅ Monthly content batch generated (36 stories)" || \
  send_slack "❌ Content generation FAILED. Check logs."
```

---

## Failure recovery

### Scenario 1: Subagent timeout

**Symptom:** "[Era] timed out after 180s"

**Fix:** Orchestrator retries up to 2 times automatically. If still fails, the era is skipped and reported.

**Manual recovery:**
```bash
# Retry just that era
npm run generate:batch -- --eras oudheid --count 6

# Or increase timeout globally
BATCH_TIMEOUT_MS=300000 npm run generate:batch -- --eras all --count 6
```

### Scenario 2: ID collision

**Symptom:** "ID collision detected: julius-caesar-assassination. Regenerating..."

**What happened:** Subagent generated a story id that already exists in that era.

**What the orchestrator does:** Automatically retries the subagent with the conflicting id added to the exclusion list.

**If it persists:** Check the era file for corrupted/duplicate story ids, clean them manually, retry.

### Scenario 3: Validation error

**Symptom:** 
```
[Validation] Running npm run validate:content...
Error: Story "the-war-to-end-wars" has an invalid quiz block (antwoord index 5 out of range 0–3)
```

**What happened:** A subagent generated invalid schema.

**Manual fix:**
```bash
# Open the relevant era file
vim src/content/verhalen/twintigste-eeuw.ts

# Find and fix the story
# (e.g., change antwoord: 5 to antwoord: 2)

# Validate again
npm run validate:content

# If still broken, roll back
git checkout src/content/verhalen/twintigste-eeuw.ts
```

### Scenario 4: Type error

**Symptom:**
```
[TypeCheck] tsc failed:
src/content/verhalen/oudheid.ts:45:10 - error TS2322: 
Type '{ en: "..."; nl: "..." }' is not assignable to type '{ en: string }'.
```

**What happened:** A subagent included nl/fr/de translations (only en is allowed).

**Manual fix:**
```bash
# Edit the file
vim src/content/verhalen/oudheid.ts

# Remove non-en keys from any VertaaldVeld

# Type-check again
npx tsc --noEmit
```

### Scenario 5: Git conflict on auto-commit

**Symptom:**
```
[Git] Commit failed: fatal: your branch and origin/main have diverged
```

**What happened:** Someone pushed to main while the batch was running.

**Manual fix:**
```bash
git fetch
git rebase origin/main
git push  # or force-push if comfortable
```

---

## Capacity planning

### API costs

Claude Opus 4.8 (assumed model):
- **Per batch (6 eras, 6 stories each = 36 stories):**
  - Input: 6 × ~1500 tokens = ~9000 tokens
  - Output: 6 × ~3000 tokens = ~18000 tokens
  - Total: ~27000 tokens ≈ $0.81 per batch

**Monthly (4 batches):** ~$3.24  
**Yearly (48 batches):** ~$38.88

### Timeouts

- Per subagent: 180 seconds (3 minutes)
- 6 subagents in parallel: ~3 minutes total wall-clock time (not 18 minutes serial)
- Overhead (master + validation): ~2 minutes
- **Total per batch: ~5 minutes**

### Storage

- 36 stories ≈ 200 KB of TypeScript
- After R7 (36 stories): ~200 KB
- After 1 year (12 batches × 6 stories/era = 72 new stories): ~400 KB total
- **Not a concern for git** (source control is cheap)

---

## Long-term maintenance

### Quarterly: Review and curate

Every 3 months, run:

```bash
# Check story count by era
npm run validate:content

# Sample a story from each era
git log --oneline src/content/verhalen/ | head -20

# Read through 2–3 recent stories per era to ensure quality
npm run web
# Navigate to /tijdperk/<era-id> and spot-check
```

### Annually: Re-baseline prompts

Update `subagent-prompts.md` and `AGENT-ORCHESTRATOR.md` if:
- The app's design system changes (colors, story structure)
- New historical understanding emerges (accuracy)
- User feedback suggests a theme imbalance

Then re-commit the orchestrator controller:
```bash
git add subagent-prompts.md orchestration-controller.mjs
git commit -m "Annual: Update subagent prompts and orchestration logic"
```

### On major app updates (R9+)

If you make breaking changes to `Verhaal`, `Blok`, or `VertaaldVeld`:

1. Update `CONTENT-SCHEMA.md`
2. Update the system prompts in `orchestration-controller.mjs`
3. Test with a small manual batch: `npm run generate:batch -- --eras oudheid --count 2`
4. Verify all checks pass before scheduling the next automated batch

---

## Dashboard (optional)

For visibility, you can log batch runs to a simple database:

```bash
# After each batch, append to a CSV
echo "$(date +%s),$(echo $SUMMARY | jq -r '.generated'),$(echo $SUMMARY | jq -r '.errors')" >> batch-history.csv
```

Then visualize in a dashboard (Google Sheets, Grafana, etc.):

```bash
# Columns: Timestamp, Stories Generated, Errors
# Use a CRON job to upload CSV to a shared spreadsheet
```

---

## See also

- `AGENT-ORCHESTRATOR.md` — architecture and task flow
- `subagent-prompts.md` — era-specific prompts
- `orchestration-controller.mjs` — implementation
- `CONTENT-SCHEMA.md` — (in your project repo) schema and validation rules
