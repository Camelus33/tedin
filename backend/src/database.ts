import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @returns MongoDB database instance
 */
export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return mongoose.connection.db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}