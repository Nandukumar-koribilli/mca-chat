import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing connection to MongoDB...');
console.log('URI:', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':****@'));

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('SUCCESS: Successfully connected to MongoDB Atlas! Database:', mongoose.connection.name);
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error('ERROR: Failed to connect to MongoDB Atlas:', err.message);
  process.exit(1);
}
