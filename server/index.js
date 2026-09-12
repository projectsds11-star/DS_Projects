import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import offerRoutes from './routes/offers.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
  });
});

// Routes — Support both /api/admin and /admin for seamless Vercel / serverless routing
app.use(['/api/admin', '/admin'], authRoutes);
app.use(['/api/admin/employees', '/admin/employees'], employeeRoutes);
app.use(['/api/admin/offers', '/admin/offers'], offerRoutes);

// 404 Handler for undefined API routes (always return JSON)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
  });
});

// Global Error Handler (guarantees JSON output, never raw HTML/text)
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An internal server error occurred',
    code: err.code || 'INTERNAL_ERROR',
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
