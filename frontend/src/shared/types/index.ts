export type Position = 'Упаковщик' | string;
export type AccessRole = 'admin' | 'worker';

export interface User {
  id: string;
  name: string;
  role: AccessRole;
  position?: Position | null;
  telegramId?: string | null;
  telegramFirstName?: string | null;
  telegramLastName?: string | null;
  login?: string | null;
  password?: string | null;
  isBlocked?: boolean;
  hourlyRate?: number | null;
}

export interface CatalogItem {
  id: string;
  name: string;
  position: Position;
  standardHours: number;
}

export interface WorkLogItem {
  itemId: string;
  name: string;
  qty: number;
  standardHours: number;
  total: number;
}

export interface WorkLogExpense {
  id?: string;
  name: string;
  amount: number;
}

export interface WorkLog {
  id: string;
  userId: string;
  date: string;
  items: WorkLogItem[];
  expenses?: WorkLogExpense[];
  totalEarned: number;
}

export interface Payout {
  id: string;
  userId: string;
  date: string;
  amount: number;
}
