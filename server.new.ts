import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { randomUUID } from 'node:crypto';

// --- Route Modules ---
import { authRouter } from './server/routes/auth.js';
import { shiftsRouter } from './server/routes/shifts.js';
import { fuelRouter } from './server/routes/fuel.js';
import { maintenanceRouter } from './server/routes/maintenance.js';
import { expensesRouter } from './server/routes/expenses.js';
import { statsRouter } from './server/routes/stats.js';
import { supabase } from './server/lib/supabase.js';

// --- Env Validation ---
const requiredEnvVars = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('FATAL: Variáveis de ambiente obrigatórias ausentes:');
  missingEnvVars.forEach(v => console.error(`- ${v}`));
  process.exit(1);
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log('--- INICIANDO SERVIDOR VEICULOPRO V2 (SUPABASE) ---');
  console.log(`Ambiente: ${NODE_ENV}`);
  console.log(`Data/Hora: ${new Date().toISOString()}`);

  const app = express();
  app.set('trust proxy', 1);

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    'https://veiculopro.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ].filter(Boolean) as string[];

  console.log('Origens permitidas:', allowedOrigins);

  // === MIDDLEWARES ===

  // 1. Request Logger (production only logs API routes to reduce noise)
  app.use((req, res, next) => {
    if (NODE_ENV !== 'production' || req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get('origin') || 'none'}`);
    }
    next();
  });

  // 2. Body Parser
  app.use(express.json({ limit: '50mb' }));

  // 3. Static Assets BEFORE CORS (same-origin requests bypass CORS checks)
  if (NODE_ENV === 'production') {
    app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  // 4. CORS
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.toLowerCase().trim();

      const isExplicitlyAllowed = allowedOrigins.length === 0 ||
        allowedOrigins.some(o => {
          const norm = o.toLowerCase();
          return normalizedOrigin === norm || normalizedOrigin.startsWith(norm);
        });

      const isDynamicAllowed =
        normalizedOrigin.endsWith('.onrender.com') ||
        normalizedOrigin.endsWith('.vercel.app');

      const isProtocolRelativeMatch = allowedOrigins.some(o => {
        const oUrl = o.replace(/^https?:\/\//, '');
        const nUrl = normalizedOrigin.replace(/^https?:\/\//, '');
        return nUrl === oUrl || nUrl.startsWith(oUrl);
      });

      if (isExplicitlyAllowed || isDynamicAllowed || isProtocolRelativeMatch) {
        callback(null, true);
      } else {
        console.warn(`[CORS REJECTED] Origin: "${origin}" | Allowed: ${JSON.stringify(allowedOrigins)}`);
        callback(new Error('CORS: Acesso não permitido por esta origem.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Authorization']
  }));

  // === ROUTES ===
  // Auth routes (login, register, google OAuth, profile, change-password)
  app.use('/api/auth', authRouter);
  // Google OAuth Callback — Google redirects to /auth/callback/google (non-api prefix)
  app.use('/auth', authRouter);
  // /api/user/profile is an alias kept for backward compat with frontend
  app.use('/api/user', authRouter);

  // Data routes
  app.use('/api/shifts', shiftsRouter);
  app.use('/api/fuel', fuelRouter);
  app.use('/api/maintenance', maintenanceRouter);
  // /api/service-types maps to maintenanceRouter's /service-types subroutes
  app.use('/api/service-types', (req: any, res: any, next: any) => {
    req.url = '/service-types' + (req.url === '/' ? '' : req.url);
    maintenanceRouter(req, res, next);
  });
  app.use('/api/fixed-expenses', expensesRouter);
  // /api/fixed-expense-types maps to expensesRouter's /types subroutes
  app.use('/api/fixed-expense-types', (req: any, res: any, next: any) => {
    req.url = '/types' + (req.url === '/' ? '' : req.url);
    expensesRouter(req, res, next);
  });

  // Stats & AI Analysis
  app.use('/api/stats', statsRouter);
  // /api/ai/analysis maps to statsRouter's /ai-analysis route
  app.get('/api/ai/analysis', (req: any, res: any, next: any) => {
    req.url = '/ai-analysis';
    statsRouter(req, res, next);
  });

  // Backup & Restore
  app.post('/api/restore', async (req: any, res) => {
    console.log('[Restore] Rota atingida! Payload size:', JSON.stringify(req.body).length);
    const data = req.body;
    const backupEmail = data.user_profile?.email ||
      (data.user_profile?.name ? `${data.user_profile.name.toLowerCase().replace(/\s/g, '.')}@restored.com` : 'usuario.migrado@restored.com');

    if (!data || !data.version) {
      return res.status(400).json({ error: 'Arquivo de backup inválido' });
    }

    try {
      let { data: user } = await supabase.from('users').select('id').eq('email', backupEmail).maybeSingle();
      let userId: string;

      if (!user) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({ email: backupEmail, name: data.user_profile?.name || 'Usuário Migrado' })
          .select('id').single();
        if (createError || !newUser) throw new Error('Falha ao criar usuário: ' + createError?.message);
        userId = newUser.id;
      } else {
        userId = user.id;
      }

      if (data.user_profile) {
        const { id, email, created_at, ...profile } = data.user_profile;
        await supabase.from('users').update(profile).eq('id', userId);
      }

      const deleteResults = await Promise.all([
        supabase.from('shifts').delete().eq('user_id', userId),
        supabase.from('fuel_logs').delete().eq('user_id', userId),
        supabase.from('maintenance_logs').delete().eq('user_id', userId),
        supabase.from('fixed_expenses').delete().eq('user_id', userId)
      ]);

      const deleteError = deleteResults.find(r => r.error);
      if (deleteError) throw new Error(`Erro ao limpar dados: ${deleteError.error?.message}`);

      if (data.shifts?.length) {
        const shifts = data.shifts.map((s: any) => { const { id, created_at, ...rest } = s; return { ...rest, id: randomUUID(), user_id: userId }; });
        const { error } = await supabase.from('shifts').insert(shifts);
        if (error) throw new Error(`Erro nos Turnos: ${error.message}`);
      }
      if (data.fuel_logs?.length) {
        const fuel = data.fuel_logs.map((f: any) => { const { id, created_at, ...rest } = f; return { ...rest, id: randomUUID(), user_id: userId }; });
        const { error } = await supabase.from('fuel_logs').insert(fuel);
        if (error) throw new Error(`Erro nos Abastecimentos: ${error.message}`);
      }
      if (data.maintenance_logs?.length) {
        const maint = data.maintenance_logs.map((m: any) => { const { id, created_at, ...rest } = m; return { ...rest, id: randomUUID(), user_id: userId }; });
        const { error } = await supabase.from('maintenance_logs').insert(maint);
        if (error) throw new Error(`Erro nas Manutenções: ${error.message}`);
      }
      if (data.fixed_expenses?.length) {
        const expenses = data.fixed_expenses.map((e: any) => { const { id, created_at, ...rest } = e; return { ...rest, id: randomUUID(), user_id: userId }; });
        const { error } = await supabase.from('fixed_expenses').insert(expenses);
        if (error) throw new Error(`Erro nas Despesas: ${error.message}`);
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error('[Restore] Erro crítico:', err.message);
      res.status(500).json({ error: 'Falha ao restaurar dados', details: err.message });
    }
  });

  // 404 & Global Error Handlers
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  app.use('/api', (err: any, req: any, res: any, next: any) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      details: NODE_ENV !== 'production' ? err.stack : undefined
    });
  });

  // Vite dev server OR production SPA fallback
  if (NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  // Global unhandled error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.message?.startsWith('CORS:')) {
      return res.status(403).json({ error: 'Acesso não permitido.' });
    }
    console.error(`[${new Date().toISOString()}] Erro não tratado:`, { message: err.message, url: req.url, method: req.method });
    res.status(500).json({ error: NODE_ENV === 'development' ? err.message : 'Erro interno do servidor.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
