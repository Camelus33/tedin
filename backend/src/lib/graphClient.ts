// Graph client helper – provides a singleton SparqlClient instance
// NOTE: The sparql-http-client library lacks TS types, so we suppress the check.
import SparqlClient from 'sparql-http-client';
import { GRAPH_DB_ENDPOINT, GRAPH_DB_USER, GRAPH_DB_PASS } from './graphConfig';

let client: any; // Using `any` because library has no types.

function createClient() {
  const endpointUrl = `${GRAPH_DB_ENDPOINT}/query`;
  const updateUrl = `${GRAPH_DB_ENDPOINT}/update`;
  const options: any = {
    endpointUrl,
    updateUrl,
  };
  // Basic auth (Fuseki can be configured this way)
  if (GRAPH_DB_USER && GRAPH_DB_PASS) {
    options.user = GRAPH_DB_USER;
    options.password = GRAPH_DB_PASS;
  }
  // eslint-disable-next-line new-cap
  return new SparqlClient(options);
}

export function getGraphClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}

// graceful shutdown – not strictly required for HTTP but useful if future client holds sockets
process.on('exit', () => {
  if (client && client.end) {
    try {
      client.end();
      // eslint-disable-next-line no-console
      console.log('Graph client closed.');
    } catch (_) {
      /* ignore */
    }
  }
}); 