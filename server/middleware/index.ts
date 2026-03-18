import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { verifyToken } from '../lib/jwt.js';
import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware that validates request bodies against a Zod schema.
 * Returns 422 Unprocessable Entity with detailed field errors on failure.
 */
export const validateBody = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Middleware that validates the Authorization header JWT token
 * and injects the decoded user into req.user.
 */
export const authenticateToken = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[Auth] No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded: any = verifyToken(token);

    // Verify user still exists in the database
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
