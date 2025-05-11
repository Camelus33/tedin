import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ZengoProverbContent from '../models/ZengoProverbContent';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update display times for 5x5-medium and 7x7-hard levels
const updateDisplayTimes = async () => {
  try {
    const levels = [
      { level: '3x3-easy', displayMs: 3000, extraStones: 1 },
      { level: '5x5-medium', displayMs: 8000, extraStones: 2 },
      { level: '7x7-hard', displayMs: 15000, extraStones: 4 },
    ];
    for (const { level, displayMs, extraStones } of levels) {
      // Update display time
      const dmResult = await ZengoProverbContent.updateMany(
        { level },
        { $set: { initialDisplayTimeMs: displayMs } }
      );
      console.log(`Updated ${level} display to ${displayMs}ms (${dmResult.modifiedCount} docs)`);
      // Update totalAllowedStones based on wordMappings length
      const docs = await ZengoProverbContent.find({ level });
      let modifiedCount = 0;
      for (const doc of docs) {
        const newAllowed = (doc.wordMappings.length || doc.totalWords) + extraStones;
        if (doc.totalAllowedStones !== newAllowed) {
          await ZengoProverbContent.updateOne(
            { _id: doc._id },
            { $set: { totalAllowedStones: newAllowed } }
          );
          modifiedCount++;
        }
      }
      console.log(`Updated ${level} allowed stones to wordCount+${extraStones} (${modifiedCount} docs)`);
    }
    console.log('Display time and allowed stones update completed successfully!');
  } catch (error) {
    console.error('Error updating display times:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
(async () => {
  await connectDB();
  await updateDisplayTimes();
})(); 