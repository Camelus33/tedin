import mongoose from 'mongoose';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no types
import SparqlClient from 'sparql-http-client';
import Note from '../src/models/Note';
import Book from '../src/models/Book';
import { GRAPH_DB_ENDPOINT, GRAPH_DB_USER, GRAPH_DB_PASS } from '../src/lib/graphConfig';

async function getSparqlClient() {
  // eslint-disable-next-line new-cap
  return new SparqlClient({
    endpointUrl: `${GRAPH_DB_ENDPOINT}/query`,
    user: GRAPH_DB_USER,
    password: GRAPH_DB_PASS,
  });
}

async function getCount(client: any, classIri: string): Promise<number> {
  const query = `SELECT (COUNT(?s) AS ?cnt) WHERE { ?s a <${classIri}> }`;
  const stream = await client.query.select(query);
  const results: any[] = [];
  return new Promise<number>((resolve, reject) => {
    stream.on('data', (row: any) => {
      // sparql-http-client returns bindings in format: { cnt: { value: "number", type: "literal", datatype: "..." } }
      const countVal = row.cnt?.value || row.cnt || '0';
      const count = parseInt(countVal, 10);
      results.push(count);
    });
    stream.on('end', () => resolve(results[0] ?? 0));
    stream.on('error', reject);
  });
}

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/habitus33';
  await mongoose.connect(mongoUri);

  const mongoBookCount = await Book.countDocuments();
  const mongoNoteCount = await Note.countDocuments();

  const client = await getSparqlClient();
  const classBook = 'https://w3id.org/habitus33/ontology/core/k-resource#Book';
  const classNote = 'https://w3id.org/habitus33/ontology/core/k-unit#Note';

  const graphBookCount = await getCount(client, classBook);
  const graphNoteCount = await getCount(client, classNote);

  console.log('Mongo counts => Books:', mongoBookCount, ' Notes:', mongoNoteCount);
  console.log('Graph counts => Books:', graphBookCount, ' Notes:', graphNoteCount);

  let ok = true;
  if (mongoBookCount !== graphBookCount) {
    console.error('❌ Book count mismatch');
    ok = false;
  }
  if (mongoNoteCount !== graphNoteCount) {
    console.error('❌ Note count mismatch');
    ok = false;
  }

  await mongoose.disconnect();

  if (ok) {
    console.log('✅ ETL verification passed – counts match');
    process.exit(0);
  } else {
    console.error('⚠️ ETL verification failed');
    process.exit(1);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
}); 