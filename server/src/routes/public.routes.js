import { Router } from 'express';
import { getPublicMenu } from '../controllers/public.controller.js';
import { validate } from '../middleware/validate.js';
import { slugParamsSchema } from '../validators/public.validators.js';

const router = Router();

router.get('/:slug/menu', validate({ params: slugParamsSchema }), getPublicMenu);

export default router;
