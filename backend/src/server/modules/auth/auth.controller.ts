import { Request, Response } from 'express';
import { authService } from './auth.service';
import {AuthRequest} from "./auth.middleware";

class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { login, password } = req.body;
            const result = await authService.login(login, password);
            if (result.success) {
                res.json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async me(req: AuthRequest, res: Response) {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Пользователь не найден' });
        }
        res.json({ success: true, user: req.user });
    }
}

export const authController = new AuthController();
