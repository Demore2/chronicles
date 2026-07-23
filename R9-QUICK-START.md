# R9 PoC - Quick Start Guide

## For User: Complete the Setup in 5 Steps

### ✅ What's Already Done (by Claude Code)

1. **Script created:** `scripts/generate-portrait-images.mjs`
   - Calls Replicate API with FLUX.1-pro model
   - Generates 4 portrait images
   - Saves URLs to `src/constants/generated-images.ts`

2. **UI updated:** `src/components/verhaal-kaart.tsx`
   - Now displays `afbeelding` if available
   - Falls back to color placeholder if missing
   - No changes needed by you

3. **NPM script added:** `npm run generate:images:r9`
   - Executable command in package.json
   - No setup needed

4. **Documentation:** `R9-IMAGE-GENERATION-POC.md`
   - Full reference guide
   - Troubleshooting section

### 🚀 Your 5-Step Setup (10 minutes)

#### Step 1: Get Replicate API Token (2 min)
```
1. Go to https://replicate.com
2. Click "Sign up" (free account)
3. Verify email
4. Go to Account → API Tokens
5. Copy the token (looks like: r8_...)
```

#### Step 2: Fill `.env.local` (1 min)
File already created at: `G:\History App\.env.local`

```
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

⚠️ **Save it exactly as shown** (Windows Notepad is fine)

#### Step 3: Generate Images (3 min)
In PowerShell, navigate to project and run:

```powershell
cd "G:\History App"
$token = (Get-Content .env.local | Select-String 'REPLICATE_API_TOKEN' | ForEach-Object { $_ -split '=' | Select-Object -Last 1 }).Trim()
$env:REPLICATE_API_TOKEN = $token
npm run generate:images:r9
```

**Expected output:**
- 4 images generated (≈30-60 seconds each)
- URLs printed to console
- File saved: `src/constants/generated-images.ts`

#### Step 4: Update Story Files (2 min)

**File A:** `src/content/verhalen/oudheid/personen.ts`

Add import at line 1:
```typescript
import { GENERATED_IMAGES } from '@/constants/generated-images';
```

Find `export const juliusCaesar` and add one line after `portretKleur`:
```typescript
afbeelding: GENERATED_IMAGES['julius-caesar'],
```

Find `export const spartacus` and add one line after `portretKleur`:
```typescript
afbeelding: GENERATED_IMAGES['spartacus'],
```

**File B:** `src/content/verhalen/oudheid/gebeurtenissen.ts`

Add import at line 1:
```typescript
import { GENERATED_IMAGES } from '@/constants/generated-images';
```

Find `export const romesRise` and add one line after `portretKleur`:
```typescript
afbeelding: GENERATED_IMAGES['rome-rise'],
```

Find `export const pompeiiDisaster` and add one line after `portretKleur`:
```typescript
afbeelding: GENERATED_IMAGES['pompeii-disaster'],
```

#### Step 5: Test (2 min)

**Type-check:**
```bash
npx tsc --noEmit
```
Should be clean (no output = success).

**Start dev server:**
```bash
npm run web
```

**Verify in browser:**
- [ ] Home page loads
- [ ] Oudheid section shows 4 cards
- [ ] Cards display **portrait images** (not color blocks)
- [ ] Click any card → story page loads
- [ ] Scroll down → chapters visible
- [ ] Try switching theme (Profiel tab)

**Done! 🎉**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `REPLICATE_API_TOKEN not set` | Check `.env.local` exists, token is not empty |
| Generation timeout | Some Replicate jobs take 60+ seconds; wait and retry |
| Image URL invalid | URLs are temporary (~1 hour); regenerate if expired |
| `tsc` errors after update | Check for typos in `afbeelding: GENERATED_IMAGES[...]` |
| Images not showing | Check device/browser can reach `replicate.delivery` URLs |

## File Checklist

After completing all steps, these files should be modified:

- [x] `.env.local` — filled with token
- [x] `src/constants/generated-images.ts` — auto-generated (URLs populated)
- [x] `src/content/verhalen/oudheid/personen.ts` — 2 stories updated
- [x] `src/content/verhalen/oudheid/gebeurtenissen.ts` — 2 stories updated
- [ ] Everything else unchanged

## Next: What's Next After R9?

Once this PoC is verified working:
- **R10 (Future):** Persist images locally (AsyncStorage)
- **R11 (Future):** Admin UI for re-generating images
- **R12 (Future):** Extend to all 6 eras (36 stories total)

---

**Full details?** See `R9-IMAGE-GENERATION-POC.md`
