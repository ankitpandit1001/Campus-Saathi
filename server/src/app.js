import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import prisma from './utils/prisma.js';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

// Trust reverse proxy (Render, Vercel, AWS ELB) for correct client IP detection and cookies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows image loading from client origin
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// Strict CORS Setup with production flexibility
const clientUrlEnv = process.env.CLIENT_URL || '';
const configuredOrigins = clientUrlEnv
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'https://campus-saathi-two.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, health checks)
    if (!origin) {
      return callback(null, true);
    }
    const normalized = origin.trim().replace(/\/+$/, '');
    if (allowedOrigins.has(normalized)) {
      return callback(null, true);
    }
    // Allow Vercel preview URLs if configured or matching vercel.app
    if (
      process.env.ALLOW_VERCEL_PREVIEWS === 'true' &&
      (normalized.endsWith('.vercel.app') || normalized.includes('vercel.app'))
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Institution-Id', 'Accept'],
  maxAge: 86400,
};

// Handle all CORS requests and preflight OPTIONS requests across all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter for general API traffic
app.use('/api', apiRateLimiter);

// Serve uploaded files securely with nosniff
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  express.static(path.resolve(__dirname, '../uploads'))
);

// Production Health Check Endpoints (both /health and /api/health)
app.get(['/health', '/api/health'], async (req, res) => {
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    service: 'CampusSaathi SaaS Multi-Tenant API',
    uptime: Math.floor(process.uptime()),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/institutions/:institutionId/complaints', complaintRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
