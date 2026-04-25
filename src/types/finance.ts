export type PaymentStatus = "Completado" | "Pendiente" | "Atrasado" | "Recibido";
export type IncomeType = "Recurrente" | "Extra" | string;
export type ExpenseCategory = "General" | "Recurrente" | "Bancos" | "Alimentación" | "Transporte" | "Servicios" | "Ocio" | string;
export type PaymentType = "Pago mínimo" | "Pago total" | string;
export type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia" | string;

export interface Income {
  id: string;
  source: string; // Nombre/Concepto
  amount: number;
  date: string; // ISO string o "YYYY-MM-DD"
  user: string;
  status: PaymentStatus;
  type: IncomeType;
  description?: string;
}

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  date: string; // ISO string o "YYYY-MM-DD"
  category: ExpenseCategory;
  user: string;
  status: PaymentStatus;
  paymentType?: PaymentType;
  paymentMethod?: PaymentMethod;
  description?: string;
}

export interface ColorConfig {
  statuses: Record<PaymentStatus, string>;
  categories: Record<string, string>;
}
