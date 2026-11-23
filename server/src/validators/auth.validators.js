import { z } from 'zod';
import { UPI_ID_PATTERN } from './common.js';

// bcrypt only uses the first 72 bytes, so longer passwords are rejected instead of silently cut.
const MAX_PASSWORD_BYTES = 72;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const email = z
  .string({ error: 'Enter your email' })
  .trim()
  .toLowerCase()
  .max(254, 'Email is too long')
  .pipe(z.email({ error: 'Enter a valid email address' }));

const personOrCafeName = (label) =>
  z
    .string({ error: `Enter ${label}` })
    .trim()
    .min(2, 'Use at least 2 characters')
    .max(60, 'Use at most 60 characters');

export const registerSchema = z
  .object({
    restaurantName: personOrCafeName('your café name'),
    slug: z
      .string({ error: 'Enter a link name' })
      .trim()
      .toLowerCase()
      .min(3, 'Use at least 3 characters')
      .max(40, 'Use at most 40 characters')
      .regex(SLUG_PATTERN, 'Use only letters, numbers and single dashes, e.g. royal-cafe'),
    upiId: z
      .string({ error: 'Enter your UPI ID' })
      .trim()
      .regex(UPI_ID_PATTERN, 'Enter a valid UPI ID, e.g. royalcafe@okaxis'),
    ownerName: personOrCafeName('your name'),
    email,
    password: z
      .string({ error: 'Enter a password' })
      .min(8, 'Use at least 8 characters')
      .refine((value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES, {
        error: 'Password is too long',
      }),
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string({ error: 'Enter your password' }).min(1, 'Enter your password').max(200),
  })
  .strict();
