import { Router } from 'express';
import { catalogController } from './catalog.controller';

const router = Router();

router.get('/', catalogController.getAll);
router.post('/', catalogController.create);
router.put('/:id', catalogController.update);

export default router;
