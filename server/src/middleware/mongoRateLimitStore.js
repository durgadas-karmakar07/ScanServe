import RateLimitCounter from '../models/RateLimitCounter.js';

// A store for express-rate-limit that keeps counts in MongoDB instead of this server's memory.
// The free Render server sleeps when idle and restarts on every deploy, which empties memory;
// limits that must really last a day (photo uploads) use this store so they survive that.
// Each limiter gets its own store with its own prefix, so their counts never mix.
export class MongoRateLimitStore {
  localKeys = false;

  constructor(prefix) {
    this.prefix = prefix;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  // One atomic update: add a hit to a live window, or start a new window at 1 hit when there is
  // none (or the old one ended but MongoDB has not deleted it yet).
  async increment(key) {
    const now = new Date();
    const isLive = { $gt: ['$expiresAt', now] };
    const counter = await RateLimitCounter.collection.findOneAndUpdate(
      { _id: this.prefix + key },
      [
        {
          $set: {
            hits: { $cond: [isLive, { $add: ['$hits', 1] }, 1] },
            expiresAt: { $cond: [isLive, '$expiresAt', new Date(now.getTime() + this.windowMs)] },
          },
        },
      ],
      { upsert: true, returnDocument: 'after' },
    );
    return { totalHits: counter.hits, resetTime: counter.expiresAt };
  }

  // Used by skipFailedRequests: a request that ended in an error gives its hit back.
  async decrement(key) {
    await RateLimitCounter.collection.updateOne(
      { _id: this.prefix + key, expiresAt: { $gt: new Date() }, hits: { $gt: 0 } },
      { $inc: { hits: -1 } },
    );
  }

  async resetKey(key) {
    await RateLimitCounter.collection.deleteOne({ _id: this.prefix + key });
  }
}
