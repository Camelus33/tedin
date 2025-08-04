const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Create MongoDB Atlas Text Search Index
 * This script creates a text search index for the notes collection
 */
async function createTextIndex() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db();
    const collection = db.collection('notes');

    // Check if index already exists
    const indexes = await collection.listIndexes().toArray();
    const textIndexExists = indexes.some(index => 
      index.name === 'notes_text_index'
    );

    if (textIndexExists) {
      console.log('Text search index already exists');
      return;
    }

    // Create text search index
    const indexDefinition = {
      name: 'notes_text_index',
      type: 'search',
      fields: [
        {
          path: 'content',
          type: 'string',
          analyzer: 'lucene.korean'
        },
        {
          path: 'tags',
          type: 'string',
          analyzer: 'lucene.korean'
        },
        {
          path: 'importanceReason',
          type: 'string',
          analyzer: 'lucene.korean'
        },
        {
          path: 'momentContext',
          type: 'string',
          analyzer: 'lucene.korean'
        },
        {
          path: 'relatedKnowledge',
          type: 'string',
          analyzer: 'lucene.korean'
        },
        {
          path: 'mentalImage',
          type: 'string',
          analyzer: 'lucene.korean'
        }
      ]
    };

    // Note: This requires MongoDB Atlas Search API
    // You may need to create this index through the Atlas UI or Atlas CLI
    console.log('Text search index definition:');
    console.log(JSON.stringify(indexDefinition, null, 2));
    
    console.log('\nTo create this index:');
    console.log('1. Go to MongoDB Atlas Dashboard');
    console.log('2. Navigate to Search tab');
    console.log('3. Create a new search index with the above configuration');
    console.log('4. Or use Atlas CLI: atlas search index create --clusterName <cluster-name> --indexName notes_text_index');

  } catch (error) {
    console.error('Error creating text index:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTextIndex().catch(console.error); 