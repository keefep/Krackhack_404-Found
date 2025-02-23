import api, { APIResponse } from './api';
import { Product } from '../types/product';

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  sortBy?: 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

class SearchService {
  async search(
    query: string,
    filters?: SearchFilters,
    page = 1,
    limit = 20
  ): Promise<APIResponse<SearchResponse>> {
    const params = new URLSearchParams();
    
    // Add base parameters
    params.append('q', query);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    // Add filters if they exist
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }

    return api.get(`/products/search?${params.toString()}`);
  }

  async getCategories(): Promise<APIResponse<string[]>> {
    return api.get('/products/categories');
  }

  async getMyListings(page = 1, limit = 20): Promise<APIResponse<SearchResponse>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return api.get(`/products/my-listings?${params.toString()}`);
  }

  async getRelatedProducts(productId: string, limit = 5): Promise<APIResponse<Product[]>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    return api.get(`/products/${productId}/related?${params.toString()}`);
  }

  async getFeaturedProducts(limit = 10): Promise<APIResponse<Product[]>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    return api.get(`/products/featured?${params.toString()}`);
  }

  async getRecentProducts(limit = 20): Promise<APIResponse<Product[]>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    return api.get(`/products/recent?${params.toString()}`);
  }
}

export default new SearchService();
