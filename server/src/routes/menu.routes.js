import { Router } from 'express';
import {
  createMenuItem,
  deleteMenuItem,
  listMenu,
  updateMenuItem,
} from '../controllers/menu.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { idParamsSchema } from '../validators/common.js';
import { createMenuItemSchema, updateMenuItemSchema } from '../validators/menu.validators.js';

const router = Router();

router.use(requireAuth);
router.get('/', listMenu);
router.post('/', validate({ body: createMenuItemSchema }), createMenuItem);
router.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateMenuItemSchema }),
  updateMenuItem,
);
router.delete('/:id', validate({ params: idParamsSchema }), deleteMenuItem);

export default router;
