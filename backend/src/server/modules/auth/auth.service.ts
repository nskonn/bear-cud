import prisma from '../../prisma/client';

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

        return { success: true, user };
    }
}

export const authService = new AuthService();
