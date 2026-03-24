import { Router } from 'express';
import { workLogController } from './work-log.controller';

const router = Router();

router.get('/', workLogController.getAll);
router.post('/', workLogController.create);
router.put('/:id', workLogController.update);

export default router;
