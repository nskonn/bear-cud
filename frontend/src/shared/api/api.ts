import { User, CatalogItem, WorkLog, Payout, Position } from '../types';

const API_URL = '/api';

async function fetchWithHandle(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const mergedOptions = {
    ...options,
    headers,
  };

  const res = await fetch(url, mergedOptions);
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('unauthorized'));
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getUsers: async (): Promise<User[]> => {
    return fetchWithHandle(`${API_URL}/users`);
  },
  addUser: async (user: Omit<User, 'id'> | User): Promise<User> => {
    return fetchWithHandle(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  },
  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    return fetchWithHandle(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  },
  deleteUser: async (id: string): Promise<void> => {
    await fetchWithHandle(`${API_URL}/users/${id}`, { method: 'DELETE' });
  },

  getCatalog: async (): Promise<CatalogItem[]> => {
    return fetchWithHandle(`${API_URL}/catalog`);
  },
  addCatalogItem: async (item: Omit<CatalogItem, 'id'>): Promise<CatalogItem> => {
    return fetchWithHandle(`${API_URL}/catalog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  },
  updateCatalogItem: async (id: number | string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
    return fetchWithHandle(`${API_URL}/catalog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  },

  getWorkLogs: async (): Promise<WorkLog[]> => {
    return fetchWithHandle(`${API_URL}/work-logs`);
  },
  addWorkLog: async (log: Omit<WorkLog, 'id'>): Promise<WorkLog> => {
    return fetchWithHandle(`${API_URL}/work-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
  },
  updateWorkLog: async (id: number | string, log: Partial<WorkLog>): Promise<WorkLog> => {
    return fetchWithHandle(`${API_URL}/work-logs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
  },

  getPayouts: async (): Promise<Payout[]> => {
    return fetchWithHandle(`${API_URL}/payouts`);
  },
  addPayout: async (payout: Omit<Payout, 'id'>): Promise<Payout> => {
    return fetchWithHandle(`${API_URL}/payouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payout),
    });
  },

  getPositions: async (): Promise<Position[]> => {
    return fetchWithHandle(`${API_URL}/roles`);
  },
  addPosition: async (position: Position): Promise<Position> => {
    return fetchWithHandle(`${API_URL}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: position }),
    });
  },
  updatePosition: async (oldPosition: Position, newPosition: Position) => {
    return fetchWithHandle(`${API_URL}/roles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName: oldPosition, newName: newPosition }),
    });
  }
};
