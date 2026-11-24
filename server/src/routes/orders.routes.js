import { Router } from 'express';
import { cancelOrder, getKitchenOrders, markOrderReady } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { idParamsSchema } from '../validators/common.js';
import { kitchenOrdersQuerySchema } from '../validators/order.validators.js';

// The kitchen screen (owner login). Customers use /api/public instead.
const router = Router();

router.use(requireAuth);
router.get('/', validate({ query: kitchenOrdersQuerySchema }), getKitchenOrders);
router.patch('/:id/ready', validate({ params: idParamsSchema }), markOrderReady);
router.patch('/:id/cancel', validate({ params: idParamsSchema }), cancelOrder);

export default router;
