import { Router } from 'express';
import { userController } from './user.controller';

const router = Router();

router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;
