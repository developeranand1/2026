import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const TOKEN_KEY = '@krisimarg_staff_token';
const USER_KEY = '@krisimarg_staff_user';

export const AuthService = {
  async saveAuth(token, user) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getToken() {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async getUser() {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clearAuth() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },

  async login(mobile, password) {
    const res = await fetch(`${API_BASE_URL}/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    await this.saveAuth(json.token, json.data);
    return json;
  }
};

const authFetch = async (endpoint, options = {}) => {
  const token = await AuthService.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
};

export const FieldService = {
  async getActiveSession() {
    return authFetch('/field-work/active');
  },

  async startWork(payload) {
    return authFetch('/field-work/start', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async endWork(payload) {
    return authFetch('/field-work/end', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMyHistory() {
    return authFetch('/field-work/my-history');
  }
};

export const ExpenseService = {
  async submitExpense(payload) {
    return authFetch('/expenses/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMyExpenses() {
    return authFetch('/expenses/my-expenses');
  }
};
