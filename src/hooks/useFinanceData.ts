"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Expense, Income } from "@/types/finance";

const DEFAULT_PREFS = {
  categories: ["Hogar", "Bancos", "Familia", "Transporte", "Recurrente", "KB;", "Salud", "Social", "Pets", "Pendientes"],
  payment_types: ["Pago mínimo", "Pago total", "Pago parcial", "Pago extraordinario"],
  payment_methods: ["Efectivo", "Tarjeta"],
  statuses: ["Completado", "Pendiente"],
  colors: {} as Record<string, string>,
  filters: {} as Record<string, string>,
  column_widths: {} as Record<string, number>,
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
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_PREFS.colors);
  const [savedFilters, setSavedFilters] = useState<Record<string, string>>(DEFAULT_PREFS.filters);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(DEFAULT_PREFS.column_widths);
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
      setColors(prefRes.data.colors ?? DEFAULT_PREFS.colors);
      setSavedFilters(prefRes.data.filters ?? DEFAULT_PREFS.filters);
      setColumnWidths(prefRes.data.column_widths ?? DEFAULT_PREFS.column_widths);
    } else {
      // Create preferences row for new user
      await supabase.from("user_preferences").insert({ user_id: userId, ...DEFAULT_PREFS });
    }

    setLoading(false);
  }, [userId]);

  // ── AUTO-DUPLICATE RECURRENT EXPENSES ─────────────
  useEffect(() => {
    if (!userId || expenses.length === 0) return;
    
    if (sessionStorage.getItem('recurrentChecked_v2')) return;
    
    const checkAndDuplicate = async () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const recurrentExpenses = expenses.filter(e => e.category === "Recurrente");
      
      const latestRecurrents = new Map<string, Expense>();
      recurrentExpenses.forEach(e => {
        const existing = latestRecurrents.get(e.concept);
        if (!existing || new Date(e.date) > new Date(existing.date)) {
          latestRecurrents.set(e.concept, e);
        }
      });
      
      const toCreate: any[] = [];
      latestRecurrents.forEach(e => {
        const lastDate = new Date(e.date);
        
        if (lastDate.getFullYear() < currentYear || (lastDate.getFullYear() === currentYear && lastDate.getMonth() < currentMonth)) {
          const existsThisMonth = expenses.some(ex => 
            ex.concept === e.concept && 
            new Date(ex.date).getMonth() === currentMonth && 
            new Date(ex.date).getFullYear() === currentYear
          );
          
          if (!existsThisMonth) {
            const d = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
            const newDay = Math.min(lastDate.getDate(), d.getDate());
            const newDate = new Date(currentYear, currentMonth, newDay);
            
            toCreate.push({
              user_id: userId,
              concept: e.concept,
              amount: e.amount,
              date: newDate.toISOString().split('T')[0],
              category: "Recurrente",
              status: "Pendiente",
              payment_type: e.paymentType || "Pago total",
              payment_method: e.paymentMethod || "Efectivo",
              description: e.description,
            });
          }
        }
      });
      
      if (toCreate.length > 0) {
        await supabase.from("expenses").insert(toCreate);
        loadAll(); // Reload everything so they appear
      }
      
      sessionStorage.setItem('recurrentChecked_v2', 'true');
    };
    
    checkAndDuplicate();
  }, [expenses, userId, loadAll, supabase]);

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
  const updateIncome = useCallback(async (id: string, income: Partial<Omit<Income, "id">>) => {
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, ...income } : i));
    const dbUpdate: any = {};
    if (income.source !== undefined) dbUpdate.source = income.source;
    if (income.amount !== undefined) dbUpdate.amount = income.amount;
    if (income.date !== undefined) dbUpdate.date = income.date;
    if (income.status !== undefined) dbUpdate.status = income.status;
    if (income.type !== undefined) dbUpdate.type = income.type;
    if (income.description !== undefined) dbUpdate.description = income.description;
    await supabase.from("incomes").update(dbUpdate).eq("id", id);
  }, []);

  const deleteIncome = useCallback(async (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
    await supabase.from("incomes").delete().eq("id", id);
  }, []);
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

  const updateColors = useCallback((c: Record<string, string>) => {
    setColors(c);
    savePrefs({ colors: c });
  }, [savePrefs]);

  const updateSavedFilters = useCallback((f: Record<string, string>) => {
    setSavedFilters(f);
    savePrefs({ filters: f });
  }, [savePrefs]);

  const updateColumnWidths = useCallback((w: Record<string, number>) => {
    setColumnWidths(w);
    savePrefs({ column_widths: w });
  }, [savePrefs]);

  return {
    loading,
    userId,
    expenses, incomes,
    categories, paymentTypes, paymentMethods, statuses,
    colors, savedFilters, columnWidths,
    addExpense, updateExpense, deleteExpense,
    addIncome, updateIncome, deleteIncome,
    updateCategories, updatePaymentTypes, updatePaymentMethods, updateStatuses,
    updateColors, updateSavedFilters, updateColumnWidths,
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
