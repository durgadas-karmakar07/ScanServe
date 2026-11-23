import { z } from 'zod';

// Same shape as a registered café link name (see auth.validators.js).
export const slugParamsSchema = z
  .object({
    slug: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid café link'),
  })
  .strict();
