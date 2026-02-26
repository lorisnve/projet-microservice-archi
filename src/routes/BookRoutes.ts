import { Router } from 'express';
import bookController from '../controllers/BookController.js';
import { jwtAuth, requireRole } from '../middlewares/JwtAuthMiddleware.js';

const router = Router();

router.get('/', jwtAuth, bookController.findAll);
router.get('/:id', jwtAuth, bookController.findById);
router.post('/', jwtAuth, requireRole('ADMIN'), bookController.create);

export default router;
