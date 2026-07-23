# R9 Image Generation PoC

**Status:** Prototype setup for 4 Oudheid stories (Julius Caesar, Spartacus, Rome's Rise, Mount Vesuvius)

## Overview

This PoC implements an end-to-end image generation pipeline:
1. **Replicate API** generates FLUX.1-pro portrait images (text → image)
2. **Generated URLs** stored in `src/constants/generated-images.ts`
3. **Story cards** display images; fallback to color placeholders if unavailable
4. **Web + native** preview tested

## Prerequisites

1. **Replicate Account** (free tier OK)
   - Sign up: https://replicate.com
   - Get API token from settings
   
2. **Node 18+** (for running generation script)

## Setup Steps

### Step 1: Install Dependencies

```bash
npm install
```

This installs `replicate` (added to devDependencies) which is needed only for the generation script.

### Step 2: Create `.env.local`

The file `.env.local` was created at the project root. Fill in your Replicate token:

```
REPLICATE_API_TOKEN=your_actual_replicate_api_token_here
```

⚠️ **Never commit `.env.local` to git** — it's in `.gitignore` by default.

### Step 3: Generate Images

Run the generation script:

```bash
REPLICATE_API_TOKEN=$(cat .env.local | grep REPLICATE_API_TOKEN | cut -d '=' -f2) npm run generate:images:r9
```

Or on Windows (PowerShell):

```powershell
$token = (Get-Content .env.local | Select-String 'REPLICATE_API_TOKEN' | ForEach-Object { $_ -split '=' | Select-Object -Last 1 })
$env:REPLICATE_API_TOKEN = $token.Trim()
npm run generate:images:r9
```

**What this does:**
- Generates 4 portrait images via FLUX.1-pro (≈ 30-60 seconds per image)
- Saves URLs to `src/constants/generated-images.ts`
- Prints next-step instructions to console

**Expected output:**
```
🎨 R9 PoC: Generating portrait images for Oudheid stories...

⏳ Generating image for: Julius Caesar...
✅ Generated: julius-caesar
   URL: https://replicate.delivery/pbxt7...

[... 3 more images ...]

📝 Saved generated image URLs to: src/constants/generated-images.ts
```

### Step 4: Update Story Files with Generated Images

After generation completes, you'll see instructions on screen. Manually apply these updates:

#### `src/content/verhalen/oudheid/personen.ts`

Add import at top:
```typescript
import { GENERATED_IMAGES } from '@/constants/generated-images';
```

Update each story object to include the generated image:

```typescript
export const juliusCaesar: Verhaal = {
  id: 'julius-caesar',
  // ... existing fields ...
  afbeelding: GENERATED_IMAGES['julius-caesar'],  // ← Add this line
  portretKleur: '#8B4513',
  // ... rest of fields ...
};

export const spartacus: Verhaal = {
  id: 'spartacus',
  // ... existing fields ...
  afbeelding: GENERATED_IMAGES['spartacus'],  // ← Add this line
  portretKleur: '#CD853F',
  // ... rest of fields ...
};
```

#### `src/content/verhalen/oudheid/gebeurtenissen.ts`

Add import at top:
```typescript
import { GENERATED_IMAGES } from '@/constants/generated-images';
```

Update each story object:

```typescript
export const romesRise: Verhaal = {
  id: 'rome-rise',
  // ... existing fields ...
  afbeelding: GENERATED_IMAGES['rome-rise'],  // ← Add this line
  portretKleur: '#A0522D',
  // ... rest of fields ...
};

export const pompeiiDisaster: Verhaal = {
  id: 'pompeii-disaster',
  // ... existing fields ...
  afbeelding: GENERATED_IMAGES['pompeii-disaster'],  // ← Add this line
  portretKleur: '#C17F4E',
  // ... rest of fields ...
};
```

### Step 5: Type Check

```bash
npx tsc --noEmit
```

Should be clean. If you see errors, check that:
- Imports are correct (`@/constants/generated-images`)
- `afbeelding` field is added before `portretKleur` in each story
- No typos in story IDs

### Step 6: Start Dev Server

**Web (browser):**
```bash
npm run web
```

**Native (Android/iOS):**
```bash
npx expo start
# Then press 'a' for Android or 'i' for iOS
```

## Testing Checklist

### ✅ Web Preview (`npm run web`)

1. **Home Screen**
   - [ ] Oudheid section visible
   - [ ] 4 story cards show (not in separate rows, but in horizontal scroll)
   - [ ] Cards display **portrait images** (not color placeholders)
   - [ ] Read time visible
   - [ ] "Discover more" button present

2. **Click Card → Story Detail**
   - [ ] Route to `/verhaal/[id]` works
   - [ ] Story chapters load
   - [ ] Portrait image visible at top (if screen shows story header)
   - [ ] Text chapters render

3. **Progress & Theming**
   - [ ] Voortgang shows "0/4 Oudheid"
   - [ ] Switch theme (Profiel → Licht/Donker) — images remain visible
   - [ ] Switch language (Profiel) — titles/text update

### ✅ Native Preview (Android/iOS, if available)

Same tests as web, but:
- [ ] Images load over network (ensure device has internet)
- [ ] Image quality/aspect ratio appropriate for mobile screen
- [ ] No layout shifts or jank when images load
- [ ] Dark mode colors work (image contrast vs. background)

### ❌ Expected vs. Actual Fallbacks

**If `afbeelding` is NOT set:** Story card shows color placeholder (e.g., `#8B4513` for Caesar)  
**If `afbeelding` IS set:** Story card shows actual portrait image

## Troubleshooting

### "REPLICATE_API_TOKEN not set"
- Ensure `.env.local` exists in project root
- Check token value is not empty: `cat .env.local`
- Restart terminal/shell after creating `.env.local`

### "Request timeout" or "Rate limit"
- Replicate free tier allows concurrent requests; if many run at once, wait 30s and retry
- Or use a paid plan for priority

### "Image URL returns 403/404"
- Replicate CDN URLs are temporary (valid for ~1 hour or less)
- For production, images should be downloaded and stored in app bundle or persistent storage
- This PoC stores URLs only; a future phase should implement persistent storage

### "Image not displaying on device"
- Check device has internet access
- Check image URL is valid (copy from `generated-images.ts` into browser)
- If using development build with `expo-dev-client`, rebuild after `.env` changes

### TypeScript errors after update
- Ensure `afbeelding?: string` is the correct field type (optional)
- Run `npx tsc --noEmit` to see exact line/error
- Verify no trailing commas or syntax errors in JSON-like object literals

## Files Modified/Created

| File | Purpose |
|------|---------|
| `.env.local` | Replicate API token (user-provided, not committed) |
| `scripts/generate-portrait-images.mjs` | Generation script using Replicate API |
| `src/constants/generated-images.ts` | URLs for 4 generated images |
| `src/components/verhaal-kaart.tsx` | Updated to display `afbeelding` or fallback to color |
| `package.json` | Added `replicate` to devDeps, npm script `generate:images:r9` |
| `src/content/verhalen/oudheid/personen.ts` | (User updates) Import + set `afbeelding` |
| `src/content/verhalen/oudheid/gebeurtenissen.ts` | (User updates) Import + set `afbeelding` |

## Next Steps (Future Phases)

1. **Persistent Storage** (R10?)
   - Download images after generation
   - Store locally in app (AsyncStorage or file system)
   - Fallback to Replicate CDN if not yet downloaded

2. **Batch Generation UI** (R11?)
   - Admin panel to trigger generation for any story
   - Progress indicator + retry logic
   - Support for re-running on failed stories

3. **Multi-Era Support** (R12?)
   - Extend script to handle all 6 eras (currently Oudheid only)
   - Per-era generation with different prompts
   - Parallel generation (4-6 stories per phase)

4. **LLM Prompt Refinement**
   - Current prompts are generic (test PoC)
   - Future: Research-backed historical accuracy in prompts
   - Per-era thematic consistency

5. **Attribution & Legal**
   - Track which model/version generated each image
   - Store generation timestamp + parameters
   - Comply with Replicate's terms for image reuse

## Costs

**Replicate FLUX.1-pro pricing (as of 2026-07):**
- ~$0.02-0.04 per 1024×1024 image
- 4-image PoC: ~$0.08-0.16
- 36-image full set: ~$0.72-1.44
- Free tier includes credits for ~2-3 images per month

Check https://replicate.com/pricing for current rates.

## Questions?

- Replicate API docs: https://replicate.com/docs/api
- FLUX.1-pro model: https://replicate.com/black-forest-labs/flux-1.1-pro
- Expo Image component: https://docs.expo.dev/versions/latest/sdk/image/
