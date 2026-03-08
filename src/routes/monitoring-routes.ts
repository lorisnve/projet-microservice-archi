import { Router } from 'express';
import monitoringController from '../controllers/monitoring-controller.js';
import { rateLimit } from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});

const router: Router = Router();

router.get('/health', apiLimiter, monitoringController.health);
router.get('/metrics', apiLimiter, monitoringController.metrics);

export default router;
