# AGENT-ORCHESTRATOR.md

System design voor autonome, parallelle content generation via 6 subagents (één per era). Deze orchestrator werkt via Claude API en integreert met je bestaande `npm run validate:content`.

## Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│ MASTER AGENT (orchestration, validation, coordination)         │
│ - Parses user intent / batch request                           │
│ - Divides work into 6 era-specific tasks                       │
│ - Spawns parallel subagent calls via Claude API                │
│ - Collects results + cross-checks for id collisions            │
│ - Runs npm run validate:content                                │
│ - Commits to git (optional)                                    │
└─────────────────────────────────────────────────────────────────┘
         ↓                      ↓                      ↓
    ┌────────────┐        ┌────────────┐        ┌────────────┐
    │ Subagent:  │        │ Subagent:  │        │ Subagent:  │
    │ Oudheid    │        │ Middel     │        │ Vroeg      │
    │ (Antiquity)│        │ eeuwen     │        │ moderne    │
    │ (Parallel) │        │ (Parallel) │        │ (Parallel) │
    └────────────┘        └────────────┘        └────────────┘
         ↓                      ↓                      ↓
    Verhalen 6-8           Verhalen 6-8           Verhalen 6-8
    → JSON output          → JSON output          → JSON output
         ↓                      ↓                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ ORCHESTRATOR: Merge results → src/content/verhalen/               │
│ Run validate:content, tsc --noEmit, npm run lint                 │
│ → Success OR rollback                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Subagent contract

Elke subagent werkt onafhankelijk op **één** `src/content/verhalen/<era-id>.ts` bestand.

### Input (system prompt + user message)

- **System:** Specifieke era context, schema, stijl gids (zie `subagent-prompts.md`)
- **User:** Taak (e.g., "Generate 6 new stories for Antiquity about governance, warfare, philosophy, science, trade, culture") + existing verhalen (to avoid id collisions)

### Output format

JSON array van `Verhaal` objecten, klaar om in TypeScript te passen. Validator checkt:
- Unique `id` (geen collision met andere era's)
- Valid `tijdperkId`
- Every `VertaaldVeld` has `en`
- Well-formed `Blok` union
- Valid `quiz.antwoord` indices

### Failure modes

- **ID collision:** Orchestrator rejects, asks subagent to regenerate with excluded ids
- **Schema violation:** Orchestrator reports specific error, subagent fixes
- **Timeout:** Default to 180s per subagent; orchestrator retries up to 2×

## Workflow: batch content generation

### 1. User initiates batch

```bash
npm run generate:batch -- --eras all --count 6 --themes governance,warfare,philosophy
```

Orchestrator parses flags, logs them.

### 2. Master queries API once for coordination

Single Claude Sonnet call: "Given the intent above, create a task breakdown for 6 parallel subagent calls. Return as JSON: `{ tasks: [ { era, themes, count, existingIds }, ... ] }`"

### 3. Parallel subagent calls

Node streams 6 concurrent `POST /v1/messages` calls (one per era):
- System prompt tailored to era (see `subagent-prompts.md`)
- User message: task + existing stories in that era
- `max_tokens: 4000` (typical output: 6 stories = ~3000 tokens)
- Model: `claude-opus-4-8` (or `claude-sonnet-5` for cost optimization)

### 4. Collect + dedup

As results arrive (async), orchestrator:
- Parses JSON from each subagent
- Checks for id collisions **across eras**
- On collision: logs, builds "regenerate list" for that subagent
- On success: stages `src/content/verhalen/<era-id>.ts` update

### 5. Validate + commit

```bash
npm run validate:content          # checkt schema, unique ids, collection refs
npx tsc --noEmit                  # type safety
npm run lint                      # ESLint
git add src/content/              # optional: commit if all green
git commit -m "R8: generated 36 new stories (6 per era)"
```

If any step fails, **rollback** (restore from git or discard staged changes).

## Checkpoints

After **each batch generation**:

1. **Orchestrator summary:** "Generated 36 stories (6 per era), all unique ids, no breaking changes"
2. **Validation output:** stdout of `validate:content` (should say "36 verhalen across 6 tijdperken, 2 collecties" with no errors)
3. **Type safety:** `tsc --noEmit` must be green
4. **Lint:** no new ESLint errors
5. **Git status:** staged files listed (if committing)

If all pass: batch is **atomic and deployable**. No half-states.

---

## Long-term operation

### Monthly cadence (example)

Every month, run:
```bash
# Monday morning
npm run generate:batch -- --eras all --count 3 --themes seasonal_rotation

# Orchestrator:
# 1. Calls master agent to plan
# 2. Spawns 6 subagents (parallel, 180s timeout each)
# 3. Validates
# 4. Commits to git (auto-triggered by schedule)
# 5. Logs result (Slack webhook, email, etc.)
```

### Handling mid-flight failures

- **Subagent timeout:** Retry same subagent up to 2 more times, then report and skip that era
- **Validation error:** Respond to orchestrator with specific issue (e.g., "id collision: 'julius-caesar-assassination'"); orchestrator asks subagent to regenerate with that id excluded
- **Git conflict:** Orchestrator detects, aborts batch, requires manual merge, retry next window

### Monitoring / dashboards

Track:
- Stories generated per era (trend)
- Batch success rate (%)
- Time-to-validate (seconds)
- Collision rate (should be <5%)

---

## Implementation notes

- **No prompt injection risk:** Subagent input is controlled (task breakdown from master + existing story list). Story content is output only, never fed back as prompt.
- **Deterministic validation:** `validate:content` is the source of truth. Schema is enforced, not advisory.
- **Idempotent:** Re-running same batch twice on a clean repo gives bit-for-bit identical output (assuming no randomness in subagent prompts).
- **Stateless subagents:** Each era-agent is stateless; all context comes in the user message. Makes parallelization safe.

---

## See also

- `subagent-prompts.md` — era-specific system prompts + examples
- `orchestration-controller.mjs` — Node.js implementation
- `AUTONOMOUS-OPS.md` — deployment + scheduling guide
