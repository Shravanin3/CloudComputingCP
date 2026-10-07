import { Router } from 'express';
import { PurchaseController } from './purchases.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', PurchaseController.list);
router.post('/', PurchaseController.create);
router.get('/:id', PurchaseController.getById);

export default router;
