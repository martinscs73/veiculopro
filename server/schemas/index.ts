import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha muito longa'),
  name: z.string().min(2, 'Nome muito curto').max(100)
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória').max(128)
});

export const ChangePasswordSchema = z.object({
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

export const UserProfileSchema = z.object({
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

export const ShiftSchema = z.object({
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

export const FuelSchema = z.object({
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

export const MaintenanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
  service_type: z.string().min(1, 'Tipo de serviço é obrigatório').max(100),
  cost: z.number().nonnegative('Não pode ser negativo').max(99999),
  odometer: z.number().nonnegative('Não pode ser negativo').max(9999999),
  description: z.string().max(500).optional().nullable(),
  attachment_url: z.string().optional().nullable(),
  vehicle_name: z.string().max(100).optional().nullable(),
  driver_name: z.string().max(100).optional().nullable(),
});

export const ExpenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
  expense_type: z.string().min(1, 'Tipo de despesa é obrigatório').max(100),
  category: z.string().min(1, 'Categoria é obrigatória').max(50),
  value: z.number().positive('Deve ser um número positivo').max(99999),
  description: z.string().max(500).optional().nullable(),
  vehicle_name: z.string().max(100).optional().nullable(),
  driver_name: z.string().max(100).optional().nullable(),
});
