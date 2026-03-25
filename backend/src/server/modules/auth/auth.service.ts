import prisma from '../../prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-drevprom';

export class AuthService {
    async login(login?: string, password?: string) {
        if (!login || !password) {
            return { success: false, message: 'Логин и пароль обязательны' };
        }

        const user = await prisma.user.findFirst({
            where: { login, password }
        });

        if (!user) {
            return { success: false, message: 'Неверный логин или пароль' };
        }

        if (user.isBlocked) {
            return { success: false, message: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' };
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { success: true, user, token };
    }
}

export const authService = new AuthService();
