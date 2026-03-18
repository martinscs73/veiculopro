import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { validateBody, authenticateToken } from '../middleware/index.js';
import { ExpenseSchema } from '../schemas/index.js';

export const expensesRouter = Router();

expensesRouter.get('/', authenticateToken, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('fixed_expenses')
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
    console.error('Fixed Expenses FETCH Error:', err);
    res.status(500).json({ error: 'Falha ao buscar despesas fixas' });
  }
});

expensesRouter.post('/', authenticateToken, validateBody(ExpenseSchema), async (req: any, res) => {
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

expensesRouter.put('/:id', authenticateToken, validateBody(ExpenseSchema), async (req: any, res) => {
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

expensesRouter.delete('/:id', authenticateToken, async (req: any, res) => {
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

// --- Expense Types ---
expensesRouter.get('/types', authenticateToken, async (req: any, res) => {
  try {
    const { data, error } = await supabase
      .from('fixed_expense_types')
      .select('*')
      .or(`user_id.eq.${req.user.id},is_default.eq.1`)
      .order('name', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Fixed Expense Types FETCH Error:', err);
    res.status(500).json({ error: 'Falha ao buscar categorias de despesa' });
  }
});

expensesRouter.post('/types', authenticateToken, async (req: any, res) => {
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

expensesRouter.delete('/types/:id', authenticateToken, async (req: any, res) => {
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
