import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'node:crypto';

// --- Schemas de Validação ---
// ... (omitting schemas for brevity in this chunk, they remain unchanged)
const RegisterSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter ao menos um número'),
  name: z.string().min(2, 'Nome muito curto').max(100)
});

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória').max(128)
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .max(128)
    .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter ao menos um número'),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As senhas não coincidem",
  path: ["confirmNewPassword"]
});

const UserProfileSchema = z.object({
  name: z.string().min(2).max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  photo_url: z.string().optional().nullable(),
  vehicle_model: z.string().max(100).optional().nullable(),
  vehicle_plate: z.string()
    .max(10)
    .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Placa inválida')
    .optional()
    .nullable()
    .or(z.literal('')),
  vehicle_year: z.coerce.number().int().min(1990).max(2030).optional().nullable(),
  fuel_type: z.string().max(50).optional().nullable(),
  purchase_price: z.coerce.number().nonnegative().max(9999999).optional().nullable(),
  purchase_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido: YYYY-MM-DD')
    .optional()
    .nullable()
    .or(z.literal('')),
  profile_picture_url: z.string().optional().nullable().or(z.literal('')),
  dark_mode: z.number().int().optional().nullable(),
  notifications_enabled: z.number().int().optional().nullable(),
  vehicle_odometer: z.number().nonnegative().optional().nullable(),
  initial_odometer: z.number().nonnegative().optional().nullable(),
  subscription_plan: z.string().optional().nullable(),
}).passthrough();

const ShiftSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
  shift_type: z.string().min(1).max(50),
  platform: z.string().min(1).max(50),
  km: z.number().nonnegative('Não pode ser negativo').max(9999),
  earnings: z.number().nonnegative('Não pode ser negativo').max(99999),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  vehicle_name: z.string().max(100).optional().nullable(),
  driver_name: z.string().max(100).optional().nullable(),
  tips: z.number().nonnegative().optional().nullable(),
  rides_count: z.number().int().nonnegative().optional().nullable(),
});

const FuelSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
  liters: z.number().positive('Deve ser um número positivo').max(999),
  price_per_liter: z.number().positive('Deve ser um número positivo').max(99),
  total_value: z.number().positive('Deve ser um número positivo').max(9999),
  odometer: z.number().nonnegative('Não pode ser negativo').max(9999999),
  fuel_type: z.string().max(50).optional().nullable(),
  vehicle_name: z.string().max(100).optional().nullable(),
  driver_name: z.string().max(100).optional().nullable(),
  is_full_tank: z.number().optional().nullable(),
});

const MaintenanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
  service_type: z.string().min(1, 'Tipo de serviço é obrigatório').max(100),
  cost: z.number().nonnegative('Não pode ser negativo').max(99999),
  odometer: z.number().nonnegative('Não pode ser negativo').max(9999999),
  description: z.string().max(500).optional().nullable(),
  attachment_url: z.string().optional().nullable(),
  vehicle_name: z.string().max(100).optional().nullable(),
  driver_name: z.string().max(100).optional().nullable(),
});

const ExpenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
  expense_type: z.string().min(1, 'Tipo de despesa é obrigatório').max(100),
  category: z.string().min(1, 'Categoria é obrigatória').max(50),
  value: z.number().positive('Deve ser um número positivo').max(99999),
  description: z.string().max(500).optional().nullable(),
  vehicle_name: z.string().max(100).optional().nullable(),
  driver_name: z.string().max(100).optional().nullable(),
});

// Middleware de Validação
const validateBody = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        error: 'Dados inválidos',
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

// --- Validação de Variáveis de Ambiente ---
const requiredEnvVars = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('FATAL: Variáveis de ambiente obrigatórias ausentes:');
  missingEnvVars.forEach(envVar => {
    console.error(`- ${envVar}`);
  });
  console.error('\nConfigure seu arquivo .env com as credenciais do Supabase.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function startServer() {
  console.log('--- INICIANDO SERVIDOR VEICULOPRO V2 (SUPABASE) ---');
  const app = express();

  const allowedOrigins = NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL || 'https://veiculopro.app',
        // adicione outros domínios de produção se necessário
      ]
    : [
        'http://localhost:5173',  // Vite dev server padrão
        'http://localhost:3000',
        'http://127.0.0.1:5173',
      ];

  app.use(cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: navegação direta no browser, mobile, Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      const extraOrigins = [
        process.env.APP_URL, 
        'https://veiculopro.onrender.com',
        'https://veiculopro.app'
      ].filter(Boolean) as string[];

      if (allowedOrigins.includes(origin) || extraOrigins.some(eo => origin === eo || origin.startsWith(eo))) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin '${origin}' não permitida.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '50mb' }));

  // Request Logging
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // Auth Middleware
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('[Auth] No token provided');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // Verify user exists in Supabase
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', decoded.id)
        .single();

      if (error || !dbUser) {
        console.log('[Auth] User not found in DB');
        return res.status(401).json({ error: 'User no longer exists' });
      }

      req.user = decoded;
      next();
    } catch (err: any) {
      console.log('[Auth] Token verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

  // Auth Internal Helper
  const generateToken = (user: any) => {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  };

  // --- Auth Routes ---
  const getGoogleRedirectUri = (req: express.Request) => {
    let baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');
    return `${baseUrl}/auth/callback/google`;
  };

  app.get('/api/auth/google/url', (req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ error: 'GOOGLE_CLIENT_ID não configurado no servidor.' });
    }

    const redirectUri = getGoogleRedirectUri(req);
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get(['/auth/callback/google', '/auth/callback/google/'], async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      return res.status(500).send('Google OAuth credentials not configured');
    }

    try {
      const redirectUri = getGoogleRedirectUri(req);
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json();
      if (tokens.error) throw new Error(tokens.error_description);

      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const googleUser = await userResponse.json();

      // Search user in Supabase
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('*')
        .or(`google_id.eq.${googleUser.sub},email.eq.${googleUser.email}`)
        .maybeSingle();

      if (searchError) throw searchError;

      let user = existingUser;

      if (user) {
        // Update existing user if needed
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ 
            google_id: googleUser.sub,
            name: user.name || googleUser.name,
            photo_url: user.photo_url || googleUser.picture
          })
          .eq('id', user.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        user = updatedUser;
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: googleUser.email,
            google_id: googleUser.sub,
            name: googleUser.name,
            photo_url: googleUser.picture,
            subscription_plan: 'free'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        user = newUser;

        // Initialize default types for new user
        await supabase.from('service_types').insert([
          { user_id: user.id, name: 'Troca de Óleo', is_default: 1 },
          { user_id: user.id, name: 'Pneus', is_default: 1 },
          { user_id: user.id, name: 'Freios', is_default: 1 },
          { user_id: user.id, name: 'Suspensão', is_default: 1 },
          { user_id: user.id, name: 'Alinhamento/Balanceamento', is_default: 1 },
          { user_id: user.id, name: 'Outros', is_default: 1 }
        ]);

        await supabase.from('fixed_expense_types').insert([
          { user_id: user.id, name: 'Financiamento', is_default: 1 },
          { user_id: user.id, name: 'Seguro/Proteção', is_default: 1 },
          { user_id: user.id, name: 'Telefone/Internet', is_default: 1 },
          { user_id: user.id, name: 'Outros', is_default: 1 }
        ]);
      }

      const token = generateToken(user);
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const safeOrigin = appUrl.replace(/\/$/, '');

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'AUTH_SUCCESS', 
                  token: '${token}'
                }, '${safeOrigin}');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Autenticação bem-sucedida. Esta janela fechará automaticamente.</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('Google OAuth Error:', err);
      res.status(500).send(`Authentication failed: ${err.message}`);
    }
  });

  app.set('trust proxy', 1);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    message: { error: 'Muitas tentativas. Aguarde 15 minutos.' }
  });

  app.post('/api/auth/register', authLimiter, validateBody(RegisterSchema), async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({ email, password: hashedPassword, name })
        .select()
        .single();
      
      if (error) throw error;
      
      // Initialize defaults
      await supabase.from('service_types').insert([
        { user_id: newUser.id, name: 'Troca de Óleo', is_default: 1 },
        { user_id: newUser.id, name: 'Pneus', is_default: 1 },
        { user_id: newUser.id, name: 'Outros', is_default: 1 }
      ]);

      res.status(201).json({ id: newUser.id });
    } catch (error: any) {
      console.error('Register Error:', error);
      res.status(400).json({ error: 'Falha ao registrar usuário' });
    }
  });

  app.post('/api/auth/login', authLimiter, validateBody(LoginSchema), async (req, res) => {
    const { email, password } = req.body;
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error || !user || !user.password) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = generateToken(user);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      res.status(500).json({ error: 'Erro interno no login' });
    }
  });

  app.get('/api/user/profile', authenticateToken, async (req: any, res) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();
      
      if (error) throw error;
      res.json(user);
    } catch (error: any) {
      console.error('Profile Fetch Error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.put('/api/user/profile', authenticateToken, validateBody(UserProfileSchema), async (req: any, res) => {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(req.body)
        .eq('id', req.user.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json({ success: true, user: updatedUser });
    } catch (err: any) {
      console.error('Profile Update Error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // --- Shift Routes ---
  app.get('/api/shifts', authenticateToken, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Falha ao buscar turnos' });
    }
  });

  app.post('/api/shifts', authenticateToken, validateBody(ShiftSchema), async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert({ ...req.body, user_id: req.user.id })
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json({ id: data.id });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao salvar turno' });
    }
  });

  app.put('/api/shifts/:id', authenticateToken, validateBody(ShiftSchema), async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update(req.body)
        .match({ id: req.params.id, user_id: req.user.id });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao atualizar turno' });
    }
  });

  app.delete('/api/shifts/:id', authenticateToken, async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .match({ id: req.params.id, user_id: req.user.id });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao excluir turno' });
    }
  });

  app.delete('/api/shifts/group/:date/:shiftType', authenticateToken, async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .match({ 
          user_id: req.user.id, 
          date: req.params.date, 
          shift_type: req.params.shiftType 
        });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao excluir grupo de turnos' });
    }
  });

  // --- Fuel Routes ---
  app.get('/api/fuel', authenticateToken, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('fuel_logs')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Falha ao buscar abastecimentos' });
    }
  });

  app.post('/api/fuel', authenticateToken, validateBody(FuelSchema), async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('fuel_logs')
        .insert({ ...req.body, user_id: req.user.id })
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json({ id: data.id });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao salvar abastecimento' });
    }
  });

  app.put('/api/fuel/:id', authenticateToken, validateBody(FuelSchema), async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('fuel_logs')
        .update(req.body)
        .match({ id: req.params.id, user_id: req.user.id });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao atualizar abastecimento' });
    }
  });

  app.delete('/api/fuel/:id', authenticateToken, async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('fuel_logs')
        .delete()
        .match({ id: req.params.id, user_id: req.user.id });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao excluir abastecimento' });
    }
  });

  app.put('/api/auth/change-password', authenticateToken, validateBody(ChangePasswordSchema), async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('id', req.user.id)
        .single();

      if (fetchError || !user || !user.password) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', req.user.id);
      
      if (updateError) throw updateError;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  });

  // --- Maintenance Routes ---
  app.get('/api/maintenance', authenticateToken, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Falha ao buscar manutenções' });
    }
  });

  app.post('/api/maintenance', authenticateToken, validateBody(MaintenanceSchema), async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .insert({ ...req.body, user_id: req.user.id })
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json({ id: data.id });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao salvar manutenção' });
    }
  });

  app.put('/api/maintenance/:id', authenticateToken, validateBody(MaintenanceSchema), async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .update(req.body)
        .match({ id: req.params.id, user_id: req.user.id });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao atualizar manutenção' });
    }
  });

  app.delete('/api/maintenance/:id', authenticateToken, async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .delete()
        .match({ id: req.params.id, user_id: req.user.id });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao excluir manutenção' });
    }
  });

  // --- Service Types Routes ---
  app.get('/api/service-types', authenticateToken, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .or(`user_id.eq.${req.user.id},is_default.eq.1`)
        .order('name', { ascending: true });
      
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Falha ao buscar tipos de serviço' });
    }
  });

  app.post('/api/service-types', authenticateToken, async (req: any, res) => {
    try {
      const { name } = req.body;
      const { data, error } = await supabase
        .from('service_types')
        .insert({ user_id: req.user.id, name, is_default: 0 })
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json({ id: data.id });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao criar tipo de serviço' });
    }
  });

  app.delete('/api/service-types/:id', authenticateToken, async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .match({ id: req.params.id, user_id: req.user.id, is_default: 0 });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao excluir tipo de serviço' });
    }
  });

  // --- Fixed Expenses Routes ---
  app.get('/api/fixed-expenses', authenticateToken, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Falha ao buscar despesas fixas' });
    }
  });

  app.post('/api/fixed-expenses', authenticateToken, validateBody(ExpenseSchema), async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .insert({ ...req.body, user_id: req.user.id })
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json({ id: data.id });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao salvar despesa' });
    }
  });

  app.put('/api/fixed-expenses/:id', authenticateToken, validateBody(ExpenseSchema), async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('fixed_expenses')
        .update(req.body)
        .match({ id: req.params.id, user_id: req.user.id });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao atualizar despesa' });
    }
  });

  app.delete('/api/fixed-expenses/:id', authenticateToken, async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('fixed_expenses')
        .delete()
        .match({ id: req.params.id, user_id: req.user.id });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao excluir despesa' });
    }
  });

  app.get('/api/fixed-expense-types', authenticateToken, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('fixed_expense_types')
        .select('*')
        .or(`user_id.eq.${req.user.id},is_default.eq.1`)
        .order('name', { ascending: true });
      
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Falha ao buscar categorias de despesa' });
    }
  });

  app.post('/api/fixed-expense-types', authenticateToken, async (req: any, res) => {
    try {
      const { name } = req.body;
      const { data, error } = await supabase
        .from('fixed_expense_types')
        .insert({ user_id: req.user.id, name, is_default: 0 })
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json({ id: data.id });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao criar categoria de despesa' });
    }
  });

  app.delete('/api/fixed-expense-types/:id', authenticateToken, async (req: any, res) => {
    try {
      const { error } = await supabase
        .from('fixed_expense_types')
        .delete()
        .match({ id: req.params.id, user_id: req.user.id, is_default: 0 });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao excluir categoria de despesa' });
    }
  });

  // --- Dashboard Stats ---
  app.get('/api/stats', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const [shiftsRes, fuelRes, maintRes, fixedRes] = await Promise.all([
        supabase.from('shifts').select('earnings, km').eq('user_id', userId),
        supabase.from('fuel_logs').select('total_value, odometer').eq('user_id', userId),
        supabase.from('maintenance_logs').select('cost').eq('user_id', userId),
        supabase.from('fixed_expenses').select('value').eq('user_id', userId)
      ]);

      const totalEarnings = shiftsRes.data?.reduce((sum, s) => sum + (s.earnings || 0), 0) || 0;
      const totalKmLogged = shiftsRes.data?.reduce((sum, s) => sum + (s.km || 0), 0) || 0;
      const totalFuel = fuelRes.data?.reduce((sum, f) => sum + (f.total_value || 0), 0) || 0;
      const totalMaintenance = maintRes.data?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0;
      const totalFixed = fixedRes.data?.reduce((sum, f) => sum + (f.value || 0), 0) || 0;

      // Odometer calculation
      const odometers = fuelRes.data?.map(f => f.odometer).filter(o => o > 0) || [];
      let totalKm = totalKmLogged;
      if (odometers.length >= 2) {
        totalKm = Math.max(...odometers) - Math.min(...odometers);
      }

      const totalExpenses = totalFuel + totalMaintenance + totalFixed;
      const netProfit = totalEarnings - totalExpenses;
      const profitability = totalKm > 0 ? (totalEarnings / totalKm) : 0;

      res.json({
        totalEarnings,
        totalKm,
        totalExpenses,
        netProfit,
        profitability,
        totalFuel,
        totalMaintenance,
        totalFixed
      });
    } catch (err) {
      console.error('Stats Error:', err);
      res.status(500).json({ error: 'Falha ao gerar estatísticas' });
    }
  });

  // --- AI Analysis Route ---
  app.get('/api/ai/analysis', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [shifts30dRes, fuel30dRes, maint30dRes, expenses30dRes, shiftsPrev30dRes, userRes] = await Promise.all([
        supabase.from('shifts').select('*').eq('user_id', userId).gte('date', thirtyDaysAgo),
        supabase.from('fuel_logs').select('*').eq('user_id', userId).gte('date', thirtyDaysAgo),
        supabase.from('maintenance_logs').select('*').eq('user_id', userId).gte('date', thirtyDaysAgo),
        supabase.from('fixed_expenses').select('*').eq('user_id', userId).gte('date', thirtyDaysAgo),
        supabase.from('shifts').select('earnings, km, start_time, end_time, platform, date, shift_type').eq('user_id', userId).gte('date', sixtyDaysAgo).lt('date', thirtyDaysAgo),
        supabase.from('users').select('purchase_price, vehicle_year').eq('id', userId).single()
      ]);

      const g30 = shifts30dRes.data || [];
      const gPrev = shiftsPrev30dRes.data || [];
      const user = userRes.data;

      const ganho_bruto_30d = g30.reduce((sum, s) => sum + s.earnings, 0);
      const ganho_bruto_30d_anterior = gPrev.reduce((sum, s) => sum + s.earnings, 0);
      
      let variacao_percentual = 0;
      if (ganho_bruto_30d_anterior > 0) {
        variacao_percentual = ((ganho_bruto_30d - ganho_bruto_30d_anterior) / ganho_bruto_30d_anterior) * 100;
      } else if (ganho_bruto_30d > 0) {
        variacao_percentual = 100; // Infinite growth if previous was 0
      }

      const total_km_30d = g30.reduce((sum, s) => sum + s.km, 0);
      const total_fuel_cost_30d = fuel30dRes.data?.reduce((sum, f) => sum + f.total_value, 0) || 0;
      const total_maintenance_cost_30d = maint30dRes.data?.reduce((sum, m) => sum + m.cost, 0) || 0;
      const total_fixed_expenses_30d = expenses30dRes.data?.reduce((sum, e) => sum + e.value, 0) || 0;

      let depreciacao_30d = 0;
      if (user && user.purchase_price && user.vehicle_year) {
        const taxaAnual = 0.10;
        depreciacao_30d = (user.purchase_price * taxaAnual) / 12;
      }

      const total_costs_30d = total_fuel_cost_30d + total_maintenance_cost_30d + total_fixed_expenses_30d + depreciacao_30d;
      const lucro_liquido_30d = ganho_bruto_30d - total_costs_30d;
      const margem_lucro_percentual = ganho_bruto_30d > 0 ? (lucro_liquido_30d / ganho_bruto_30d) * 100 : 0;

      const media_por_turno = g30.length > 0 ? ganho_bruto_30d / g30.length : 0;
      const media_por_km = total_km_30d > 0 ? ganho_bruto_30d / total_km_30d : 0;
      const custo_por_km = total_km_30d > 0 ? total_costs_30d / total_km_30d : 0;
      const custo_combustivel_por_km = total_km_30d > 0 ? total_fuel_cost_30d / total_km_30d : 0;

      // Calculate total hours
      const uniqueTimeWindows = new Set();
      const total_hours = g30.reduce((sum, s) => {
        const key = `${s.date}_${s.shift_type}_${s.start_time}`;
        if (uniqueTimeWindows.has(key)) return sum;
        uniqueTimeWindows.add(key);
        
        if (s.start_time && s.end_time) {
          const start = new Date(`1970-01-01T${s.start_time}:00Z`);
          let end = new Date(`1970-01-01T${s.end_time}:00Z`);
          if (end < start) end = new Date(`1970-01-02T${s.end_time}:00Z`);
          return sum + ((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        }
        return sum;
      }, 0);
      const media_por_hora = total_hours > 0 ? ganho_bruto_30d / total_hours : 0;

      // Platform Analysis
      const platformStats: Record<string, { earnings: number, km: number }> = {};
      
      const shiftsWithKmRatio = g30.reduce((acc, shift) => {
        const turnoKey = `${shift.date}_${shift.shift_type}`;
        
        if (!acc.turnos[turnoKey]) {
          acc.turnos[turnoKey] = { totalEarnings: 0, km: 0, platforms: [] };
        }
        
        acc.turnos[turnoKey].km += shift.km;
        acc.turnos[turnoKey].totalEarnings += shift.earnings;
        acc.turnos[turnoKey].platforms.push(shift);
        return acc;
      }, { turnos: {} as Record<string, any> });

      Object.values(shiftsWithKmRatio.turnos).forEach((turno: any) => {
        turno.platforms.forEach((platform: any) => {
          const percentual = turno.totalEarnings > 0 
            ? platform.earnings / turno.totalEarnings 
            : 1 / turno.platforms.length;
          platform.km_rateado = turno.km * percentual;
          
          if (!platformStats[platform.platform]) {
            platformStats[platform.platform] = { earnings: 0, km: 0 };
          }
          platformStats[platform.platform].earnings += platform.earnings;
          platformStats[platform.platform].km += platform.km_rateado;
        });
      });

      let melhor_plataforma = { nome: 'N/A', media_por_km: 0, percentual_do_total: 0 };
      let pior_plataforma = { nome: 'N/A', media_por_km: 0 };

      const platforms = Object.entries(platformStats).map(([nome, stats]) => ({
        nome,
        media_por_km: stats.km > 0 ? stats.earnings / stats.km : 0,
        percentual_do_total: ganho_bruto_30d > 0 ? (stats.earnings / ganho_bruto_30d) * 100 : 0
      }));

      if (platforms.length > 0) {
        platforms.sort((a, b) => b.media_por_km - a.media_por_km);
        melhor_plataforma = platforms[0];
        pior_plataforma = platforms[platforms.length - 1];
      }

      // Day of Week Analysis - use manual split to avoid UTC offset bug
      const dayStats: Record<number, { earnings: number, count: number }> = {};
      g30.forEach(s => {
        const [y, m, d] = s.date.split('-').map(Number);
        const day = new Date(y, m - 1, d).getDay();
        if (!dayStats[day]) dayStats[day] = { earnings: 0, count: 0 };
        dayStats[day].earnings += s.earnings;
        dayStats[day].count += 1;
      });

      let melhor_dia_semana = { dia: -1, media_ganho: 0 };
      let max_media_dia = 0;
      Object.entries(dayStats).forEach(([dayStr, stats]) => {
        const dia = parseInt(dayStr);
        const media = stats.earnings / stats.count;
        if (media > max_media_dia) {
          max_media_dia = media;
          melhor_dia_semana = { dia, media_ganho: media };
        }
      });

      // Time of Day Analysis
      const hourStats: Record<string, { earnings: number, hours: number }> = {};
      const uniqueHourWindows = new Set();
      g30.forEach(s => {
        if (s.start_time && s.end_time) {
          const hour = s.start_time.split(':')[0] + ':00';
          const start = new Date(`1970-01-01T${s.start_time}:00Z`);
          let end = new Date(`1970-01-01T${s.end_time}:00Z`);
          if (end < start) end = new Date(`1970-01-02T${s.end_time}:00Z`);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          
          if (!hourStats[hour]) hourStats[hour] = { earnings: 0, hours: 0 };
          hourStats[hour].earnings += s.earnings;
          
          const key = `${s.date}_${s.shift_type}_${s.start_time}`;
          if (!uniqueHourWindows.has(key)) {
            uniqueHourWindows.add(key);
            hourStats[hour].hours += duration;
          }
        }
      });

      let melhor_horario = { hora_inicio: 'N/A', media_por_hora: 0 };
      let max_media_hora = 0;
      Object.entries(hourStats).forEach(([hora_inicio, stats]) => {
        const media = stats.hours > 0 ? stats.earnings / stats.hours : 0;
        if (media > max_media_hora) {
          max_media_hora = media;
          melhor_horario = { hora_inicio, media_por_hora: media };
        }
      });

      // Fuel Efficiency
      let total_liters = 0;
      fuel30dRes.data?.forEach(f => {
        total_liters += f.liters;
      });
      const eficiencia_combustivel_media = total_liters > 0 ? total_km_30d / total_liters : 0;

      // Classification
      let status_financeiro = 'critico';
      if (margem_lucro_percentual > 40) status_financeiro = 'excelente';
      else if (margem_lucro_percentual >= 25) status_financeiro = 'bom';
      else if (margem_lucro_percentual >= 10) status_financeiro = 'atencao';

      // Generate Insights
      const insights: { type: string, text: string }[] = [];

      if (variacao_percentual > 15) {
        insights.push({ type: 'conquista', text: `Seus ganhos cresceram ${variacao_percentual.toFixed(1)}% este mês comparado ao anterior. Seu melhor resultado recente!` });
      } else if (variacao_percentual < -15) {
        insights.push({ type: 'atencao', text: `Seus ganhos caíram ${Math.abs(variacao_percentual).toFixed(1)}% este mês. Avalie o que mudou na sua rotina.` });
      }

      if (melhor_plataforma.percentual_do_total > 60) {
        insights.push({ type: 'dica', text: `Você depende muito da plataforma ${melhor_plataforma.nome} (${melhor_plataforma.percentual_do_total.toFixed(1)}% dos ganhos). Considere diversificar para reduzir riscos.` });
      }

      if (custo_combustivel_por_km > 0.30) {
        insights.push({ type: 'atencao', text: `Seu custo de combustível está em R$ ${custo_combustivel_por_km.toFixed(2)}/km. Acima de R$ 0,30/km indica consumo alto. Verifique a manutenção ou seu estilo de direção.` });
      } else if (custo_combustivel_por_km > 0 && custo_combustivel_por_km < 0.20) {
        insights.push({ type: 'conquista', text: `Excelente eficiência! Seu custo de combustível está baixo (R$ ${custo_combustivel_por_km.toFixed(2)}/km).` });
      }

      if (melhor_dia_semana.dia === 0 || melhor_dia_semana.dia === 6) {
        insights.push({ type: 'dica', text: `Fins de semana são seus dias mais lucrativos (R$ ${melhor_dia_semana.media_ganho.toFixed(2)} de média). Priorize-os para maximizar seus ganhos.` });
      } else if (melhor_dia_semana.dia !== -1) {
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        insights.push({ type: 'dica', text: `Seu melhor dia tem sido ${dias[melhor_dia_semana.dia]} (R$ ${melhor_dia_semana.media_ganho.toFixed(2)} de média). Tente focar suas horas neste dia.` });
      }

      if (margem_lucro_percentual < 25) {
        insights.push({ type: 'atencao', text: `Sua margem de lucro está em ${margem_lucro_percentual.toFixed(1)}%. Tente reduzir despesas fixas ou focar em corridas mais curtas e lucrativas.` });
      } else if (margem_lucro_percentual > 40) {
        insights.push({ type: 'crescimento', text: `Sua margem de lucro de ${margem_lucro_percentual.toFixed(1)}% é excelente! Você está gerenciando muito bem seus custos.` });
      }

      if (insights.length === 0) {
        insights.push({ type: 'dica', text: 'Continue registrando seus turnos e despesas para obter insights mais precisos no futuro.' });
      }

      const metrics = {
        ganho_bruto_30d,
        ganho_bruto_30d_anterior,
        variacao_percentual,
        media_por_turno,
        media_por_hora,
        media_por_km,
        custo_por_km,
        lucro_liquido_30d,
        margem_lucro_percentual,
        melhor_plataforma,
        pior_plataforma,
        melhor_dia_semana,
        melhor_horario,
        eficiencia_combustivel_media,
        custo_combustivel_por_km,
        status_financeiro,
        insights
      };

      res.json(metrics);
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      res.status(500).json({ error: 'Falha ao gerar análise' });
    }
  });

  // --- Backup & Restore Routes ---
  app.post('/api/restore', async (req: any, res) => {
    console.log('[Restore] Rota atingida! Payload size:', JSON.stringify(req.body).length);
    const data = req.body;
    // Se não tiver email no backup, tentamos gerar um ou usar o nome
    const backupEmail = data.user_profile?.email || 
                       (data.user_profile?.name ? `${data.user_profile.name.toLowerCase().replace(/\s/g, '.')}@restored.com` : 'usuario.migrado@restored.com');
    
    if (!data || !data.version) {
      return res.status(400).json({ error: 'Arquivo de backup inválido' });
    }

    try {
      console.log(`[Restore] Iniciando restauração para o email: ${backupEmail}`);

      // 1. Localizar ou Criar Usuário (pelo Email)
      let { data: user, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', backupEmail)
        .maybeSingle();
      
      let userId: string;

      if (!user) {
        console.log(`[Restore] Criando novo usuário para ${backupEmail}`);
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: backupEmail,
            name: data.user_profile?.name || 'Usuário Migrado',
          })
          .select('id')
          .single();
        
        if (createError || !newUser) throw new Error('Falha ao criar usuário: ' + createError?.message);
        userId = newUser.id;
      } else {
        userId = user.id;
      }

      console.log(`[Restore] Usando UUID do Supabase: ${userId}`);

      // 2. Atualizar Perfil
      if (data.user_profile) {
        const { id, email, created_at, ...profile } = data.user_profile;
        await supabase
          .from('users')
          .update(profile)
          .eq('id', userId);
      }

      // 2. Limpar dados existentes antes de restaurar
      const deleteResults = await Promise.all([
        supabase.from('shifts').delete().eq('user_id', userId),
        supabase.from('fuel_logs').delete().eq('user_id', userId),
        supabase.from('maintenance_logs').delete().eq('user_id', userId),
        supabase.from('fixed_expenses').delete().eq('user_id', userId)
      ]);

      const deleteError = deleteResults.find(r => r.error);
      if (deleteError) {
        throw new Error(`Erro ao limpar dados antigos: ${deleteError.error.message}. Verifique se as tabelas existem no Supabase.`);
      }

      // 3. Inserir novos dados
      if (data.shifts?.length) {
        const shifts = data.shifts.map((s: any) => {
          const { id, created_at, ...rest } = s;
          return { ...rest, id: randomUUID(), user_id: userId };
        });
        const { error } = await supabase.from('shifts').insert(shifts);
        if (error) throw new Error(`Erro nos Turnos: ${error.message}`);
      }

      if (data.fuel_logs?.length) {
        const fuel = data.fuel_logs.map((f: any) => {
          const { id, created_at, ...rest } = f;
          return { ...rest, id: randomUUID(), user_id: userId };
        });
        const { error } = await supabase.from('fuel_logs').insert(fuel);
        if (error) throw new Error(`Erro nos Abastecimentos: ${error.message}`);
      }

      if (data.maintenance_logs?.length) {
        const maint = data.maintenance_logs.map((m: any) => {
          const { id, created_at, ...rest } = m;
          return { ...rest, id: randomUUID(), user_id: userId };
        });
        const { error } = await supabase.from('maintenance_logs').insert(maint);
        if (error) throw new Error(`Erro nas Manutenções: ${error.message}`);
      }

      if (data.fixed_expenses?.length) {
        const expenses = data.fixed_expenses.map((e: any) => {
          const { id, created_at, ...rest } = e;
          return { ...rest, id: randomUUID(), user_id: userId };
        });
        const { error } = await supabase.from('fixed_expenses').insert(expenses);
        if (error) throw new Error(`Erro nas Despesas: ${error.message}`);
      }

      console.log('[Restore] Restauração concluída com sucesso');
      res.json({ success: true });
    } catch (err: any) {
      const errorMsg = err.message || JSON.stringify(err);
      console.error('[Restore] Erro crítico:', errorMsg);
      
      // Dicas de correção baseadas no erro
      let hint = '';
      if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
        hint = ' DICA: Você esqueceu de criar as tabelas no Supabase SQL Editor. Use o script SQL que te passei.';
      } else if (errorMsg.includes('JWT')) {
        hint = ' DICA: Sua SUPABASE_SERVICE_ROLE_KEY no .env está inválida.';
      }

      res.status(500).json({ 
        error: 'Falha ao restaurar dados',
        details: errorMsg,
        how_to_fix: hint
      });
    }
  });

  // API 404 Handler
  app.use('/api', (req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Global API Error Handler
  app.use('/api', (err: any, req: any, res: any, next: any) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Handler de erros não tratados
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Erros de CORS — não expor detalhes
    if (err.message.startsWith('CORS:')) {
      return res.status(403).json({ error: 'Acesso não permitido.' });
    }
    
    // Log completo apenas no servidor (nunca expor ao cliente)
    console.error(`[${new Date().toISOString()}] Erro não tratado:`, {
      message: err.message,
      stack: NODE_ENV === 'development' ? err.stack : undefined,
      url: req.url,
      method: req.method,
    });
    
    // Resposta genérica ao cliente (não expõe stack trace)
    res.status(500).json({ 
      error: NODE_ENV === 'development' 
        ? err.message 
        : 'Erro interno do servidor.' 
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
