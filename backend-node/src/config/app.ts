import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDatabase } from './database';
import { initializeSocket } from '../utils/socket';
import apiRoutes from '../routes';

// Load environment variables
dotenv.config();

const {
  PORT = 5000,
  NODE_ENV = 'development',
  CORS_ORIGIN = 'http://localhost:3000',
  RATE_LIMIT_WINDOW = '15m',
  RATE_LIMIT_MAX = '100'
} = process.env;

export const createApp = async (): Promise<{ app: Express; server: any }> => {
  // Initialize express app
  const app = express();

  // Connect to database
  await connectDatabase();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseDuration(RATE_LIMIT_WINDOW), // default: 15 minutes
    max: Number(RATE_LIMIT_MAX), // default: 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Compression
  app.use(compression());

  // Logging
  if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Static files
  app.use('/uploads', express.static('uploads'));

  // Basic route
  app.get('/health', (_, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  // API routes
  app.use('/api', apiRoutes);

  // Create HTTP server
  const server = createServer(app);

  // Initialize socket
  initializeSocket(server);

  return { app, server };
};

// Helper function to parse duration strings (e.g., "15m", "1h")
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000; // Default: 15 minutes

  const [_, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case 's': return num * 1000;
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'd': return num * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
}
