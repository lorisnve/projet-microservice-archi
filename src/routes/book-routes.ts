import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bookController from '../controllers/book-controller.js';
import borrowController from '../controllers/borrow-controller.js';
import { jwtAuth, requireRole } from '../middlewares/jwt-auth-middleware.js';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});

const router = Router();

router.get('/', apiLimiter, jwtAuth, bookController.findAll);
router.get('/:id', apiLimiter, jwtAuth, bookController.findById);
router.post('/', apiLimiter, jwtAuth, requireRole('ADMIN'), bookController.create);
router.put('/:id', apiLimiter, jwtAuth, requireRole('ADMIN'), bookController.update);
router.delete('/:id', apiLimiter, jwtAuth, requireRole('ADMIN'), bookController.delete);
router.post('/:id/borrow', apiLimiter, jwtAuth, borrowController.borrow);
router.post('/:id/return', apiLimiter, jwtAuth, borrowController.returnBook);

export default router;
