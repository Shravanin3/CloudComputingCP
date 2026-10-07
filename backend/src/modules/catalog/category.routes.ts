import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All category routes require authentication
router.use(authenticate);

router.get('/', CategoryController.list);
router.post('/', requireRole([UserRole.Owner, UserRole.Admin]), CategoryController.create);
router.put('/:id', requireRole([UserRole.Owner, UserRole.Admin]), CategoryController.update);
router.delete('/:id', requireRole([UserRole.Owner, UserRole.Admin]), CategoryController.delete);

export default router;
