import api from './api';

export interface User {
  _id: string;
  email: string;
  name: string;
  collegeId: string;
  idCardVerified: boolean;
  credibilityScore: number;
  phoneNumber?: string;
  createdAt: Date;
  token: string;
}

interface APIResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

interface LoginResponse {
  user: Omit<User, 'token' | 'createdAt'> & {
    createdAt: string;
  };
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  collegeId: string;
}

class AuthService {
  async login(email: string, password: string): Promise<APIResponse<User>> {
    const response = await api.post<APIResponse<LoginResponse>>('/auth/login', { 
      email, 
      password 
    });

    const userData: User = {
      ...response.data.data.user,
      token: response.data.data.token,
      createdAt: new Date(response.data.data.user.createdAt)
    };

    return {
      status: response.data.status,
      data: userData,
      message: response.data.message
    };
  }

  async register(data: RegisterData): Promise<APIResponse<User>> {
    const response = await api.post<APIResponse<LoginResponse>>('/auth/register', data);

    const userData: User = {
      ...response.data.data.user,
      token: response.data.data.token,
      createdAt: new Date(response.data.data.user.createdAt)
    };

    return {
      status: response.data.status,
      data: userData,
      message: response.data.message
    };
  }

  async logout(): Promise<APIResponse<void>> {
    return api.post('/auth/logout');
  }

  async refreshToken(): Promise<APIResponse<User>> {
    const response = await api.post<APIResponse<LoginResponse>>('/auth/refresh-token');

    const userData: User = {
      ...response.data.data.user,
      token: response.data.data.token,
      createdAt: new Date(response.data.data.user.createdAt)
    };

    return {
      status: response.data.status,
      data: userData,
      message: response.data.message
    };
  }

  async forgotPassword(email: string): Promise<APIResponse<void>> {
    return api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<APIResponse<void>> {
    return api.post('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string): Promise<APIResponse<void>> {
    return api.post('/auth/verify-email', { token });
  }
}

export default new AuthService();
