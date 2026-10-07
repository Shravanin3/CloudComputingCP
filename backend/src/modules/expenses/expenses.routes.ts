import { Router } from 'express';
import { ExpenseController } from './expenses.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ExpenseController.list);
router.post('/', ExpenseController.create);

export default router;
