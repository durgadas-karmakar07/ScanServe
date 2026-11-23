import { z } from 'zod';
import {
  hasAtLeastOneField,
  nameSchema,
  optionalLineSchema,
  photoInputSchema,
  upiIdSchema,
} from './common.js';

// The slug is not editable: it is printed on the QR poster on the menu board.
export const updateRestaurantSchema = z
  .object({
    name: nameSchema('your café name'),
    tagline: optionalLineSchema(80),
    upiId: upiIdSchema,
    isAcceptingOrders: z.boolean(),
    coverPhoto: photoInputSchema,
    logo: photoInputSchema,
  })
  .partial()
  .strict()
  .refine(hasAtLeastOneField, { error: 'Nothing to update' });
