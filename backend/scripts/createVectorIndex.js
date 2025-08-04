const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Create MongoDB Atlas Vector Search Index
 * This script creates a vector search index for the notes collection
 */
async function createVectorIndex() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db();
    const collection = db.collection('notes');

    // Check if index already exists
    const indexes = await collection.listIndexes().toArray();
    const vectorIndexExists = indexes.some(index => 
      index.name === 'notes_vector_index'
    );

    if (vectorIndexExists) {
      console.log('Vector search index already exists');
      return;
    }

    // Create vector search index
    const indexDefinition = {
      name: 'notes_vector_index',
      type: 'search',
      fields: [
        {
          path: 'embedding',
          numDimensions: 1536, // OpenAI text-embedding-ada-002 dimensions
          similarity: 'cosine'
        },
        {
          path: 'content',
          type: 'string'
        },
        {
          path: 'tags',
          type: 'string'
        },
        {
          path: 'userId',
          type: 'string'
        },
        {
          path: 'createdAt',
          type: 'date'
        }
      ]
    };

    // Note: This requires MongoDB Atlas Search API
    // You may need to create this index through the Atlas UI or Atlas CLI
    console.log('Vector search index definition:');
    console.log(JSON.stringify(indexDefinition, null, 2));
    
    console.log('\nTo create this index:');
    console.log('1. Go to MongoDB Atlas Dashboard');
    console.log('2. Navigate to Search tab');
    console.log('3. Create a new search index with the above configuration');
    console.log('4. Or use Atlas CLI: atlas search index create --clusterName <cluster-name> --indexName notes_vector_index');

  } catch (error) {
    console.error('Error creating vector index:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createVectorIndex().catch(console.error); 