import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';

/**
 * Connect to MongoDB database
 * @returns MongoDB database instance
 */
export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return mongoose.connection.db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};