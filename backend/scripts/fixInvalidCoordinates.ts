import mongoose from 'mongoose';
import ZengoProverbContent from '../src/models/ZengoProverbContent';

// Helper: check if any three positions are colinear
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

// Generate 'count' unique positions within size x size board, avoiding any colinear triples
function generateNonColinearPositions(count: number, size: number): { x: number; y: number }[] {
  const allPositions: { x: number; y: number }[] = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      allPositions.push({ x, y });
    }
  }
  if (allPositions.length < count) {
    throw new Error(`Board size ${size} too small for ${count} positions.`);
  }
  let attempts = 0;
  while (attempts < 10000) {
    // Shuffle
    for (let i = allPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
    }
    const candidate = allPositions.slice(0, count);
    if (!isColinear(candidate)) {
      return candidate;
    }
    attempts++;
  }
  throw new Error('Failed to generate non-colinear positions');
}

async function fixInvalidCoordinates() {
  const dbUri = 'mongodb://localhost:27017/habitus33';
  await mongoose.connect(dbUri);

  const contents = await ZengoProverbContent.find({});
  let updatedDocs = 0;

  for (const content of contents) {
    const boardSize = content.boardSize;
    const mappings = content.wordMappings;
    // Detect invalid coordinates
    const hasInvalid = mappings.some(m => {
      const x = m.coords.x;
      const y = m.coords.y;
      return x < 0 || x >= boardSize || y < 0 || y >= boardSize;
    });
    if (!hasInvalid) continue;

    // Regenerate full set of positions
    const newPositions = generateNonColinearPositions(mappings.length, boardSize);
    const newMappings = mappings.map((m, i) => ({ word: m.word, coords: newPositions[i] }));

    // Save updates
    await ZengoProverbContent.updateOne(
      { _id: content._id },
      { wordMappings: newMappings }
    );
    console.log(`Updated content ${content._id}: regenerated ${mappings.length} positions.`);
    updatedDocs++;
  }

  console.log(`Finished. ${updatedDocs} documents updated.`);
  await mongoose.disconnect();
}

fixInvalidCoordinates()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error fixing coordinates:', err);
    process.exit(1);
  }); 