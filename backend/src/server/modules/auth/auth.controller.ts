import { Request, Response } from 'express';
import { authService } from './auth.service';
import {AuthRequest} from "./auth.middleware";
import { userService } from '../users/user.service';

class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { login, password, telegram } = req.body;
            const result = await authService.login(login, password, telegram);
            if (result.success) {
                res.json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async telegramInit(req: Request, res: Response) {
        try {
            const { initData } = req.body;
            if (!initData) {
                return res.status(400).json({ success: false, message: 'Missing initData' });
            }
            const result = await authService.telegramInit(initData);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: error instanceof Error ? error.message : 'Invalid telegram data' });
        }
    }

    async me(req: AuthRequest, res: Response) {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Пользователь не найден' });
        }
        res.json({ success: true, user: req.user });
    }

    async telegramUnlink(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ success: false, message: 'Пользователь не найден' });
            }
            await userService.clearTelegramData(req.user.id);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

export const authController = new AuthController();
