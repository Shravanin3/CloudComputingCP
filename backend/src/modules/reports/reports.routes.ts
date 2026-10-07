import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/sales', ReportsController.getSalesReport);
router.get('/profit-loss', ReportsController.getProfitAndLoss);

export default router;
