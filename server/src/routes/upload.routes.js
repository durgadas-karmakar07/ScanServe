import { Router } from 'express';
import { createUploadSignature } from '../controllers/upload.controller.js';
import {
  uploadAllCafesDailyLimiter,
  uploadIpDailyLimiter,
  uploadSignatureDailyLimiter,
  uploadSignatureLimiter,
} from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { uploadSignatureSchema } from '../validators/upload.validators.js';

const router = Router();

// The limiters run after requireAuth because two count per café (req.auth.restaurantId);
// the narrow ones come first, the shared all-cafés one last.
router.post(
  '/signature',
  requireAuth,
  uploadSignatureLimiter,
  uploadSignatureDailyLimiter,
  uploadIpDailyLimiter,
  uploadAllCafesDailyLimiter,
  validate({ body: uploadSignatureSchema }),
  createUploadSignature,
);

export default router;
