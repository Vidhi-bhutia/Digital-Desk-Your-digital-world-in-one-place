import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import integrationRoutes from './routes/integrationRoutes';
import { errorHandler } from './middleware/errorHandler';

// personal mongodb debugging
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Connect to Database
connectDB();

// Core Middlewares
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Base & Health Route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    app: 'Digital Desk API',
    tagline: 'Your digital world, in one place.',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);

// Global Error Handler
app.use(errorHandler);

// Handle 404
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[Digital Desk API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
