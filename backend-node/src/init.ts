import { config } from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database';
import User from './models/User';
import bcrypt from 'bcryptjs';

// Load environment variables
config();

const initializeDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@iitmandi.ac.in',
      password: adminPassword,
      collegeId: 'ADMIN001',
      role: 'ADMIN',
      isVerified: true
    });
    console.log('Created admin user');

    // Create test user
    const testPassword = await bcrypt.hash('test123', 10);
    await User.create({
      name: 'Test User',
      email: 'test@iitmandi.ac.in',
      password: testPassword,
      collegeId: 'B20001',
      role: 'USER',
      isVerified: true
    });
    console.log('Created test user');

    console.log('Database initialization completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin - admin@iitmandi.ac.in / admin123');
    console.log('User  - test@iitmandi.ac.in / test123');

    // Disconnect from database
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
});
