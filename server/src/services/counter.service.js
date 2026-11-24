import { env } from '../config/env.js';
import { DailyCounter } from '../models/DailyCounter.js';

// The café's business day as 'YYYY-MM-DD' in its time zone (Asia/Kolkata), not the server's:
// Render runs in UTC, where an Indian evening can already be "tomorrow".
export function businessDate(date = new Date(), timeZone = env.TZ_BUSINESS) {
  // The en-CA locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// Next order number for this café today. One atomic update, so two orders placed at the same
// moment never get the same number. A number can be skipped if saving the order then fails.
export async function nextOrderNumber(restaurantId, date) {
  const counter = await DailyCounter.findOneAndUpdate(
    { restaurantId, date },
    { $inc: { lastNumber: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return counter.lastNumber;
}
