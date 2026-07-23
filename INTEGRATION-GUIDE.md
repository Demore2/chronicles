# INTEGRATION-GUIDE.md

How to integrate the orchestration system into your app repository.

---

## File placement

Copy these files to your project:

```
your-app/
├── AGENT-ORCHESTRATOR.md          (new: orchestration docs)
├── AUTONOMOUS-OPS.md              (new: ops and scheduling guide)
├── subagent-prompts.md            (new: era-specific system prompts)
├── orchestration-controller.mjs    (new: Node.js controller)
├── INTEGRATION-GUIDE.md           (new: this file)
├── package.json                   (MODIFY: add scripts + deps)
├── .claude/settings.json          (ALREADY EXISTS)
├── .env.example                   (MODIFY: add ANTHROPIC_API_KEY example)
├── .github/workflows/
│   └── monthly-content.yml        (new: optional GitHub Actions)
├── src/
│   ├── content/
│   │   ├── verhalen/              (ALREADY EXISTS: now includes per-era .ts files from R3+)
│   │   │   ├── oudheid.ts
│   │   │   ├── middeleeuwen.ts
│   │   │   ├── ... (6 eras total)
│   │   │   └── index.ts           (barrel export, created in R3)
│   │   ├── collecties.ts
│   │   └── queries.ts
│   ├── app/
│   └── i18n/
├── scripts/
│   ├── validate-content.mjs       (ALREADY EXISTS: from R7)
│   └── ts-content-loader.mjs      (ALREADY EXISTS: from R7)
└── CLAUDE.md                      (UPDATE: add "R8: Autonomous content generation")
```

---

## Step 1: Copy orchestration files

```bash
# From wherever you're reading this guide:
cp AGENT-ORCHESTRATOR.md your-app/
cp AUTONOMOUS-OPS.md your-app/
cp subagent-prompts.md your-app/
cp orchestration-controller.mjs your-app/
cp INTEGRATION-GUIDE.md your-app/
```

---

## Step 2: Install dependency

```bash
cd your-app/
npm install @anthropic-ai/sdk
```

Update `package.json`:

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    ...
  }
}
```

---

## Step 3: Add npm scripts

In `package.json`, add:

```json
{
  "scripts": {
    "generate:batch": "node orchestration-controller.mjs",
    "generate:batch:dev": "BATCH_MAX_RETRIES=1 npm run generate:batch",
    "generate:batch:validate": "npm run validate:content && npx tsc --noEmit && npm run lint",
    ...
  }
}
```

---

## Step 4: Set up environment

Create or update `.env.example`:

```bash
# .env.example

# Claude API
ANTHROPIC_API_KEY=sk-...

# Orchestration options
BATCH_TIMEOUT_MS=180000       # 3 minutes per subagent
BATCH_MAX_RETRIES=2            # Retry on failure
GIT_COMMIT=false               # Set to true for auto-commit in CI
```

For local development:
```bash
cp .env.example .env
# Edit .env and add your actual ANTHROPIC_API_KEY
```

For CI (GitHub Actions, etc.):
```bash
# Add to GitHub Secrets (Settings → Secrets and variables → Actions)
ANTHROPIC_API_KEY: sk-...
```

---

## Step 5: Update CLAUDE.md

At the end of the `## Project phasing` section, add:

```markdown
**R8 (ongoing)**: Autonomous multi-era content generation via orchestrated subagents
(see `AGENT-ORCHESTRATOR.md`, `orchestration-controller.mjs`, `AUTONOMOUS-OPS.md`).
One master agent plans batches; 6 era-specific subagents generate stories in parallel.
Manual or scheduled via cron/GitHub Actions. Entry point: `npm run generate:batch`.
```

And in the `### Orphaned code` section, add a note if you later add any orphaned orchestration-related code:

```markdown
- `orchestration-controller-v1.mjs` (if ever superseded): original controller, replaced by v2.
```

---

## Step 6: Test locally

```bash
# First time: verify API key works
export ANTHROPIC_API_KEY="sk-..."

# Small test batch: 2 stories per era
npm run generate:batch -- --eras oudheid,middeleeuwen --count 2

# Monitor output
# Should see:
# [Master Orchestrator] Planning batch...
# [Antiquity] Attempt 1 complete: 2 stories
# [Middle Ages] Attempt 1 complete: 2 stories
# ...
# [Validation] Running npm run validate:content...
# 38 verhalen across 6 tijdperken, 2 collecties (updated count)
# [TypeCheck] ✓ All types OK
# [Lint] ✓ Lint passed
# ✅ BATCH COMPLETE

# Then verify stories were written
git diff src/content/verhalen/

# And test the app
npm run web
# Navigate to Home → Middle Ages → should see new stories
```

---

## Step 7: Optional — Set up GitHub Actions

If you want automated monthly batches:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/monthly-content.yml` (see template in `AUTONOMOUS-OPS.md`).

```bash
# Add ANTHROPIC_API_KEY secret to your GitHub repo
# Settings → Secrets and variables → Actions → New repository secret
```

---

## Step 8: (Optional) Set up monitoring

Add a Slack webhook for notifications (see `AUTONOMOUS-OPS.md` → "Alerting (optional)").

---

## Verification checklist

After setup, verify:

- [ ] `orchestration-controller.mjs` is in project root and executable
- [ ] `npm run generate:batch -- --eras oudheid --count 1` completes without error
- [ ] Output files are created: `src/content/verhalen/oudheid.ts` (contains new story)
- [ ] `npm run validate:content` passes (updated count reported)
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm run web` shows new story on Home and in Oudheid era screen

If all green: ✅ Integration complete!

---

## FAQ

### Q: Can I use a cheaper model (Claude Sonnet 4.6 instead of Opus 4.8)?

**A:** Yes. Edit line 243 of `orchestration-controller.mjs`:
```javascript
model: "claude-sonnet-4-6",  // ~25% cost of Opus 4.8, may be slightly slower
```

### Q: What if a batch partially fails (1 era OK, 1 era fails)?

**A:** The orchestrator reports both. Successful eras are written; failed eras are skipped. Summary shows `{ generated: 30, errors: 1 }`. You can manually retry the failed era:
```bash
npm run generate:batch -- --eras twintigste-eeuw --count 6
```

### Q: Can I run this from CI without GIT_COMMIT?

**A:** Yes. Set `GIT_COMMIT=false` (default). The files are written but not committed. Use a separate CI step to commit if you want:
```bash
git add src/content/verhalen/
git commit -m "R8: batch generated"
git push
```

### Q: How do I roll back a bad batch?

**A:** All stories are in git. Simply:
```bash
git checkout HEAD~1 src/content/verhalen/
git reset HEAD src/content/verhalen/
```

Or if not committed yet:
```bash
git checkout src/content/verhalen/
```

### Q: Can I run multiple batches in parallel?

**A:** The orchestrator itself is stateless, but writing to the same era files concurrently could cause data loss. Avoid it. Instead, use locking:
```bash
# Simple file-based lock (bash)
while [ -f /tmp/batch.lock ]; do sleep 5; done
touch /tmp/batch.lock
npm run generate:batch -- --eras all --count 6
rm /tmp/batch.lock
```

Or use a proper job queue (BullMQ, AWS SQS, etc.) for large scale.

### Q: Can I customize story themes per era?

**A:** Yes. Edit the CLI call:
```bash
npm run generate:batch -- --eras oudheid --count 6 --themes philosophy,science,governance
# Each subagent receives its themes and emphasizes them in generated stories
```

---

## Next steps

1. **Read** `AGENT-ORCHESTRATOR.md` to understand the full architecture.
2. **Review** `subagent-prompts.md` to see era-specific guidance (edit if needed).
3. **Run** a test batch: `npm run generate:batch -- --eras oudheid --count 2`.
4. **Schedule** (optional): Set up cron or GitHub Actions per `AUTONOMOUS-OPS.md`.
5. **Monitor** long-term: Check story quality monthly, re-baseline prompts annually.

---

## Support

If something breaks:

1. **Check logs:** `npm run generate:batch 2>&1 | tee debug.log`
2. **Run diagnostics:** `npm run generate:batch:validate`
3. **Consult docs:**
   - Timeout issues → `AUTONOMOUS-OPS.md` → "Failure recovery"
   - Schema errors → `CONTENT-SCHEMA.md` (in your repo)
   - Architecture questions → `AGENT-ORCHESTRATOR.md`
4. **Rollback:** `git checkout src/content/verhalen/`

---

## Credits and history

- **R1–R7**: You (the user) completed the "no more countries, era-first" refactor with Claude.
- **R8 (this system)**: Autonomous orchestration for sustainable, long-term content generation.
  - Master agent: coordinates and plans batches
  - 6 subagents: one per era, all parallel, all stateless
  - Validation: deterministic schema checks (npm run validate:content)
  - Deployment: local cron, GitHub Actions, or manual trigger
