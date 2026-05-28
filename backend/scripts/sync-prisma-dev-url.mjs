/**
 * Lit le port courant de `prisma dev` depuis server.json et met à jour .env.
 * Usage : node scripts/sync-prisma-dev-url.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const SERVER_JSON = join(
  homedir(),
  'Library/Application Support/prisma-dev-nodejs/default/server.json',
);
const ENV_FILE = join(import.meta.dirname, '..', '.env');

const server = JSON.parse(await readFile(SERVER_JSON, 'utf8'));
const url = server.exports.database.prismaORMConnectionString;

let env = await readFile(ENV_FILE, 'utf8');
env = env.replace(/^DATABASE_URL=.*/m, `DATABASE_URL="${url}"`);
await writeFile(ENV_FILE, env, 'utf8');

console.log(`✅ DATABASE_URL mis à jour → port ${server.databasePort}`);
