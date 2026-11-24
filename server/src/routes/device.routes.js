import { Router } from 'express';
import { registerDevice } from '../controllers/device.controller.js';
import { deviceCreateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { registerDeviceSchema } from '../validators/device.validators.js';

const router = Router();

router.post('/', deviceCreateLimiter, validate({ body: registerDeviceSchema }), registerDevice);

export default router;
