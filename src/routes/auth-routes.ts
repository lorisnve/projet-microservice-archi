import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/auth-controller.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});

const router: Router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

export default router;

