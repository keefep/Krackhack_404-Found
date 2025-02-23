export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  images: string[];
  sellerId: string;
  sellerName: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  createdAt: string;
  updatedAt: string;
  rating?: number;
  location?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnail?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
