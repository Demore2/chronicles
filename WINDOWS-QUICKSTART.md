# Windows Quick Start (PowerShell)

Zet R8 op in **G:\History App** via PowerShell.

---

## 📥 Step 1: Download the orchestration files

Download these 5 files from the chat output to your project root (`G:\History App`):

1. `AGENT-ORCHESTRATOR.md`
2. `subagent-prompts.md`
3. `orchestration-controller.mjs` ← **most important**
4. `AUTONOMOUS-OPS.md`
5. `INTEGRATION-GUIDE.md`

Also download:
- `WINDOWS-SETUP.ps1` (this script)

---

## 🚀 Step 2: Run the setup script

Open **PowerShell** as Administrator:

```powershell
# Navigate to your project
cd G:\History App

# Download + run the setup script (if you have it locally):
powershell -ExecutionPolicy Bypass -File WINDOWS-SETUP.ps1

# Alternative: if PowerShell execution policy blocks it:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then retry:
.\WINDOWS-SETUP.ps1
```

**What this does:**
- ✅ Installs `@anthropic-ai/sdk` npm package
- ✅ Updates `package.json` with new npm scripts
- ✅ Creates `.env` file template
- ✅ Verifies all files are present

---

## 🔑 Step 3: Configure your API key

Edit `.env` (in `G:\History App`):

```env
ANTHROPIC_API_KEY=sk-proj-YOUR_KEY_HERE
```

Get your key from: https://console.anthropic.com/

---

## ✅ Step 4: Test it

```powershell
# Test with 1 era, 1 story (quick)
npm run generate:batch -- --eras oudheid --count 1

# Watch for output:
# [Master Orchestrator] Planning batch...
# [Antiquity] Attempt 1 complete: 1 story
# [Validation] Running npm run validate:content...
# 4 verhalen across 6 tijdperken, 2 collecties
# [TypeCheck] ✓ All types OK
# [Lint] ✓ Lint passed
# ✅ BATCH COMPLETE
```

✓ If you see `✅ BATCH COMPLETE`, you're ready!

---

## 🎯 Step 5: Generate your first real batch

```powershell
# Generate 6 stories per era (36 total)
npm run generate:batch -- --eras all --count 6

# Or just one era:
npm run generate:batch -- --eras oudheid --count 6

# Or with specific themes:
npm run generate:batch -- --eras all --count 6 --themes governance,warfare,philosophy
```

---

## 📂 What gets created

After running `generate:batch`:

```
G:\History App\
├── .env                           (← you edit this with your API key)
├── orchestration-controller.mjs   (← the orchestrator)
├── AGENT-ORCHESTRATOR.md          (← docs)
├── package.json                   (← updated with new scripts)
└── src\content\verhalen\
    ├── oudheid.ts                 (← NEW: stories for Antiquity)
    ├── middeleeuwen.ts            (← NEW: stories for Middle Ages)
    ├── vroegmoderne-tijd.ts       (← NEW: stories for Early Modern)
    ├── industriele-revolutie.ts   (← NEW: stories for Industrial Era)
    ├── twintigste-eeuw.ts         (← NEW: stories for 20th Century)
    └── hedendaags.ts              (← NEW: stories for Contemporary)
```

---

## 🐛 Troubleshooting

### `ANTHROPIC_API_KEY not set`
**Fix:** Edit `.env` and add your key:
```
ANTHROPIC_API_KEY=sk-...
```

### `npm: command not found`
**Fix:** Node.js not installed. Download from https://nodejs.org/ and restart PowerShell.

### `orchestration-controller.mjs not found`
**Fix:** Make sure you downloaded `orchestration-controller.mjs` to `G:\History App`.

### `tsc --noEmit` failed
**Fix:** Type errors in generated content. Rare, but if it happens:
```powershell
npx tsc --noEmit    # shows the error
# Fix manually in src/content/verhalen/<era>.ts
```

### `Subagent timed out`
**Fix:** Network issue or API slow. Orchestrator retries automatically (up to 2 times).

---

## 🔄 Running batches regularly

### Option A: Manual (whenever you want)

```powershell
npm run generate:batch -- --eras all --count 3
```

### Option B: Scheduled (monthly via Windows Task Scheduler)

Open **Task Scheduler** → Create Basic Task:
- **Name:** `History App Content Batch`
- **Trigger:** Monthly (e.g., first Monday, 8 AM)
- **Action:** Start a program
  - Program: `powershell.exe`
  - Arguments: `-NoProfile -Command "cd G:\History App && npm run generate:batch -- --eras all --count 3"`
  - Start in: `G:\History App`

### Option C: Scheduled (via npm + node-schedule, if you prefer code)

See `AUTONOMOUS-OPS.md` for a JavaScript scheduler alternative.

---

## 📊 Monitoring

After each batch, check:

```powershell
# 1. See what was generated
git status

# 2. Review one story
type src/content/verhalen/oudheid.ts

# 3. Test in the app
npm run web
# Open http://localhost:8081 → Home → Oudheid → should see new story

# 4. Check validation
npm run validate:content
# Should report: "36 verhalen across 6 tijdperken, 2 collecties" (or updated count)
```

---

## 📚 Full docs

- **INTEGRATION-GUIDE.md** — Comprehensive setup (same content, just longer)
- **AGENT-ORCHESTRATOR.md** — How the system works (architecture)
- **AUTONOMOUS-OPS.md** — Scheduling, monitoring, failure recovery
- **subagent-prompts.md** — Edit era-specific instructions here

---

## 🎉 You're done!

Now you can:
- ✅ Generate stories on-demand
- ✅ Schedule monthly batches
- ✅ All validation happens automatically
- ✅ Never manually write stories again (unless you want to)

Enjoy! 🚀
