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

// How far the time zone's clock is ahead of UTC at this instant, in milliseconds.
function zoneOffsetMs(instant, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
      .formatToParts(instant)
      .map(({ type, value }) => [type, Number(value)]),
  );
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - instant.getTime();
}

// The business day 'YYYY-MM-DD' as a UTC time range [start, end), for queries on stored times
// such as paidAt ("money collected today" means paid today, whatever day the order was placed).
export function businessDayRange(day = businessDate(), timeZone = env.TZ_BUSINESS) {
  const [year, month, date] = day.split('-').map(Number);
  const midnight = (dayOfMonth) => {
    const utcMidnight = Date.UTC(year, month - 1, dayOfMonth);
    return new Date(utcMidnight - zoneOffsetMs(new Date(utcMidnight), timeZone));
  };
  return { start: midnight(date), end: midnight(date + 1) };
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
