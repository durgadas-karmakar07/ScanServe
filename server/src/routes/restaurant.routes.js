import { Router } from 'express';
import { updateRestaurant } from '../controllers/restaurant.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { updateRestaurantSchema } from '../validators/restaurant.validators.js';

const router = Router();

router.patch('/', requireAuth, validate({ body: updateRestaurantSchema }), updateRestaurant);

export default router;
