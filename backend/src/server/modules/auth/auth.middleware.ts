import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-drevprom';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Нет токена авторизации' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Пользователь не найден' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Аккаунт заблокирован' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Недействительный токен' });
    }
};
