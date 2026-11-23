import { z } from 'zod';
import { hasAtLeastOneField, nameSchema, upiIdSchema } from './common.js';

// The slug is not editable: it is printed on the QR poster on the menu board.
export const updateRestaurantSchema = z
  .object({
    name: nameSchema('your café name'),
    upiId: upiIdSchema,
    isAcceptingOrders: z.boolean(),
  })
  .partial()
  .strict()
  .refine(hasAtLeastOneField, { error: 'Nothing to update' });
