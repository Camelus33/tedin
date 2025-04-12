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
    // Update 5x5-medium to 10 seconds (10000ms)
    const medium5x5Result = await ZengoProverbContent.updateMany(
      { level: '5x5-medium' },
      { $set: { initialDisplayTimeMs: 10000 } }
    );
    
    console.log(`Updated 5x5-medium display times to 10 seconds (${medium5x5Result.modifiedCount} documents modified)`);
    
    // Update 7x7-hard to 20 seconds (20000ms)
    const hard7x7Result = await ZengoProverbContent.updateMany(
      { level: '7x7-hard' },
      { $set: { initialDisplayTimeMs: 20000 } }
    );
    
    console.log(`Updated 7x7-hard display times to 20 seconds (${hard7x7Result.modifiedCount} documents modified)`);
    
    console.log('Display time update completed successfully!');
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