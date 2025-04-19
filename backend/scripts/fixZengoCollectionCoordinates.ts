import { MongoClient } from 'mongodb';

// Check if any three positions are colinear
function isColinear(positions: { x: number; y: number }[]): boolean {
  if (positions.length < 3) return false;
  for (let i = 0; i < positions.length - 2; i++) {
    for (let j = i + 1; j < positions.length - 1; j++) {
      for (let k = j + 1; k < positions.length; k++) {
        const [a, b, c] = [positions[i], positions[j], positions[k]];
        if ((b.x - a.x) * (c.y - a.y) === (b.y - a.y) * (c.x - a.x)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Generate unique non-colinear positions within a board of given size
function generateNonColinearPositions(count: number, size: number): { x: number; y: number }[] {
  const all: { x: number; y: number }[] = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      all.push({ x, y });
    }
  }
  if (all.length < count) {
    throw new Error(`Board too small (${size}) for ${count} positions`);
  }
  let attempts = 0;
  while (attempts < 10000) {
    // Fisher–Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    const pick = all.slice(0, count);
    if (!isColinear(pick)) {
      return pick;
    }
    attempts++;
  }
  throw new Error('Failed to generate non-colinear positions');
}

async function main() {
  const uri = 'mongodb://localhost:27017/habitus33';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const col = db.collection('zengo');

  let updated = 0;
  const cursor = col.find({});
  while (await cursor.hasNext()) {
    const docMaybe = await cursor.next();
    if (!docMaybe) continue;
    const doc: any = docMaybe;
    const { _id, boardSize, wordMappings } = doc;
    const hasInvalid = wordMappings.some((m: any) => {
      const x = m.coords.x;
      const y = m.coords.y;
      return x < 0 || x >= boardSize || y < 0 || y >= boardSize;
    });
    if (!hasInvalid) continue;

    const count = wordMappings.length;
    const newPos = generateNonColinearPositions(count, boardSize);
    const newMappings = wordMappings.map((m: any, i: number) => ({ word: m.word, coords: newPos[i] }));

    await col.updateOne({ _id }, { $set: { wordMappings: newMappings } });
    console.log(`Fixed document ${_id}: regenerated ${count} positions`);
    updated++;
  }

  console.log(`Done. ${updated} documents updated.`);
  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 