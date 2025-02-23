import mongoose, { ConnectOptions } from 'mongoose';
import { string } from 'zod';

string MONGODB_URI = process.env.MONGODB_URI;

interface MongooseServerApi {
  version: '1';
  strict: boolean;
  deprecationErrors: boolean;
}

interface CustomConnectOptions extends ConnectOptions {
  serverApi?: MongooseServerApi;
  retryWrites?: boolean;
}

const clientOptions: CustomConnectOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  },
  retryWrites: true,
  // Use write concern through connection string instead
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

export const connectDatabase = async () => {
  try {
    // Configure Mongoose options
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, clientOptions);
    
    // Test connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('MongoDB connected successfully! Database is responsive.');

    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully!');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

export default {
  connectDatabase,
  disconnectDatabase,
  MONGODB_URI,
};
