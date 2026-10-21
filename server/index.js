import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import offerRoutes from './routes/offers.js';
import { getEmailLogs } from './controllers/offers.js';
import { supabaseAdmin } from './services/supabaseAdmin.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Handle body-parser oversize (413) — return JSON so the frontend can parse it
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Uploaded file is too large. Maximum allowed size is 25 MB per file.' });
  }
  next(err);
});

// Health Check — pings Supabase to keep it alive (used by GitHub Actions cron)
app.get(['/api/health', '/health'], async (req, res) => {
  const result = {
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    supabase: 'unknown',
  };

  try {
    // This query keeps Supabase from pausing — any DB call resets the inactivity timer
    const { count, error } = await supabaseAdmin
      .from('employees')
      .select('*', { count: 'exact', head: true });

    result.supabase = error ? `error: ${error.message}` : `ok (${count ?? 0} employees)`;
  } catch (err) {
    result.supabase = `unreachable: ${err.message}`;
  }

  res.status(200).json(result);
});

// Routes — Support both /api/admin and /admin for seamless Vercel / serverless routing
app.use(['/api/admin', '/admin'], authRoutes);
app.use(['/api/admin/employees', '/admin/employees'], employeeRoutes);
app.use(['/api/admin/offers', '/admin/offers'], offerRoutes);
// Email logs audit trail
app.get(['/api/admin/email-logs', '/admin/email-logs'], getEmailLogs);

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
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // ── Supabase connectivity check ────────────────────────────────────────
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    if (SUPABASE_URL) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          signal: AbortSignal.timeout(5000),
          headers: { 'apikey': 'test' },
        });
        // Any HTTP response (even 401) means Supabase is reachable
        console.log(`✅ Supabase reachable: ${SUPABASE_URL}`);
      } catch (err) {
        console.warn('\n' + '='.repeat(70));
        console.warn('⚠️  SUPABASE CONNECTION FAILED!');
        console.warn('    Your Supabase project is likely PAUSED (free tier auto-pauses');
        console.warn('    after 7 days of inactivity).');
        console.warn('');
        console.warn('    FIX: Go to https://supabase.com/dashboard');
        console.warn('         → Find your project → Click "Restore project"');
        console.warn('');
        console.warn('    Until restored, photo/document uploads & DB saves will FAIL.');
        console.warn('='.repeat(70) + '\n');
      }
    }
  });
}

export default app;
