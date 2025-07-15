module.exports = class SparqlClient {
  constructor() {
    console.log('Mock SparqlClient initialized');
  }
  query() {
    console.log('Mock SparqlClient query called');
    return { results: { bindings: [] } };
  }
  update() {
    console.log('Mock SparqlClient update called');
    return {};
  }
};