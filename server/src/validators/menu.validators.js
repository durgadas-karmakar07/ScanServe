import { z } from 'zod';
import { hasAtLeastOneField, nameSchema, optionalLineSchema, photoInputSchema } from './common.js';

const MAX_PRICE = 99999;

// Money is a whole number of rupees (Rules.md section 2): ₹120 is 120.
const dishFields = {
  name: nameSchema('the dish name', { min: 1, max: 60 }),
  description: optionalLineSchema(120),
  category: nameSchema('a category, e.g. Snacks', { min: 1, max: 30 }),
  price: z
    .number({ error: 'Enter the price in rupees' })
    .int('Use whole rupees, e.g. 120')
    .min(1, 'The price must be at least ₹1')
    .max(MAX_PRICE, `The price must be at most ₹${MAX_PRICE}`),
  isVeg: z.boolean({ error: 'Choose veg or non-veg' }),
  isAvailable: z.boolean(),
  photo: photoInputSchema,
};

export const createMenuItemSchema = z
  .object({
    ...dishFields,
    description: dishFields.description.default(''),
    isAvailable: dishFields.isAvailable.default(true),
    photo: dishFields.photo.default(null),
  })
  .strict();

export const updateMenuItemSchema = z
  .object(dishFields)
  .partial()
  .strict()
  .refine(hasAtLeastOneField, { error: 'Nothing to update' });
