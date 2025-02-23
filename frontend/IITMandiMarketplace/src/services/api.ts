// @ts-nocheck
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// API Response types
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  role: string;
  isVerified: boolean;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  status: string;
  seller: User;
  createdAt: string;
  updatedAt: string;
}

// Create API instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error adding auth token:', error);
      return config;
    }
  }
);

// Transform responses and handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = 
      error.response?.data?.message || 
      error.message || 
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    collegeId: string;
  }) => api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  getCurrentUser: () => 
    api.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: { name: string }) =>
    api.patch<ApiResponse<User>>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<ApiResponse>('/auth/change-password', data),

  logout: () => api.post<ApiResponse>('/auth/logout'),
};

// Products API
export const productsApi = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get<ApiResponse<{ products: Product[]; total: number }>>('/products', { params }),

  getProduct: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  createProduct: (data: FormData) =>
    api.post<ApiResponse<Product>>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateProduct: (id: string, data: FormData) =>
    api.patch<ApiResponse<Product>>(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteProduct: (id: string) =>
    api.delete<ApiResponse>(`/products/${id}`),

  uploadImages: (images: FormData) =>
    api.post<ApiResponse<string[]>>('/products/upload-images', images, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  searchProducts: (query: string) =>
    api.get<ApiResponse<Product[]>>('/products/search', { params: { q: query } }),
};

// Helper function to extract data from response
export const extractData = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data?.data) {
    throw new Error(response.data?.message || 'No data received');
  }
  return response.data.data;
};

export type { ApiResponse, User, Product, AuthResponse };
export default api;
