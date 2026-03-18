import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticateToken } from '../middleware/index.js';

export const statsRouter = Router();

// --- Dashboard Stats ---
statsRouter.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = req.query;

    let shiftsQuery = supabase.from('shifts').select('earnings, km').eq('user_id', userId);
    let fuelQuery = supabase.from('fuel_logs').select('total_value, odometer').eq('user_id', userId);
    let maintQuery = supabase.from('maintenance_logs').select('cost').eq('user_id', userId);
    let fixedQuery = supabase.from('fixed_expenses').select('value').eq('user_id', userId);

    if (start) {
      shiftsQuery = shiftsQuery.gte('date', start as string);
      fuelQuery = fuelQuery.gte('date', start as string);
      maintQuery = maintQuery.gte('date', start as string);
      fixedQuery = fixedQuery.gte('date', start as string);
    }
    if (end) {
      shiftsQuery = shiftsQuery.lte('date', end as string);
      fuelQuery = fuelQuery.lte('date', end as string);
      maintQuery = maintQuery.lte('date', end as string);
      fixedQuery = fixedQuery.lte('date', end as string);
    }

    const [shiftsRes, fuelRes, maintRes, fixedRes] = await Promise.all([
      shiftsQuery, fuelQuery, maintQuery, fixedQuery
    ]);

    const totalEarnings = shiftsRes.data?.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0) || 0;
    const totalKmLogged = shiftsRes.data?.reduce((sum, s) => sum + (Number(s.km) || 0), 0) || 0;
    const totalFuel = fuelRes.data?.reduce((sum, f) => sum + (Number(f.total_value) || 0), 0) || 0;
    const totalMaintenance = maintRes.data?.reduce((sum, m) => sum + (Number(m.cost) || 0), 0) || 0;
    const totalFixed = fixedRes.data?.reduce((sum, f) => sum + (Number(f.value) || 0), 0) || 0;

    const odometers = fuelRes.data?.map(f => Number(f.odometer) || 0).filter(o => o > 0) || [];
    let totalKm = totalKmLogged;
    if (odometers.length >= 2) {
      totalKm = Math.max(...odometers) - Math.min(...odometers);
    }

    const totalExpenses = totalFuel + totalMaintenance + totalFixed;
    const netProfit = totalEarnings - totalExpenses;
    const profitability = totalKm > 0 ? (totalEarnings / totalKm) : 0;

    res.json({ totalEarnings, totalKm, totalExpenses, netProfit, profitability, totalFuel, totalMaintenance, totalFixed });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: 'Falha ao gerar estatísticas' });
  }
});

// --- AI Analysis ---
statsRouter.get('/ai-analysis', authenticateToken, async (req: any, res) => {
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
      variacao_percentual = 100;
    }

    const total_km_30d = g30.reduce((sum, s) => sum + s.km, 0);
    const total_fuel_cost_30d = fuel30dRes.data?.reduce((sum, f) => sum + f.total_value, 0) || 0;
    const total_maintenance_cost_30d = maint30dRes.data?.reduce((sum, m) => sum + m.cost, 0) || 0;
    const total_fixed_expenses_30d = expenses30dRes.data?.reduce((sum, e) => sum + e.value, 0) || 0;

    let depreciacao_30d = 0;
    if (user && user.purchase_price && user.vehicle_year) {
      depreciacao_30d = (user.purchase_price * 0.10) / 12;
    }

    const total_costs_30d = total_fuel_cost_30d + total_maintenance_cost_30d + total_fixed_expenses_30d + depreciacao_30d;
    const lucro_liquido_30d = ganho_bruto_30d - total_costs_30d;
    const margem_lucro_percentual = ganho_bruto_30d > 0 ? (lucro_liquido_30d / ganho_bruto_30d) * 100 : 0;
    const media_por_turno = g30.length > 0 ? ganho_bruto_30d / g30.length : 0;
    const media_por_km = total_km_30d > 0 ? ganho_bruto_30d / total_km_30d : 0;
    const custo_por_km = total_km_30d > 0 ? total_costs_30d / total_km_30d : 0;
    const custo_combustivel_por_km = total_km_30d > 0 ? total_fuel_cost_30d / total_km_30d : 0;

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

    const platformStats: Record<string, { earnings: number, km: number }> = {};
    const shiftsWithKmRatio = g30.reduce((acc, shift) => {
      const turnoKey = `${shift.date}_${shift.shift_type}`;
      if (!acc.turnos[turnoKey]) acc.turnos[turnoKey] = { totalEarnings: 0, km: 0, platforms: [] };
      acc.turnos[turnoKey].km += shift.km;
      acc.turnos[turnoKey].totalEarnings += shift.earnings;
      acc.turnos[turnoKey].platforms.push(shift);
      return acc;
    }, { turnos: {} as Record<string, any> });

    Object.values(shiftsWithKmRatio.turnos).forEach((turno: any) => {
      turno.platforms.forEach((platform: any) => {
        const percentual = turno.totalEarnings > 0 ? platform.earnings / turno.totalEarnings : 1 / turno.platforms.length;
        platform.km_rateado = turno.km * percentual;
        if (!platformStats[platform.platform]) platformStats[platform.platform] = { earnings: 0, km: 0 };
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
      const media = stats.earnings / stats.count;
      if (media > max_media_dia) { max_media_dia = media; melhor_dia_semana = { dia: parseInt(dayStr), media_ganho: media }; }
    });

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
        if (!uniqueHourWindows.has(key)) { uniqueHourWindows.add(key); hourStats[hour].hours += duration; }
      }
    });
    let melhor_horario = { hora_inicio: 'N/A', media_por_hora: 0 };
    let max_media_hora = 0;
    Object.entries(hourStats).forEach(([hora_inicio, stats]) => {
      const media = stats.hours > 0 ? stats.earnings / stats.hours : 0;
      if (media > max_media_hora) { max_media_hora = media; melhor_horario = { hora_inicio, media_por_hora: media }; }
    });

    const total_liters = fuel30dRes.data?.reduce((sum, f) => sum + f.liters, 0) || 0;
    const eficiencia_combustivel_media = total_liters > 0 ? total_km_30d / total_liters : 0;

    let status_financeiro = 'critico';
    if (margem_lucro_percentual > 40) status_financeiro = 'excelente';
    else if (margem_lucro_percentual >= 25) status_financeiro = 'bom';
    else if (margem_lucro_percentual >= 10) status_financeiro = 'atencao';

    const insights: { type: string, text: string }[] = [];
    if (variacao_percentual > 15) insights.push({ type: 'conquista', text: `Seus ganhos cresceram ${variacao_percentual.toFixed(1)}% este mês.` });
    else if (variacao_percentual < -15) insights.push({ type: 'atencao', text: `Seus ganhos caíram ${Math.abs(variacao_percentual).toFixed(1)}% este mês.` });
    if (melhor_plataforma.percentual_do_total > 60) insights.push({ type: 'dica', text: `Você depende muito da ${melhor_plataforma.nome} (${melhor_plataforma.percentual_do_total.toFixed(1)}%). Diversifique.` });
    if (custo_combustivel_por_km > 0.30) insights.push({ type: 'atencao', text: `Custo de combustível alto: R$ ${custo_combustivel_por_km.toFixed(2)}/km.` });
    else if (custo_combustivel_por_km > 0 && custo_combustivel_por_km < 0.20) insights.push({ type: 'conquista', text: `Excelente eficiência de combustível! R$ ${custo_combustivel_por_km.toFixed(2)}/km.` });
    if (melhor_dia_semana.dia === 0 || melhor_dia_semana.dia === 6) insights.push({ type: 'dica', text: `Fins de semana são seus dias mais lucrativos (R$ ${melhor_dia_semana.media_ganho.toFixed(2)}).` });
    else if (melhor_dia_semana.dia !== -1) {
      const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      insights.push({ type: 'dica', text: `${dias[melhor_dia_semana.dia]} é seu melhor dia (R$ ${melhor_dia_semana.media_ganho.toFixed(2)}).` });
    }
    if (margem_lucro_percentual < 25) insights.push({ type: 'atencao', text: `Margem de lucro em ${margem_lucro_percentual.toFixed(1)}%. Reduza despesas.` });
    else if (margem_lucro_percentual > 40) insights.push({ type: 'crescimento', text: `Margem de ${margem_lucro_percentual.toFixed(1)}% é excelente!` });
    if (insights.length === 0) insights.push({ type: 'dica', text: 'Continue registrando seus turnos para obter insights mais detalhados.' });

    res.json({
      ganho_bruto_30d, ganho_bruto_30d_anterior, variacao_percentual, media_por_turno, media_por_hora,
      media_por_km, custo_por_km, lucro_liquido_30d, margem_lucro_percentual, melhor_plataforma,
      pior_plataforma, melhor_dia_semana, melhor_horario, eficiencia_combustivel_media,
      custo_combustivel_por_km, status_financeiro, insights
    });
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Falha ao gerar análise' });
  }
});
