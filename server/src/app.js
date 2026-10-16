import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import testRoutes from './routes/testRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, can restrict in strict prod
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/conversations', conversationRoutes);

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint ${req.originalUrl} not found.` });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

export default app;
