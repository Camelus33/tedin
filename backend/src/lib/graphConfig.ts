import dotenv from 'dotenv';

dotenv.config();

export const GRAPH_DB_ENDPOINT = process.env.GRAPH_DB_ENDPOINT || 'http://localhost:3030/habitus33';
export const GRAPH_DB_USER = process.env.GRAPH_DB_USER || 'admin';
export const GRAPH_DB_PASS = process.env.GRAPH_DB_PASS || 'admin';
export const GRAPH_DB_NAMESPACE = process.env.GRAPH_DB_NAMESPACE || 'habitus33'; 