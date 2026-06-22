import api from './client';

export type UserRole = 'user' | 'admin';

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

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
