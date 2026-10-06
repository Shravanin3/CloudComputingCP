import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', InventoryController.list);
router.post('/restock', requireRole([UserRole.Owner, UserRole.Admin]), InventoryController.restock);

export default router;
