import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// List and view
router.get('/', ProductController.list);
router.get('/:id', ProductController.getById);

// Create, update, deactivate (Restricted to Owner and Admin)
router.post('/', requireRole([UserRole.Owner, UserRole.Admin]), ProductController.create);
router.put('/:id', requireRole([UserRole.Owner, UserRole.Admin]), ProductController.update);
router.delete('/:id', requireRole([UserRole.Owner, UserRole.Admin]), ProductController.delete);

export default router;
