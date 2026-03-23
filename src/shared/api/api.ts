import { User, CatalogItem, WorkLog, Payout, Role } from '../types';

const API_URL = '/api';

async function fetchWithHandle(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
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
    const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
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

  getRoles: async (): Promise<Role[]> => {
    return fetchWithHandle(`${API_URL}/roles`);
  },
  addRole: async (role: Role): Promise<Role> => {
    return fetchWithHandle(`${API_URL}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: role }),
    });
  },
  updateRole: async (oldRole: Role, newRole: Role) => {
    return fetchWithHandle(`${API_URL}/roles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName: oldRole, newName: newRole }),
    });
  }
};
