import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables from .env file at the root of the backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// --- Configuration ---
// IMPORTANT: Change these values to match your test user's details
const USER_EMAIL = 'test@example.com'; // The email of the user you want to update
const NEW_PASSWORD = 'newpassword123';   // The new password for the user
// ---------------------

const MONGODB_URI = process.env.MONGODB_URI;

async function resetUserPassword() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully.');

    console.log(`Searching for user with email: ${USER_EMAIL}...`);
    const user = await User.findOne({ email: USER_EMAIL });

    if (user) {
      console.log('User found. Updating password...');
      // Assign the new plain-text password. 
      // The pre-save hook in User.ts will automatically hash it.
      user.passwordHash = NEW_PASSWORD;
      await user.save();
      console.log(`✅ Successfully updated password for user: ${USER_EMAIL}`);
    } else {
      console.error(`Error: User with email ${USER_EMAIL} not found.`);
    }

  } catch (error) {
    console.error('An error occurred during the password reset process:', error);
  } finally {
    console.log('Closing database connection...');
    await mongoose.disconnect();
    console.log('Connection closed.');
  }
}

resetUserPassword(); 