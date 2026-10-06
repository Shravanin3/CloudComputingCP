import { Router } from 'express';
import { CustomerController } from './customers.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', CustomerController.list);
router.post('/', CustomerController.create);
router.get('/:id', CustomerController.getById);
router.put('/:id', CustomerController.update);
router.post('/:id/payments', CustomerController.receivePayment);

export default router;
