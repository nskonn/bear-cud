import { Router } from 'express';
import { authController } from './auth.controller';
import {authMiddleware} from "./auth.middleware";

const router = Router();

router.post('/login', authController.login);
router.post('/telegram-init', authController.telegramInit);
router.get('/me', authMiddleware, authController.me);

export default router;
