import api, { APIResponse } from './api';
import { Product } from '../components/ProductCard/ProductCard';

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  tags?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ProductFilters {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'date' | 'condition';
  sortOrder?: 'asc' | 'desc';
  sellerId?: string;
}

class ProductService {
  // Create a new product
  async createProduct(data: CreateProductData): Promise<APIResponse<Product>> {
    const formData = new FormData();

    // Append product data
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, value);
      }
    });

    // Append images
    data.images.forEach((image, index) => {
      formData.append('images', {
        uri: image,
        type: 'image/jpeg',
        name: `image_${index}.jpg`,
      } as any);
    });

    return api.request({
      method: 'POST',
      url: '/products',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get all products with filters and pagination
  async getProducts(params?: {
    page?: number;
    limit?: number;
    filters?: ProductFilters;
  }): Promise<APIResponse<ProductListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const query = queryParams.toString();
    return api.get(`/products${query ? `?${query}` : ''}`);
  }

  // Get a single product by ID
  async getProduct(id: string): Promise<APIResponse<Product>> {
    return api.get(`/products/${id}`);
  }

  // Update a product
  async updateProduct(data: UpdateProductData): Promise<APIResponse<Product>> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (data.images) {
      data.images.forEach((image, index) => {
        // Only append if it's a new image (string URL)
        if (typeof image === 'string' && image.startsWith('file://')) {
          formData.append('images', {
            uri: image,
            type: 'image/jpeg',
            name: `image_${index}.jpg`,
          } as any);
        }
      });
    }

    return api.request({
      method: 'PATCH',
      url: `/products/${data.id}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete a product
  async deleteProduct(id: string): Promise<APIResponse<void>> {
    return api.delete(`/products/${id}`);
  }

  // Get user's products
  async getUserProducts(userId: string): Promise<APIResponse<ProductListResponse>> {
    return api.get(`/products/user/${userId}`);
  }

  // Get product categories
  async getCategories(): Promise<APIResponse<string[]>> {
    return api.get('/products/categories');
  }

  // Report a product
  async reportProduct(productId: string, reason: string): Promise<APIResponse<void>> {
    return api.post(`/products/${productId}/report`, { reason });
  }

  // Mark product as sold
  async markAsSold(productId: string): Promise<APIResponse<Product>> {
    return api.post(`/products/${productId}/sold`);
  }
}

export default new ProductService();
