import { Router } from 'express';
import userRoutes from '../modules/users/user.routes';
import catalogRoutes from '../modules/catalog/catalog.routes';
import workLogRoutes from '../modules/work-logs/work-log.routes';
import payoutRoutes from '../modules/payouts/payout.routes';
import roleRoutes from '../modules/roles/role.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/users', userRoutes);
router.use('/catalog', catalogRoutes);
router.use('/work-logs', workLogRoutes);
router.use('/payouts', payoutRoutes);
router.use('/roles', roleRoutes);

export default router;
