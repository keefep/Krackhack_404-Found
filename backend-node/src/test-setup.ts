import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from './models/User';
import Product from './models/Product';

// Load environment variables
config();

async function testSetup() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('MongoDB connected successfully!');

    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@iitmandi.ac.in',
      password: 'password123',
      collegeId: 'B20000',
      role: 'USER',
      isVerified: true,
    });
    console.log('Test user created:', testUser);

    // Create test product
    const testProduct = await Product.create({
      title: 'Test Product',
      description: 'This is a test product',
      price: 999,
      images: ['https://via.placeholder.com/300'],
      category: 'Books',
      condition: 'NEW',
      seller: testUser._id,
      tags: ['test', 'book'],
    });
    console.log('Test product created:', testProduct);

    console.log('\nSetup completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the backend with: npm run dev');
    console.log('2. Start the frontend with: cd ../frontend/IITMandiMarketplace && npm start');
    console.log('\nTest credentials:');
    console.log('Email: test@iitmandi.ac.in');
    console.log('Password: password123');

  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSetup();
