import { Router } from 'express';
import { createOrder, getMyOrder, markMyOrderPaid } from '../controllers/order.controller.js';
import { getPublicMenu } from '../controllers/public.controller.js';
import { orderDeviceLimiter, orderIpLimiter } from '../middleware/rateLimit.js';
import { requireDevice } from '../middleware/requireDevice.js';
import { validate } from '../middleware/validate.js';
import { idParamsSchema } from '../validators/common.js';
import { payOrderSchema, placeOrderSchema } from '../validators/order.validators.js';
import { slugParamsSchema } from '../validators/public.validators.js';

const router = Router();

// Keep /:slug/menu first: a café whose link is "orders" still gets its menu at
// /api/public/orders/menu instead of that path being read as an order id.
router.get('/:slug/menu', validate({ params: slugParamsSchema }), getPublicMenu);

// The IP limit runs before the device check so unknown device IDs are counted too; the
// per-device limit needs the checked device.
router.post(
  '/:slug/orders',
  orderIpLimiter,
  requireDevice,
  orderDeviceLimiter,
  validate({ params: slugParamsSchema, body: placeOrderSchema }),
  createOrder,
);

router.get('/orders/:id', requireDevice, validate({ params: idParamsSchema }), getMyOrder);

// Pay after eating: the phone that placed the order says it paid (UPI or cash).
router.post(
  '/orders/:id/paid',
  requireDevice,
  validate({ params: idParamsSchema, body: payOrderSchema }),
  markMyOrderPaid,
);

export default router;
