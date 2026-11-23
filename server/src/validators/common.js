import { z } from 'zod';

// Rules.md section 5: the exact UPI ID format we accept.
export const UPI_ID_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
