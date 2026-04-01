import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client';
import { userService } from '../users/user.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-drevprom';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

interface TelegramInitPayload {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  auth_date?: string;
  hash: string;
  [key: string]: string | undefined;
}

type TelegramLoginResult =
  | { success: true; exists: true; user: any; token: string }
  | {
      success: true;
      exists: false;
      telegramData: Pick<TelegramInitPayload, 'id' | 'first_name' | 'last_name' | 'username'>;
    };

export class AuthService {
  private signToken(userId: string, role: string) {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '14d' });
  }

  private parseTelegramInit(initData: string): TelegramInitPayload {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram bot token is not configured');
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      throw new Error('Invalid Telegram data: hash missing');
    }

    const dataCheckString = Array.from(params.entries())
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(TELEGRAM_BOT_TOKEN).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (hmac !== String(hash).trim()) {
      throw new Error('Invalid Telegram signature');
    }

    const userString = params.get('user');
    if (!userString) {
      throw new Error('Telegram payload must contain user data');
    }

    let userData;
    try {
      userData = JSON.parse(userString);
    } catch (error) {
      throw new Error('Failed to parse Telegram user data');
    }

    if (!userData?.id) {
      throw new Error('Telegram payload must contain id');
    }

    return {
      id: String(userData.id),
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      auth_date: params.get('auth_date') || undefined,
      hash: hash,
    } as TelegramInitPayload;
  }

  async login(login?: string, password?: string, telegram?: TelegramInitPayload) {
    if (!login || !password) {
      return { success: false, message: 'Логин и пароль обязательны' };
    }

    const user = await prisma.user.findFirst({
      where: { login, password },
    });

    if (!user) {
      return { success: false, message: 'Неверный логин или пароль' };
    }

    if (user.isBlocked) {
      return { success: false, message: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' };
    }

    if (telegram) {
      const telegramOwner = await userService.findByTelegramId(telegram.id);
      if (telegramOwner && telegramOwner.id !== user.id) {
        return { success: false, message: 'Telegram уже привязан к другому пользователю' };
      }

      await userService.attachTelegramData(user.id, {
        telegramId: telegram.id,
        telegramFirstName: telegram.first_name ?? null,
        telegramLastName: telegram.last_name ?? null,
        telegramUsername: telegram.username ?? null,
      });
    }

    const refreshedUser = await prisma.user.findUnique({ where: { id: user.id } });
    const token = this.signToken(refreshedUser!.id, refreshedUser!.role);

    return { success: true, user: refreshedUser, token };
  }

  async telegramInit(initData: string): Promise<TelegramLoginResult> {
    const payload = this.parseTelegramInit(initData);
    const existingUser = await userService.findByTelegramId(payload.id);

    if (!existingUser) {
      return {
        success: true,
        exists: false,
        telegramData: {
          id: payload.id,
          first_name: payload.first_name,
          last_name: payload.last_name,
          username: payload.username,
        },
      };
    }

    if (existingUser.isBlocked) {
      throw new Error('Ваш аккаунт заблокирован.');
    }

    const updatedUser = await userService.attachTelegramData(existingUser.id, {
      telegramFirstName: payload.first_name ?? existingUser.telegramFirstName ?? null,
      telegramLastName: payload.last_name ?? existingUser.telegramLastName ?? null,
      telegramUsername: payload.username ?? existingUser.telegramUsername ?? null,
    });
    const token = this.signToken(updatedUser.id, updatedUser.role);

    return { success: true, exists: true, user: updatedUser, token };
  }
}

export const authService = new AuthService();
