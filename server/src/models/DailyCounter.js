import mongoose from 'mongoose';

// The last order number a café gave out on one business day (Asia/Kolkata), so numbers start
// again at 1 every morning. Increased atomically in services/counter.service.js.
const dailyCounterSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    lastNumber: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);

dailyCounterSchema.index({ restaurantId: 1, date: 1 }, { unique: true });

export const DailyCounter = mongoose.model('DailyCounter', dailyCounterSchema);
