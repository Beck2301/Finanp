export type PaymentStatus = "Completado" | "Pendiente" | "Recibido";
export type IncomeType = "Recurrente" | "Extra" | string;
export type ExpenseCategory = "Hogar" | "Bancos" | "Familia" | "Transporte" | "Recurrente" | "KB;" | "Salud" | "Social" | "Pets" | "Pendientes" | string;
export type PaymentType = "Pago mínimo" | "Pago total" | "Pago parcial" | "Pago extraordinario" | string;
export type PaymentMethod = "Efectivo" | "Tarjeta" | string;

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
