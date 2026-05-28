/**
 * fix-prisma-client.mjs
 *
 * Prisma 7 génère des imports TypeScript sans extension (style "bundler"),
 * incompatibles avec Node.js ESM qui exige ".js".
 * Ce script corrige le fichier source généré après `prisma generate`.
 *
 * Usage : node scripts/fix-prisma-client.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENT_TS = join(__dirname, '..', 'generated', 'prisma', 'client.ts');

/** Ajoute .js aux imports/exports relatifs qui n'en ont pas encore. */
function addExtensions(source) {
  return source.replace(
    /((?:import|export)[^'"]*from\s+['"])(\.\.?\/[^'"]+?)(['"]\s*;?)/g,
    (_, prefix, specifier, suffix) => {
      if (/\.[a-z]+$/.test(specifier)) return `${prefix}${specifier}${suffix}`;
      return `${prefix}${specifier}.js${suffix}`;
    },
  );
}

const original = await readFile(CLIENT_TS, 'utf8');
const fixed = addExtensions(original);

if (fixed === original) {
  console.log('✅ generated/prisma/client.ts — extensions déjà présentes, rien à faire.');
} else {
  await writeFile(CLIENT_TS, fixed, 'utf8');
  console.log('✅ generated/prisma/client.ts — extensions .js ajoutées aux imports relatifs.');
}
