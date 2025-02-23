import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api';
let TOKEN = '';

const testEndpoints = async () => {
  try {
    console.log('Starting API endpoint tests...\n');

    // 1. Test Authentication
    console.log('Testing Authentication:');
    const authResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@iitmandi.ac.in',
      password: 'test123'
    });
    TOKEN = authResponse.data.data.token;
    console.log('✓ Login successful\n');

    // Set default auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`;

    // 2. Test Current User
    console.log('Testing User Endpoints:');
    const userResponse = await axios.get(`${API_URL}/auth/me`);
    console.log('✓ Get current user successful\n');

    // 3. Test Products
    console.log('Testing Product Endpoints:');
    
    // Get all products
    const productsResponse = await axios.get(`${API_URL}/products`);
    console.log('✓ Get all products successful');

    // Create a product
    const newProduct = {
      title: 'Test Product',
      description: 'This is a test product',
      price: 999,
      category: 'Books',
      condition: 'NEW',
      images: []
    };
    
    const createResponse = await axios.post(`${API_URL}/products`, newProduct);
    const productId = createResponse.data.data.id;
    console.log('✓ Create product successful');

    // Upload test image
    const testImagePath = path.join(__dirname, '../test/test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      const formData = new FormData();
      formData.append('images', fs.createReadStream(testImagePath));
      
      const uploadResponse = await axios.post(
        `${API_URL}/products/upload-images`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      console.log('✓ Upload images successful');
    }

    // Get single product
    const getProductResponse = await axios.get(`${API_URL}/products/${productId}`);
    console.log('✓ Get single product successful');

    // Update product
    const updateResponse = await axios.patch(
      `${API_URL}/products/${productId}`,
      { price: 899 }
    );
    console.log('✓ Update product successful');

    // Search products
    const searchResponse = await axios.get(`${API_URL}/products/search`, {
      params: { q: 'test' }
    });
    console.log('✓ Search products successful');

    // Delete product
    await axios.delete(`${API_URL}/products/${productId}`);
    console.log('✓ Delete product successful\n');

    console.log('All tests completed successfully! 🎉');

  } catch (error: any) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
};

// Run tests
testEndpoints();
