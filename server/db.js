import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

export const DB_PATH = join(dataDir, 'erp.sqlite');

export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec(readFileSync(join(__dirname, 'schema.sql'), 'utf-8'));

export function isEmpty() {
  const row = db.prepare('SELECT COUNT(*) AS n FROM produtos').get();
  return row.n === 0;
}
