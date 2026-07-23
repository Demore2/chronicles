# R9 Image Generation PoC - Setup Complete ✅

## What Claude Code Just Did

### Infrastructure
- ✅ Created image generation script: `scripts/generate-portrait-images.mjs`
- ✅ Added Replicate API integration (FLUX.1-pro text-to-image model)
- ✅ Created constants file: `src/constants/generated-images.ts` (placeholder)
- ✅ Updated `package.json` with `replicate` dep + `generate:images:r9` npm script
- ✅ Updated story card UI: `verhaal-kaart.tsx` now displays images + fallback to color

### Documentation
- ✅ `R9-QUICK-START.md` — 5-step guide for you
- ✅ `R9-IMAGE-GENERATION-POC.md` — full reference + troubleshooting
- ✅ `.env.local` — created, awaiting your Replicate token

### Code Quality
- ✅ `npx tsc --noEmit` passes (no TypeScript errors)
- ✅ All changes are backward-compatible (existing placeholders still work)

---

## What You Need to Do (5 Steps, ~10 min)

### 🔑 Step 1: Get Replicate API Token

1. Go to https://replicate.com
2. Sign up (free)
3. Copy API token from Account → API Tokens
4. Edit `G:\History App\.env.local`:
   ```
   REPLICATE_API_TOKEN=r8_your_token_here
   ```

### 🚀 Step 2: Generate Images

```powershell
cd "G:\History App"
$token = (Get-Content .env.local | Select-String 'REPLICATE_API_TOKEN' | ForEach-Object { $_ -split '=' | Select-Object -Last 1 }).Trim()
$env:REPLICATE_API_TOKEN = $token
npm run generate:images:r9
```

⏱️ Takes ~3-5 minutes (4 images × 45-60 sec each)

### 📝 Step 3: Update Story Files

**`src/content/verhalen/oudheid/personen.ts`**
- Add import: `import { GENERATED_IMAGES } from '@/constants/generated-images';`
- In `juliusCaesar` object, after `portretKleur` line, add: `afbeelding: GENERATED_IMAGES['julius-caesar'],`
- In `spartacus` object, after `portretKleur` line, add: `afbeelding: GENERATED_IMAGES['spartacus'],`

**`src/content/verhalen/oudheid/gebeurtenissen.ts`**
- Add import: `import { GENERATED_IMAGES } from '@/constants/generated-images';`
- In `romesRise` object, after `portretKleur` line, add: `afbeelding: GENERATED_IMAGES['rome-rise'],`
- In `pompeiiDisaster` object, after `portretKleur` line, add: `afbeelding: GENERATED_IMAGES['pompeii-disaster'],`

### ✅ Step 4: Type-Check

```bash
npx tsc --noEmit
```

Should be clean.

### 🧪 Step 5: Test in Browser

```bash
npm run web
```

**Verify:**
- Home page loads
- Oudheid section shows 4 cards with **portrait images** (not color blocks)
- Click card → story loads
- Scroll → chapters visible
- Switch theme (Profiel) → images stay visible

---

## Files Created/Modified

| File | Status | What It Does |
|------|--------|------------|
| `scripts/generate-portrait-images.mjs` | Created | Calls Replicate API, saves URLs |
| `src/constants/generated-images.ts` | Created (placeholder) | Holds image URLs for 4 stories |
| `src/components/verhaal-kaart.tsx` | Modified | Displays images + color fallback |
| `.env.local` | Created | Your Replicate token (you fill this) |
| `package.json` | Modified | Added replicate + npm script |
| `R9-QUICK-START.md` | Created | For you: step-by-step guide |
| `R9-IMAGE-GENERATION-POC.md` | Created | Full reference + troubleshooting |

---

## How It Works (Technical Overview)

```
Your stories in oudheid/personen.ts & gedurende.ts
         ↓
   (missing afbeelding)
         ↓
   Color placeholders show (portretKleur)
         
---
After generation:
---

Your .env.local (REPLICATE_API_TOKEN)
         ↓
scripts/generate-portrait-images.mjs
         ↓
   Replicate API (FLUX.1-pro)
         ↓
   Generated image URLs
         ↓
src/constants/generated-images.ts
         ↓
verhaal-kaart.tsx: if (verhaal.afbeelding) { show image }
else { show color }
         ↓
Browser/app displays portrait
```

---

## What Happens Next?

### R9 (This Phase) Goals:
- ✅ Infrastructure ready (scripts, components, docs)
- ⏳ You generate 4 images (Replicate API call)
- ⏳ You update story files (2 min copy-paste)
- ⏳ You test in browser (verify images display)

### R10+ (Future Phases):
- Persist images locally (AsyncStorage)
- Admin UI to batch-generate for all 36 stories
- Support other eras (Middeleeuwen, Vroegmoderne, etc.)
- Integrate with AI agent pipeline for content

---

## Questions?

**Setup issues?**
- See `R9-QUICK-START.md` → Troubleshooting section
- Or `R9-IMAGE-GENERATION-POC.md` → Full reference

**Want to understand the code?**
- `scripts/generate-portrait-images.mjs` — well-commented, ~100 lines
- `src/components/verhaal-kaart.tsx` — only ~10 lines changed

**Replicate documentation:**
- API docs: https://replicate.com/docs/api
- FLUX.1-pro model: https://replicate.com/black-forest-labs/flux-1.1-pro

---

## 🎯 Success Criteria

You'll know R9 is complete when:

- [x] Type-check passes (`npx tsc --noEmit`)
- [ ] 4 portrait images generated (via `npm run generate:images:r9`)
- [ ] `src/constants/generated-images.ts` populated with URLs
- [ ] Both story files updated with `afbeelding` lines
- [ ] Web dev server shows Oudheid cards with **portrait images** (not colors)
- [ ] Story detail page loads + shows image + chapters render
- [ ] Dark mode toggle works (images visible in both themes)

Once all boxes ✅ → R9 complete, move to R10 planning.

---

**Last updated:** 2026-07-23  
**Phase:** R9 (Image Generation PoC)  
**Status:** ⏳ Awaiting user: generate images & update stories (est. 10 min)
