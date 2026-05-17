import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["expense", "income"]),
  status: z.enum(["realized", "forecast"]),
  amount_cents: z
    .number({ message: "Informe um valor." })
    .int()
    .positive("O valor deve ser maior que zero."),
  description: z
    .string()
    .min(1, "Informe uma descrição.")
    .max(140, "Máximo de 140 caracteres."),
  category_id: z.string().uuid().nullable(),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
  is_recurring: z.boolean(),
  installment_total: z
    .number({ message: "Mínimo 2 parcelas." })
    .int()
    .min(2, "Mínimo 2 parcelas.")
    .max(60, "Máximo 60 parcelas.")
    .nullable(),
  abate_cents: z.number().int().min(0).nullable().optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>;

export const goalSchema = z.object({
  id: z.string().uuid().optional(),
  goal_kind: z.enum(["expense", "income", "profit"]),
  category_id: z.string().uuid().nullable(),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Mês inválido."),
  limit_cents: z
    .number({ message: "Informe um valor." })
    .int()
    .positive("O valor deve ser maior que zero."),
});

export type GoalInput = z.infer<typeof goalSchema>;

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Informe um nome.").max(40, "Máximo 40 caracteres."),
  kind: z.enum(["expense", "income"]),
  color: z.string(),
  icon: z.string(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const dreamSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Informe um título.").max(80, "Máximo 80 caracteres."),
  description: z.string().max(500, "Máximo 500 caracteres."),
  image_url: z
    .union([
      z.string().url("Cole uma URL válida da imagem."),
      z.literal(""),
      z.null(),
    ])
    .transform((v) => (v === "" ? null : v)),
  target_cents: z.number().int().positive("Defina um valor maior que zero."),
  current_cents: z.number().int().min(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
});

export type DreamInput = z.infer<typeof dreamSchema>;

export const dreamUpdateSchema = z.object({
  dream_id: z.string().uuid(),
  amount_cents: z.number().int().min(0, "Valor inválido."),
  note: z.string().max(280, "Máximo 280 caracteres."),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
});

export type DreamUpdateInput = z.infer<typeof dreamUpdateSchema>;

export const profitSchema = z.object({
  id: z.string().uuid().optional(),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Mês inválido."),
  income_cents: z.number().int().min(0),
  expense_cents: z.number().int().min(0),
  notes: z.string().max(500),
});

export type ProfitInput = z.infer<typeof profitSchema>;
