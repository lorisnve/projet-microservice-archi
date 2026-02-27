import { Router } from 'express';
import bookController from '../controllers/BookController.js';
import { jwtAuth, requireRole } from '../middlewares/JwtAuthMiddleware.js';

const router = Router();

router.get('/', jwtAuth, bookController.findAll);
router.get('/:id', jwtAuth, bookController.findById);
router.post('/', jwtAuth, requireRole('ADMIN'), bookController.create);
router.put('/:id', jwtAuth, requireRole('ADMIN'), bookController.update);

export default router;
