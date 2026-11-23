import mongoose from 'mongoose';

// One counter per rate-limit key and time window (see middleware/mongoRateLimitStore.js).
// MongoDB deletes each counter by itself once its window has ended (TTL index on expiresAt).
const rateLimitCounterSchema = new mongoose.Schema(
  {
    _id: { type: String },
    hits: { type: Number, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false },
);

export default mongoose.model('RateLimitCounter', rateLimitCounterSchema);
