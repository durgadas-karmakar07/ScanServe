import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';
import { nameSchema, objectId } from './common.js';

// Rules.md section 5: at most 20 of one dish and 30 different dishes per order.
export const MAX_QUANTITY = 20;
export const MAX_LINES = 30;

// Any script (Bengali, Hindi, English…), but no control characters. Skipping the name sends
// "Guest".
const customerNameSchema = nameSchema('your name', { min: 1, max: 30 }).refine(
  (value) => !/\p{Cc}/u.test(value),
  'Use letters only',
);

const orderLineSchema = z
  .object({
    menuItemId: objectId,
    qty: z
      .number({ error: 'Choose how many' })
      .int('Choose how many')
      .min(1, 'Choose how many')
      .max(MAX_QUANTITY, `At most ${MAX_QUANTITY} of one dish`),
  })
  .strict();

// The phone sends only which dishes and how many; prices and the total come from the server.
export const placeOrderSchema = z
  .object({
    customerName: customerNameSchema,
    items: z
      .array(orderLineSchema)
      .min(1, 'Your order is empty')
      .max(MAX_LINES, `At most ${MAX_LINES} different dishes in one order`)
      .refine(
        (lines) => new Set(lines.map((line) => line.menuItemId)).size === lines.length,
        'Each dish can be in the order only once',
      ),
  })
  .strict();

// GET /api/orders?status=new or ?status=new,ready — which orders the kitchen board loads.
export const kitchenOrdersQuerySchema = z
  .object({
    status: z
      .string()
      .max(40)
      .transform((value) => value.split(',').map((part) => part.trim()))
      .pipe(z.array(z.enum(ORDER_STATUSES)).min(1).max(ORDER_STATUSES.length))
      .default(['new']),
  })
  .strict();
