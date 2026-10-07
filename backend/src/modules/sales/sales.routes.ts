import { Router } from 'express';
import { SaleController } from './sales.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', SaleController.list);
router.post('/', SaleController.create);
router.get('/:id', SaleController.getById);

export default router;
