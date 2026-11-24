import { Router } from 'express';
import { login, logoutEverywhere, me, register } from '../controllers/auth.controller.js';
import { authIpLimiter, authLimiter, signupIpLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.validators.js';

const router = Router();

router.post(
  '/register',
  authIpLimiter,
  signupIpLimiter,
  authLimiter,
  validate({ body: registerSchema }),
  register,
);
router.post('/login', authIpLimiter, authLimiter, validate({ body: loginSchema }), login);
router.get('/me', requireAuth, me);
// Ends every login of this owner on every device (Rules.md section 5: tokenVersion).
router.post('/logout-all', requireAuth, logoutEverywhere);

export default router;
