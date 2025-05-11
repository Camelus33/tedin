import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ZengoProverbContent from '../models/ZengoProverbContent';

dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33');
    console.log('Connected to MongoDB');
    const maxWords = 6;
    const docs = await ZengoProverbContent.find({ level: '5x5-medium' });
    let modifiedCount = 0;
    for (const doc of docs) {
      if (doc.wordMappings.length > maxWords) {
        const newMappings = doc.wordMappings.slice(0, maxWords);
        doc.wordMappings = newMappings;
        doc.totalWords = newMappings.length;
        doc.totalAllowedStones = newMappings.length + 2;
        await doc.save();
        modifiedCount++;
      }
    }
    console.log(`Fixed word count for ${modifiedCount} documents.`);
  } catch (error) {
    console.error('Error fixing Zengo word counts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main(); 