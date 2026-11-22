import mongoose from 'mongoose';
import { env } from './env.js';

// Strips query operators like { "$gt": "" } from filters built from user input (Rules.md section 5).
mongoose.set('sanitizeFilter', true);
// Ignore filter fields that are not in the schema instead of passing them to MongoDB.
mongoose.set('strictQuery', true);

export async function connectDb() {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  console.info(`MongoDB connected (database: ${mongoose.connection.name})`);
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
