#!/usr/bin/env node
/**
 * R9 PoC: Generate portrait images for Oudheid stories via Replicate
 *
 * Usage:
 *   REPLICATE_API_TOKEN=<token> node scripts/generate-portrait-images.mjs
 *
 * This script:
 * 1. Reads the 4 Oudheid stories
 * 2. Calls Replicate API with FLUX.1-pro to generate portraits
 * 3. Saves URLs to src/constants/generated-images.ts
 * 4. Updates story afbeelding fields
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Story prompts for Replicate
const storyPrompts = {
  'julius-caesar': {
    name: 'Julius Caesar',
    prompt: 'Historical portrait of Julius Caesar, Roman general and statesman, circa 50 BC. Wearing Roman toga and laurel wreath. Classical Roman style painting. Dignified, commanding presence, detailed face with piercing eyes. Oil painting style, museum quality.',
    negativePrompt: 'modern, cartoon, sketch, blurry, low quality',
  },
  'spartacus': {
    name: 'Spartacus',
    prompt: 'Historical portrait of Spartacus, Thracian gladiator, circa 70 BC. Strong, muscular build. Wearing gladiator armor and helmet. Fierce expression, determined eyes. Historical accuracy, classical Roman era. Oil painting style, museum quality.',
    negativePrompt: 'modern, cartoon, sketch, blurry, low quality, contemporary',
  },
  'rome-rise': {
    name: "Rome's Rise",
    prompt: 'Majestic ancient Rome cityscape, the Roman Forum at sunrise. Classical architecture, marble columns, temples. Grandiose Republican era Rome. Golden light, historical accuracy. Wide vista showing the power and scale of Rome. Oil painting style.',
    negativePrompt: 'modern buildings, contemporary, blurry, low quality, medieval',
  },
  'pompeii-disaster': {
    name: 'Mount Vesuvius Eruption',
    prompt: 'Mount Vesuvius erupting over Pompeii, 79 AD. Massive volcanic eruption column, ash cloud, pyroclastic flow. Ancient Roman city below in shadows. Dramatic, catastrophic natural disaster. Historical painting style, detailed geological accuracy.',
    negativePrompt: 'modern, cartoon, low quality, blurry, fantasy',
  },
};

async function generateImages() {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    console.error('❌ REPLICATE_API_TOKEN not set. Run with: REPLICATE_API_TOKEN=<token> node scripts/generate-portrait-images.mjs');
    process.exit(1);
  }

  const replicate = new Replicate({ auth: apiToken });
  const generatedImages = {};

  console.log('🎨 R9 PoC: Generating portrait images for Oudheid stories...\n');

  for (const [storyId, promptData] of Object.entries(storyPrompts)) {
    console.log(`⏳ Generating image for: ${promptData.name}...`);

    try {
      const output = await replicate.run(
        'black-forest-labs/flux-1.1-pro',
        {
          input: {
            prompt: promptData.prompt,
            negative_prompt: promptData.negativePrompt,
            num_inference_steps: 28,
            guidance_scale: 3,
            image_format: 'webp',
          },
        }
      );

      // Replicate returns an array of URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;
      generatedImages[storyId] = imageUrl;

      console.log(`✅ Generated: ${storyId}`);
      console.log(`   URL: ${imageUrl}\n`);
    } catch (error) {
      console.error(`❌ Failed to generate image for ${storyId}: ${error.message}`);
      process.exit(1);
    }
  }

  // Save generated URLs to constants file
  const outputPath = path.join(projectRoot, 'src/constants/generated-images.ts');
  const content = `/**
 * R9 PoC: Generated portrait images via Replicate
 *
 * Generated on: ${new Date().toISOString()}
 * Model: FLUX.1-pro
 *
 * Images will be used by:
 * - src/constants/verhalen/oudheid/personen.ts (Julius Caesar, Spartacus)
 * - src/constants/verhalen/oudheid/gebeurtenissen.ts (Rome's Rise, Pompeii)
 */

export const GENERATED_IMAGES = {
  'julius-caesar': '${generatedImages['julius-caesar']}',
  'spartacus': '${generatedImages['spartacus']}',
  'rome-rise': '${generatedImages['rome-rise']}',
  'pompeii-disaster': '${generatedImages['pompeii-disaster']}',
} as const;
`;

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`📝 Saved generated image URLs to: ${outputPath}`);

  // Instructions for next steps
  console.log('\n✨ Next steps:');
  console.log('1. Update src/content/verhalen/oudheid/personen.ts:');
  console.log('   - Add: import { GENERATED_IMAGES } from "@/constants/generated-images";');
  console.log('   - Set: juliusCaesar.afbeelding = GENERATED_IMAGES["julius-caesar"];');
  console.log('   - Set: spartacus.afbeelding = GENERATED_IMAGES["spartacus"];');
  console.log('\n2. Update src/content/verhalen/oudheid/gebeurtenissen.ts:');
  console.log('   - Add: import { GENERATED_IMAGES } from "@/constants/generated-images";');
  console.log('   - Set: romesRise.afbeelding = GENERATED_IMAGES["rome-rise"];');
  console.log('   - Set: pompeiiDisaster.afbeelding = GENERATED_IMAGES["pompeii-disaster"];');
  console.log('\n3. Run type-check and start dev server:');
  console.log('   $ npx tsc --noEmit');
  console.log('   $ npm run web');
  console.log('\n4. Test in browser:');
  console.log('   - Navigate to Home → Oudheid section');
  console.log('   - Verify portrait images load (not color placeholders)');
  console.log('   - Click cards → /verhaal/[id] → verify image shows');
  console.log('   - Test on Android/iOS if available');
}

generateImages().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
