// Apaga o banco local e recria com os dados de demonstração.
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '..', 'data', 'erp.sqlite');
for (const suffix of ['', '-wal', '-shm']) {
  rmSync(dbFile + suffix, { force: true });
}

const { db, isEmpty } = await import('./db.js');
const { seed } = await import('./seed.js');
if (isEmpty()) seed(db);
console.log('Banco recriado com dados de demonstração em', dbFile);
