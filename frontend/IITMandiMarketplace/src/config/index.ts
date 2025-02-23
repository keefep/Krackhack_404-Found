const ENV = {
  development: {
    API_URL: 'http://localhost:5000/api',
    UPLOADS_URL: 'http://localhost:5000/uploads',
  },
  production: {
    API_URL: 'https://your-production-url.com/api',
    UPLOADS_URL: 'https://your-production-url.com/uploads',
  },
};

// Select environment based on ENV variable or default to development
const getEnvironment = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export const { API_URL, UPLOADS_URL } = getEnvironment();

export const APP_CONFIG = {
  name: 'IIT Mandi Marketplace',
  version: '1.0.0',
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  maxImagesPerProduct: 5,
  supportEmail: 'support@iitmandi.ac.in',
};

// Product categories
export const CATEGORIES = [
  'Books',
  'Electronics',
  'Furniture',
  'Clothing',
  'Sports',
  'Others',
];

// Product conditions
export const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

// Product statuses
export const STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'RESERVED', label: 'Reserved' },
];
