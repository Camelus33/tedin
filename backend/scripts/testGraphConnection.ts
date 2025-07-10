// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – library has no official TypeScript types
import SparqlClient from 'sparql-http-client';
import { GRAPH_DB_ENDPOINT } from '../src/lib/graphConfig';

(async () => {
  const endpointUrl = `${GRAPH_DB_ENDPOINT}/query`;

  const client = new SparqlClient({ endpointUrl });
  const askQuery = 'ASK { ?s ?p ?o }';
  try {
    const boolean = await client.query.ask(askQuery);
    if (boolean) {
      // eslint-disable-next-line no-console
      console.log('✅ Graph DB connection success. SPARQL ASK returned true');
      process.exit(0);
    } else {
      console.error('⚠️ Graph DB connection established but dataset is empty.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Failed to connect to Graph DB:', err);
    process.exit(1);
  }
})(); 