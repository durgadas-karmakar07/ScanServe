import { z } from 'zod';

// Rules.md section 5: the exact UPI ID format we accept.
export const UPI_ID_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const idParamsSchema = z.object({ id: objectId }).strict();

// Names of people, cafés, dishes and categories: trimmed, with repeated spaces collapsed.
export const nameSchema = (label, { min = 2, max = 60 } = {}) =>
  z
    .string({ error: `Enter ${label}` })
    .trim()
    .min(min, min === 1 ? `Enter ${label}` : `Use at least ${min} characters`)
    .max(max, `Use at most ${max} characters`)
    .transform((value) => value.replace(/\s+/g, ' '));

export const upiIdSchema = z
  .string({ error: 'Enter your UPI ID' })
  .trim()
  .regex(UPI_ID_PATTERN, 'Enter a valid UPI ID, e.g. royalcafe@okaxis');

// For PATCH bodies: every field is optional, but an empty update is a mistake.
export const hasAtLeastOneField = (value) => Object.keys(value).length > 0;
