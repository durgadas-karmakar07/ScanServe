import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

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
