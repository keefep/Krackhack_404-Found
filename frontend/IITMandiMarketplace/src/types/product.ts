export type ProductCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

export interface Seller {
  id: string;
  name: string;
  rating: number;
  avatar?: string;
}

export interface ProductPreview {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: ProductCondition;
  location: string;
  viewCount?: number;
}

export interface ProductDetails extends ProductPreview {
  description: string;
  category: string;
  seller: Seller;
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'sold' | 'reserved';
}

export interface Product extends ProductDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'sold' | 'reserved';
  location: string;
}
