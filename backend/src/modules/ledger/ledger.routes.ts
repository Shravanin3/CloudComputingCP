import { Router } from 'express';
import { LedgerController } from './ledger.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', LedgerController.list);

export default router;
