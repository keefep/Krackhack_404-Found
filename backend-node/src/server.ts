import express, { Request, Response, NextFunction, ErrorRequestHandler as ExpressErrorHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import router from './routes/index';
import { rateLimit } from './middleware/auth';
import { ValidationError, AuthenticationError } from './utils/errors';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Mount the main router at the root path
app.use('/', router);

// Error handling middleware types
type CustomErrorRequestHandler = ExpressErrorHandler;
type CustomRequestHandler = express.RequestHandler;

// 404 handler
const notFoundHandler: CustomRequestHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
};

app.use(notFoundHandler);

// Global error handler
const errorHandler: CustomErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ValidationError) {
    res.status(400).json({
      status: 'error',
      message: err.message,
      code: 'VALIDATION_ERROR'
    });
    return;
  }

  if (err instanceof AuthenticationError) {
    res.status(401).json({
      status: 'error',
      message: err.message,
      code: 'AUTH_ERROR'
    });
    return;
  }

  // Default error
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    code: 'SERVER_ERROR'
  });
  return;
};

app.use(errorHandler);

// Set the port (default to 3000)
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start the server
connectDatabase()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Initialize Socket.IO
    const { initializeSocket } = require('./utils/socket');
    initializeSocket(server);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});
