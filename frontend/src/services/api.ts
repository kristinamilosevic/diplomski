import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginData): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', data);

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const u = JSON.parse(userStr) as User;
    if (u.role != null && u.role !== 'admin' && u.role !== 'user') {
      u.role = 'user';
    }
    return u;
  },
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  isAdmin: (): boolean => {
    return authApi.getCurrentUser()?.role === 'admin';
  },
  fetchMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
};

export default api;
