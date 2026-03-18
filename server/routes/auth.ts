import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { supabase } from '../lib/supabase.js';
import { generateToken } from '../lib/jwt.js';
import { validateBody, authenticateToken } from '../middleware/index.js';
import { RegisterSchema, LoginSchema, ChangePasswordSchema, UserProfileSchema } from '../schemas/index.js';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skipSuccessfulRequests: true,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' }
});

const getGoogleRedirectUri = (req: any) => {
  let baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  baseUrl = baseUrl.replace(/\/$/, '');
  return `${baseUrl}/auth/callback/google`;
};

// --- Google OAuth ---
authRouter.get('/google/url', (req, res) => {
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
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

authRouter.get(['/callback/google', '/callback/google/'], async (req: any, res) => {
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

    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('*')
      .or(`google_id.eq.${googleUser.sub},email.eq.${googleUser.email}`)
      .maybeSingle();

    if (searchError) throw searchError;

    let user = existingUser;

    if (user) {
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
              window.opener.postMessage({ type: 'AUTH_SUCCESS', token: '${token}' }, '${safeOrigin}');
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

// --- Register & Login ---
authRouter.post('/register', authLimiter, validateBody(RegisterSchema), async (req: any, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ id: userId, email, password: hashedPassword, name })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Este email já está cadastrado.' });
      throw error;
    }

    await supabase.from('service_types').insert([
      { user_id: newUser.id, name: 'Troca de Óleo', is_default: 1 },
      { user_id: newUser.id, name: 'Pneus', is_default: 1 },
      { user_id: newUser.id, name: 'Outros', is_default: 1 }
    ]);

    res.status(201).json({ id: newUser.id });
  } catch (error: any) {
    console.error('Register Error:', error);
    res.status(400).json({ error: `Erro no cadastro: ${error.message || 'Falha ao registrar usuário'}` });
  }
});

authRouter.post('/login', authLimiter, validateBody(LoginSchema), async (req: any, res) => {
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

authRouter.post('/change-password', authenticateToken, validateBody(ChangePasswordSchema), async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (error || !user || !user.password) {
      return res.status(401).json({ error: 'Usuário não encontrado ou sem senha configurada (login via Google?).' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'A senha atual está incorreta.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedNewPassword })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    res.json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ error: 'Erro interno ao alterar a senha.' });
  }
});

// --- User Profile ---
authRouter.get('/profile', authenticateToken, async (req: any, res) => {
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

authRouter.put('/profile', authenticateToken, validateBody(UserProfileSchema), async (req: any, res) => {
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
