import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { validateBody, authenticateToken } from '../middleware/index.js';
import { MaintenanceSchema } from '../schemas/index.js';

export const maintenanceRouter = Router();

maintenanceRouter.get('/', authenticateToken, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('maintenance_logs')
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
    console.error('Maintenance FETCH Error:', err);
    res.status(500).json({ error: 'Falha ao buscar manutenções' });
  }
});

maintenanceRouter.post('/', authenticateToken, validateBody(MaintenanceSchema), async (req: any, res) => {
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

maintenanceRouter.put('/:id', authenticateToken, validateBody(MaintenanceSchema), async (req: any, res) => {
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

maintenanceRouter.delete('/:id', authenticateToken, async (req: any, res) => {
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

// --- Service Types ---
maintenanceRouter.get('/service-types', authenticateToken, async (req: any, res) => {
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

maintenanceRouter.post('/service-types', authenticateToken, async (req: any, res) => {
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

maintenanceRouter.delete('/service-types/:id', authenticateToken, async (req: any, res) => {
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
