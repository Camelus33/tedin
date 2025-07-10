// Node 18+ includes global fetch
import fs from 'fs/promises';
import path from 'path';

const FUSEKI_UPDATE_ENDPOINT = process.env.GRAPH_DB_UPDATE_ENDPOINT || 'http://localhost:3030/habitus33/update';

export async function loadTestDataset(ttlPath: string) {
  const ttl = await fs.readFile(path.resolve(ttlPath), 'utf8');
  const res = await fetch(FUSEKI_UPDATE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sparql-update' },
    body: `INSERT DATA {\n${ttl}\n}`,
  });
  if (!res.ok) {
    throw new Error(`Fuseki load failed: ${res.status}`);
  }
}

export async function clearDataset() {
  const res = await fetch(FUSEKI_UPDATE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sparql-update' },
    body: 'CLEAR ALL',
  });
  if (!res.ok) {
    throw new Error(`Fuseki clear failed: ${res.status}`);
  }
} 