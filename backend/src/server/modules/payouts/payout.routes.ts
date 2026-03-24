import { Router } from 'express';
import { payoutController } from './payout.controller';

const router = Router();

router.get('/', payoutController.getAll);
router.post('/', payoutController.create);

export default router;
