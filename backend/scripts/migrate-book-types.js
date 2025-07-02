/**
 * Migration Script: Add bookType field to existing Book documents
 * 
 * This script adds the 'bookType' field with value 'BOOK' to all existing Book documents
 * that don't already have this field set.
 * 
 * Usage:
 * 1. Ensure MongoDB connection string is set in environment variables
 * 2. Run: node backend/scripts/migrate-book-types.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB for migration');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Migration function
async function migrateBookTypes() {
  try {
    console.log('🚀 Starting Book type migration...');
    
    // Update all Book documents that don't have bookType field
    const result = await mongoose.connection.db.collection('books').updateMany(
      { bookType: { $exists: false } }, // Find documents without bookType field
      { $set: { bookType: 'BOOK' } }    // Set bookType to 'BOOK'
    );
    
    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Updated ${result.modifiedCount} documents`);
    console.log(`🔍 Matched ${result.matchedCount} documents`);
    
    // Verify the migration
    const totalBooks = await mongoose.connection.db.collection('books').countDocuments();
    const booksWithType = await mongoose.connection.db.collection('books').countDocuments({ bookType: { $exists: true } });
    
    console.log(`📈 Verification:`);
    console.log(`   Total books: ${totalBooks}`);
    console.log(`   Books with bookType: ${booksWithType}`);
    
    if (totalBooks === booksWithType) {
      console.log('✅ All books now have bookType field!');
    } else {
      console.log('⚠️  Some books still missing bookType field');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await connectDB();
    await migrateBookTypes();
    console.log('🎉 Migration process completed successfully!');
  } catch (error) {
    console.error('💥 Migration process failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { migrateBookTypes }; 