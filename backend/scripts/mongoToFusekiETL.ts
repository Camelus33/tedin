import mongoose from 'mongoose';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no types
import SparqlClient from 'sparql-http-client';
import { DataFactory, Writer } from 'n3';
import { GRAPH_DB_ENDPOINT, GRAPH_DB_USER, GRAPH_DB_PASS } from '../src/lib/graphConfig';
import Note from '../src/models/Note';
import Book from '../src/models/Book';

const { namedNode, literal } = DataFactory;

async function main() {
  // 1. connect Mongo
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/habitus33';
  await mongoose.connect(mongoUri);
  console.log('Mongo connected');

  // 2. prepare SPARQL client
  // helper to post Turtle via Graph Store HTTP (simpler, prefix-friendly)
  const postTurtle = async (ttl: string) => {
    // According to Apache Jena Fuseki documentation, the writable Graph Store HTTP endpoint is
    // "<dataset>/data" (followed by either ?graph=<uri> or ?default). Omitting the "/data" segment
    // silently ignores writes and results in an empty dataset when queried (the issue we observed).
    // See: https://jena.apache.org/documentation/fuseki2/fuseki-server-protocol.html
    const url = `${GRAPH_DB_ENDPOINT}/data?default`; // POST to default graph via GSP
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/turtle',
      },
      body: ttl,
    });
    if (!res.ok) {
      throw new Error(`Graph store POST failed ${res.status}: ${await res.text()}`);
    }
  };

  // 3. migrate books
  const books = await Book.find().lean();
  for (const b of books) {
    const writer = new Writer({ prefixes: { app: 'https://w3id.org/habitus33/ontology/app#', habitus: 'https://w3id.org/habitus33/resource/', 'core-k-resource': 'https://w3id.org/habitus33/ontology/core/k-resource#', dcterms: 'http://purl.org/dc/terms/', bibo: 'http://purl.org/ontology/bibo/' } });
    const uri = `https://w3id.org/habitus33/resource/book/${b._id}`;
    writer.addQuad(namedNode(uri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://w3id.org/habitus33/ontology/core/k-resource#Book'));
    if (b.title) writer.addQuad(namedNode(uri), namedNode('http://purl.org/dc/terms/title'), literal(b.title));
    if (b.isbn) writer.addQuad(namedNode(uri), namedNode('http://purl.org/ontology/bibo/isbn'), literal(b.isbn));
    const bookTags = (b as any).tags as string[] | undefined;
    if (bookTags) bookTags.forEach((t: string) => writer.addQuad(namedNode(uri), namedNode('http://www.w3.org/2004/02/skos/core#subject'), literal(t)));
    const ttl = await new Promise<string>((res, rej) => writer.end((err, result) => (err ? rej(err) : res(result))));
    await postTurtle(ttl);
  }
  console.log(`Migrated ${books.length} books`);

  // 4. migrate notes
  const notes = await Note.find().lean();
  for (const n of notes) {
    const writer = new Writer({ prefixes: { habitus: 'https://w3id.org/habitus33/resource/', 'core-k-unit': 'https://w3id.org/habitus33/ontology/core/k-unit#', dcterms: 'http://purl.org/dc/terms/', skos: 'http://www.w3.org/2004/02/skos/core#' } });
    const uri = `https://w3id.org/habitus33/resource/note/${n._id}`;
    writer.addQuad(namedNode(uri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://w3id.org/habitus33/ontology/core/k-unit#Note'));
    if (n.content) writer.addQuad(namedNode(uri), namedNode('https://w3id.org/habitus33/ontology/core/k-unit#text'), literal(n.content));
    if (n.userId) writer.addQuad(namedNode(uri), namedNode('http://purl.org/dc/terms/creator'), namedNode(`https://w3id.org/habitus33/resource/user/${n.userId}`));
    if (n.bookId) writer.addQuad(namedNode(uri), namedNode('https://w3id.org/habitus33/ontology/core/k-unit#refersToResource'), namedNode(`https://w3id.org/habitus33/resource/book/${n.bookId}`));
    const noteTags = (n as any).tags as string[] | undefined;
    if (noteTags) noteTags.forEach((t: string) => writer.addQuad(namedNode(uri), namedNode('http://www.w3.org/2004/02/skos/core#subject'), literal(t)));
    const ttl = await new Promise<string>((res, rej) => writer.end((err, result) => (err ? rej(err) : res(result))));
    await postTurtle(ttl);
  }
  console.log(`Migrated ${notes.length} notes`);

  await mongoose.disconnect();
  console.log('Done');
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('ETL failed', e);
  process.exit(1);
}); 