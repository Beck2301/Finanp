export type PaymentStatus = "Completado" | "Pendiente" | "Recibido" | "TC Pagado";
export type IncomeType = "Recurrente" | "Extra" | string;
export type ExpenseCategory = "Hogar" | "Bancos" | "Familia" | "Transporte" | "Recurrente" | "KB;" | "Salud" | "Social" | "Pets" | "Pendientes" | string;
export type PaymentType = "Pago mínimo" | "Pago total" | "Pago parcial" | "Pago extraordinario" | string;
export type PaymentMethod = "Efectivo" | "Tarjeta" | string;

export interface CreditCard {
  id: string;
  name: string;
  lastFour?: string;
  creditLimit?: number;
  cutDay?: number;
  paymentDay?: number;
  color: string;
  user: string;
}

export interface CreditCardPurchase {
  id: string;
  creditCardId: string;
  concept: string;
  amount: number;
  date: string;
  category?: string;
  description?: string;
  paid: boolean;
  user: string;
}

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
  creditedTo?: string;
}

export interface ColorConfig {
  statuses: Record<PaymentStatus, string>;
  categories: Record<string, string>;
}
