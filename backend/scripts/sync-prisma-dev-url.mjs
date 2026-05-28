/**
 * Lit le port courant de `prisma dev` depuis server.json et met à jour .env.
 * Usage : node scripts/sync-prisma-dev-url.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import net from 'node:net';

const SERVER_JSON = join(
  homedir(),
  'Library/Application Support/prisma-dev-nodejs/default/server.json',
);
const ENV_FILE = join(import.meta.dirname, '..', '.env');
const CONNECT_TIMEOUT_MS = 1000;

function printStartHint() {
  console.error(
    '   Lance `npm run db:dev` dans un autre terminal, puis relance `npm run dev`.',
  );
}

function fail(message) {
  console.error(`❌ ${message}`);
  printStartHint();
  process.exit(1);
}

async function readServerConfig() {
  try {
    return JSON.parse(await readFile(SERVER_JSON, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      fail('Prisma dev server introuvable.');
    }
    fail(`Impossible de lire ${SERVER_JSON}.`);
  }
}

async function assertReachable(url) {
  const port = Number(url.port || 5432);
  await new Promise((resolve, reject) => {
    const socket = net.connect({
      host: url.hostname,
      port,
      timeout: CONNECT_TIMEOUT_MS,
    });

    socket.once('connect', () => {
      socket.end();
      resolve();
    });
    socket.once('timeout', () => {
      socket.destroy();
      reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' }));
    });
    socket.once('error', reject);
  });
}

const server = await readServerConfig();
const connectionString = server?.exports?.database?.prismaORMConnectionString;
const shadowConnectionString =
  server?.exports?.shadowDatabase?.prismaORMConnectionString;
if (!connectionString) {
  fail('URL Prisma dev absente de server.json.');
}
if (!shadowConnectionString) {
  fail('URL shadow Prisma dev absente de server.json.');
}

const url = new URL(connectionString);
const shadowUrl = new URL(shadowConnectionString);

try {
  await assertReachable(url);
  await assertReachable(shadowUrl);
} catch (error) {
  fail(
    `Prisma dev ne répond pas sur ${url.hostname}:${url.port || 5432} (${error?.code ?? 'erreur inconnue'}).`,
  );
}

let env = '';
try {
  env = await readFile(ENV_FILE, 'utf8');
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

const databaseUrlLine = `DATABASE_URL="${connectionString}"`;
const shadowDatabaseUrlLine = `SHADOW_DATABASE_URL="${shadowConnectionString}"`;
if (/^DATABASE_URL=.*/m.test(env)) {
  env = env.replace(/^DATABASE_URL=.*/m, databaseUrlLine);
} else {
  env = `${env.trimEnd()}\n${databaseUrlLine}\n`;
}
if (/^SHADOW_DATABASE_URL=.*/m.test(env)) {
  env = env.replace(/^SHADOW_DATABASE_URL=.*/m, shadowDatabaseUrlLine);
} else {
  env = `${env.trimEnd()}\n${shadowDatabaseUrlLine}\n`;
}
if (!env.endsWith('\n')) env += '\n';

await writeFile(ENV_FILE, env, 'utf8');

console.log(
  `✅ DATABASE_URL mis à jour → port ${url.port || server.databasePort}`,
);
