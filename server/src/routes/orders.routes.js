import { Router } from 'express';
import {
  cancelOrder,
  getKitchenOrders,
  markOrderPaid,
  markOrderReady,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { idParamsSchema } from '../validators/common.js';
import { kitchenOrdersQuerySchema, payOrderSchema } from '../validators/order.validators.js';

// The kitchen screen and the unpaid list (owner login). Customers use /api/public instead.
const router = Router();

router.use(requireAuth);
router.get('/', validate({ query: kitchenOrdersQuerySchema }), getKitchenOrders);
router.patch('/:id/ready', validate({ params: idParamsSchema }), markOrderReady);
router.patch('/:id/cancel', validate({ params: idParamsSchema }), cancelOrder);
router.patch(
  '/:id/mark-paid',
  validate({ params: idParamsSchema, body: payOrderSchema }),
  markOrderPaid,
);

export default router;
