import { Router } from 'express';
import { SupplierController } from './suppliers.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', SupplierController.list);
router.post('/', SupplierController.create);
router.get('/:id', SupplierController.getById);
router.put('/:id', SupplierController.update);
router.post('/:id/payments', SupplierController.makePayment);

export default router;
