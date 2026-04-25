"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Expense, Income } from "@/types/finance";

const DEFAULT_PREFS = {
  categories: ["General", "Recurrente", "Bancos", "Alimentación", "Transporte", "Servicios", "Ocio"],
  payment_types: ["Pago mínimo", "Pago total", "Pago parcial", "Pago extraordinario"],
  payment_methods: ["Efectivo", "Tarjeta", "Transferencia"],
  statuses: ["Completado", "Pendiente", "Atrasado"],
};

export function useFinanceData() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_PREFS.categories);
  const [paymentTypes, setPaymentTypes] = useState<string[]>(DEFAULT_PREFS.payment_types);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PREFS.payment_methods);
  const [statuses, setStatuses] = useState<string[]>(DEFAULT_PREFS.statuses);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Load all data once we have a userId
  useEffect(() => {
    if (!userId) return;
    loadAll();
  }, [userId]);

  const loadAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [expRes, incRes, prefRes] = await Promise.all([
      supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false }),
      supabase.from("incomes").select("*").eq("user_id", userId).order("date", { ascending: false }),
      supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    if (expRes.data) {
      setExpenses(expRes.data.map(mapExpense));
    }
    if (incRes.data) {
      setIncomes(incRes.data.map(mapIncome));
    }
    if (prefRes.data) {
      setCategories(prefRes.data.categories ?? DEFAULT_PREFS.categories);
      setPaymentTypes(prefRes.data.payment_types ?? DEFAULT_PREFS.payment_types);
      setPaymentMethods(prefRes.data.payment_methods ?? DEFAULT_PREFS.payment_methods);
      setStatuses(prefRes.data.statuses ?? DEFAULT_PREFS.statuses);
    } else {
      // Create preferences row for new user
      await supabase.from("user_preferences").insert({ user_id: userId, ...DEFAULT_PREFS });
    }

    setLoading(false);
  }, [userId]);

  // ── EXPENSES ──────────────────────────────────────
  const addExpense = useCallback(async (expense: Omit<Expense, "id">) => {
    if (!userId) return;
    const { data, error } = await supabase.from("expenses").insert({
      user_id: userId,
      concept: expense.concept,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      status: expense.status,
      payment_type: expense.paymentType,
      payment_method: expense.paymentMethod,
      description: expense.description,
    }).select().single();
    if (data) setExpenses(prev => [mapExpense(data), ...prev]);
  }, [userId]);

  const updateExpense = useCallback(async (id: string, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    const dbField = fieldToDb(field);
    if (dbField) await supabase.from("expenses").update({ [dbField]: value }).eq("id", id);
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await supabase.from("expenses").delete().eq("id", id);
  }, []);

  // ── INCOMES ──────────────────────────────────────
  const addIncome = useCallback(async (income: Omit<Income, "id">) => {
    if (!userId) return;
    const { data } = await supabase.from("incomes").insert({
      user_id: userId,
      source: income.source,
      amount: income.amount,
      date: income.date,
      status: income.status,
      type: income.type,
      description: income.description,
    }).select().single();
    if (data) setIncomes(prev => [mapIncome(data), ...prev]);
  }, [userId]);

  // ── PREFERENCES ──────────────────────────────────
  const savePrefs = useCallback(async (patch: Partial<typeof DEFAULT_PREFS>) => {
    if (!userId) return;
    await supabase.from("user_preferences").upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() });
  }, [userId]);

  const updateCategories = useCallback((cats: string[]) => {
    setCategories(cats);
    savePrefs({ categories: cats });
  }, [savePrefs]);

  const updatePaymentTypes = useCallback((types: string[]) => {
    setPaymentTypes(types);
    savePrefs({ payment_types: types });
  }, [savePrefs]);

  const updatePaymentMethods = useCallback((methods: string[]) => {
    setPaymentMethods(methods);
    savePrefs({ payment_methods: methods });
  }, [savePrefs]);

  const updateStatuses = useCallback((s: string[]) => {
    setStatuses(s);
    savePrefs({ statuses: s });
  }, [savePrefs]);

  return {
    loading,
    userId,
    expenses, incomes,
    categories, paymentTypes, paymentMethods, statuses,
    addExpense, updateExpense, deleteExpense,
    addIncome,
    updateCategories, updatePaymentTypes, updatePaymentMethods, updateStatuses,
  };
}

// ── Helpers ──────────────────────────────────────
function mapExpense(row: any): Expense {
  return {
    id: row.id,
    concept: row.concept,
    amount: Number(row.amount),
    date: row.date,
    category: row.category,
    status: row.status,
    paymentType: row.payment_type,
    paymentMethod: row.payment_method,
    description: row.description,
    user: row.user ?? "",
  };
}

function mapIncome(row: any): Income {
  return {
    id: row.id,
    source: row.source,
    amount: Number(row.amount),
    date: row.date,
    status: row.status,
    type: row.type,
    description: row.description,
    user: row.user ?? "",
  };
}

function fieldToDb(field: keyof Expense): string | null {
  const map: Partial<Record<keyof Expense, string>> = {
    concept: "concept",
    amount: "amount",
    date: "date",
    category: "category",
    status: "status",
    paymentType: "payment_type",
    paymentMethod: "payment_method",
    description: "description",
  };
  return map[field] ?? null;
}
