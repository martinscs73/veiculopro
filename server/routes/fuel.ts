import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { validateBody, authenticateToken } from '../middleware/index.js';
import { FuelSchema } from '../schemas/index.js';

export const fuelRouter = Router();

fuelRouter.get('/', authenticateToken, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('fuel_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (req.query.start) query = query.gte('date', req.query.start);
    if (req.query.end) query = query.lte('date', req.query.end);
    if (req.query.page || req.query.limit) query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json(req.query.page ? { data, count, page, limit } : data);
  } catch (err) {
    console.error('Fuel FETCH Error:', err);
    res.status(500).json({ error: 'Falha ao buscar abastecimentos' });
  }
});

fuelRouter.post('/', authenticateToken, validateBody(FuelSchema), async (req: any, res) => {
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

fuelRouter.put('/:id', authenticateToken, validateBody(FuelSchema), async (req: any, res) => {
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

fuelRouter.delete('/:id', authenticateToken, async (req: any, res) => {
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
