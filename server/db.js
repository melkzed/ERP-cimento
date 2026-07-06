import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

export const DB_PATH = join(dataDir, 'erp.sqlite');

export const db = new DatabaseSync(DB_PATH);

const SCHEMA_VERSION = 3;

db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

const bancoNovo =
  db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table'").get().n === 0;
const versao = db.prepare('PRAGMA user_version').get().user_version;
if (!bancoNovo && versao !== SCHEMA_VERSION) {
  console.error(
    `O banco em ${DB_PATH} usa um schema antigo (v${versao}, esperado v${SCHEMA_VERSION}).\n` +
      'Rode "npm run db:reset" para recriá-lo com os dados de demonstração.'
  );
  process.exit(1);
}

db.exec(readFileSync(join(__dirname, 'schema.sql'), 'utf-8'));
if (bancoNovo) db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);

export function isEmpty() {
  const row = db.prepare('SELECT COUNT(*) AS n FROM produtos').get();
  return row.n === 0;
}
