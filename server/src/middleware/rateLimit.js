import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { MongoRateLimitStore } from './mongoRateLimitStore.js';

const ONE_MINUTE = 60 * 1000;
const FIFTEEN_MINUTES = 15 * ONE_MINUTE;
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

const rateLimitMessage = (message) => ({ error: { code: 'RATE_LIMITED', message } });

const normalizeEmail = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase().slice(0, 254) : '';

const ipKey = (req) => ipKeyGenerator(req.ip);

const baseOptions = { standardHeaders: 'draft-8', legacyHeaders: false };

// Default limit for every /api route (Rules.md section 5).
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: FIFTEEN_MINUTES,
  limit: 300,
  message: rateLimitMessage('Too many requests. Please try again in a few minutes.'),
});

// Login and register: 5 failed attempts per 15 minutes for each IP + email pair, so nobody can
// keep guessing one account's password, while other people on the same café Wi-Fi are not blocked.
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${ipKey(req)}|${normalizeEmail(req.body?.email)}`,
  message: rateLimitMessage('Too many attempts. Please wait 15 minutes and try again.'),
});

// The IP + email limit resets for every new email, so one IP could still try one password on many
// accounts or keep the CPU busy with bcrypt. This caps failed login/register attempts per IP.
export const authIpLimiter = rateLimit({
  ...baseOptions,
  windowMs: FIFTEEN_MINUTES,
  limit: 30,
  skipSuccessfulRequests: true,
  keyGenerator: ipKey,
  message: rateLimitMessage('Too many attempts from this network. Please wait 15 minutes.'),
});

// Stops one IP from creating cafés in bulk. Only successful sign-ups count, so an owner fixing
// typos in the form is never blocked by this one.
export const signupIpLimiter = rateLimit({
  ...baseOptions,
  windowMs: ONE_HOUR,
  limit: 5,
  skipFailedRequests: true,
  keyGenerator: ipKey,
  message: rateLimitMessage('Too many new cafés from this network. Please try again later.'),
});

// New customer devices. Only new IDs count (a phone confirming its existing ID gets 200), and
// the limit is generous because many phones in India share one mobile-network IP.
export const deviceCreateLimiter = rateLimit({
  ...baseOptions,
  windowMs: FIFTEEN_MINUTES,
  limit: 100,
  keyGenerator: ipKey,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (req, res) => res.statusCode === 200,
  message: rateLimitMessage('Too many new phones from this network. Please try again later.'),
});

// Rules.md section 5: order creation is limited to 10 a minute per device and per IP.
export const orderIpLimiter = rateLimit({
  ...baseOptions,
  windowMs: ONE_MINUTE,
  limit: 10,
  keyGenerator: ipKey,
  message: rateLimitMessage('Too many orders from this network. Please wait a minute.'),
});

// Runs after requireDevice, so req.device is a real device.
export const orderDeviceLimiter = rateLimit({
  ...baseOptions,
  windowMs: ONE_MINUTE,
  limit: 10,
  keyGenerator: (req) => `device:${req.device.deviceId}`,
  message: rateLimitMessage('Too many orders from this phone. Please wait a minute.'),
});

// Each upload signature is good for one photo, so these cap photo uploads. All cafés share one
// free Cloudinary plan (25 credits a month), so one café, or someone making many cafés, must not
// be able to use it up. They run after requireAuth because some count per café. Only signatures
// actually given out count (skipFailedRequests), so a request refused later costs nothing.
// The daily ones are kept in MongoDB, because the free server's memory is wiped when it sleeps.
const restaurantKey = (req) => `restaurant:${req.auth.restaurantId}`;
const uploadOptions = { ...baseOptions, skipFailedRequests: true };

// Enough to photograph a whole menu in one sitting.
export const uploadSignatureLimiter = rateLimit({
  ...uploadOptions,
  windowMs: ONE_HOUR,
  limit: 60,
  keyGenerator: restaurantKey,
  message: rateLimitMessage('Too many photo uploads in the last hour. Please try again later.'),
});

// Stops a steady trickle (60 an hour, all day) from one café.
export const uploadSignatureDailyLimiter = rateLimit({
  ...uploadOptions,
  windowMs: ONE_DAY,
  limit: 100,
  keyGenerator: restaurantKey,
  store: new MongoRateLimitStore('upload-day:'),
  message: rateLimitMessage('Too many photo uploads today. Please try again tomorrow.'),
});

// One network (with several cafés) cannot use up the shared daily pool below on its own.
export const uploadIpDailyLimiter = rateLimit({
  ...uploadOptions,
  windowMs: ONE_DAY,
  limit: 120,
  keyGenerator: ipKey,
  store: new MongoRateLimitStore('upload-ip-day:'),
  message: rateLimitMessage('Too many photo uploads from this network today. Try again tomorrow.'),
});

// A safety net across all cafés together. If someone still reaches it, new uploads pause for the
// day, which is far better than the free plan running out and every menu losing its photos.
export const uploadAllCafesDailyLimiter = rateLimit({
  ...uploadOptions,
  windowMs: ONE_DAY,
  limit: 300,
  keyGenerator: () => 'all-cafes',
  store: new MongoRateLimitStore('upload-all-day:'),
  message: rateLimitMessage('Photo uploads are paused for today. Please try again tomorrow.'),
});
