// Custom ESM resolve hook used only by scripts/validate-content.mjs.
//
// The project has no ts-node/tsx dependency, and Node's native TypeScript support (used here to
// run .ts content files directly, no build step) only strips types — it does not resolve the
// '@/' tsconfig path alias, and Node's ESM resolver requires explicit extensions on relative
// specifiers, which the content files (written for Metro's bundler resolution) don't have. This
// hook rewrites '@/*' to 'src/*' and appends '.ts' / '/index.ts' to extensionless relative
// specifiers before handing back to Node's default resolver.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC_URL = pathToFileURL(path.join(process.cwd(), 'src') + path.sep);

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    return resolve(new URL(specifier.slice(2), SRC_URL).href, context, nextResolve);
  }

  const isRelative = specifier.startsWith('.') || specifier.startsWith('file://');
  if (!isRelative) {
    return nextResolve(specifier, context);
  }

  const resolved = specifier.startsWith('file://')
    ? specifier
    : new URL(specifier, context.parentURL).href;

  if (path.extname(resolved) === '') {
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      if (fs.existsSync(new URL(resolved + ext))) {
        return nextResolve(resolved + ext, context);
      }
    }
  }

  return nextResolve(resolved, context);
}
