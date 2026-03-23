import { Router } from 'express';
import { roleController } from './role.controller';

const router = Router();

router.get('/', roleController.getAll);
router.post('/', roleController.create);
router.put('/', roleController.update);

export default router;
