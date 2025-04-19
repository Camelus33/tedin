import mongoose from 'mongoose';
import Zengo from '../src/models/Zengo';

async function inspectZengoCollection() {
  // Replace with your actual MongoDB URI
  const dbUri = 'mongodb://localhost:27017/habitus33';
  await mongoose.connect(dbUri);

  // List all collections in the database
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in database:', collections.map(c => c.name));

  // Inspect 'zengo' collection directly
  const zengoCol = mongoose.connection.db.collection('zengo');
  const totalZengo = await zengoCol.countDocuments();
  console.log(`Total documents in 'zengo' collection: ${totalZengo}`);
  const sampleZengo = await zengoCol.find().limit(10).toArray();
  console.log("Sample documents from 'zengo' collection:");
  console.dir(sampleZengo, { depth: 2, colors: true });

  await mongoose.disconnect();
}

inspectZengoCollection()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error inspecting Zengo collection:', error);
    process.exit(1);
  }); 