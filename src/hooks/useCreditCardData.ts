"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { CreditCard, CreditCardPurchase, Expense } from "@/types/finance";

export function useCreditCardData(
  userId: string | null,
  onAddExpense: (expense: Omit<Expense, "id">) => void
) {
  const supabase = createClient();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [cardsRes, purchasesRes] = await Promise.all([
      supabase.from("credit_cards").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("credit_card_purchases").select("*").eq("user_id", userId).order("date", { ascending: false }),
    ]);
    if (cardsRes.error) console.error("[CC] loadData cards error:", cardsRes.error);
    if (purchasesRes.error) console.error("[CC] loadData purchases error:", purchasesRes.error);
    if (cardsRes.data) setCards(cardsRes.data.map(mapCard));
    if (purchasesRes.data) setPurchases(purchasesRes.data.map(mapPurchase));
    setLoading(false);
  }, [userId]);

  const addCard = useCallback(async (card: Omit<CreditCard, "id" | "user">) => {
    if (!userId) return;
    const { data, error } = await supabase.from("credit_cards").insert({
      user_id: userId,
      name: card.name,
      last_four: card.lastFour || null,
      credit_limit: card.creditLimit || null,
      cut_day: card.cutDay || null,
      payment_day: card.paymentDay || null,
      color: card.color || "#0073ea",
    }).select().single();
    if (error) {
      console.error("[CC] addCard error:", error);
      alert(`Error al crear tarjeta: ${error.message}`);
      return;
    }
    if (data) setCards(prev => [...prev, mapCard(data)]);
  }, [userId]);

  const updateCard = useCallback(async (id: string, updates: Partial<CreditCard>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const dbUpdate: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdate.name = updates.name;
    if (updates.lastFour !== undefined) dbUpdate.last_four = updates.lastFour;
    if (updates.creditLimit !== undefined) dbUpdate.credit_limit = updates.creditLimit;
    if (updates.cutDay !== undefined) dbUpdate.cut_day = updates.cutDay;
    if (updates.paymentDay !== undefined) dbUpdate.payment_day = updates.paymentDay;
    if (updates.color !== undefined) dbUpdate.color = updates.color;
    await supabase.from("credit_cards").update(dbUpdate).eq("id", id);
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setPurchases(prev => prev.filter(p => p.creditCardId !== id));
    await supabase.from("credit_cards").delete().eq("id", id);
  }, []);

  const addPurchase = useCallback(async (purchase: Omit<CreditCardPurchase, "id" | "user" | "paid">) => {
    if (!userId) return;
    const { data, error } = await supabase.from("credit_card_purchases").insert({
      user_id: userId,
      credit_card_id: purchase.creditCardId,
      concept: purchase.concept,
      amount: purchase.amount,
      date: purchase.date,
      category: purchase.category || null,
      description: purchase.description || null,
      paid: false,
    }).select().single();
    if (error) {
      console.error("[CC] addPurchase error:", error);
      alert(`Error al registrar compra: ${error.message}`);
      return;
    }
    if (data) setPurchases(prev => [mapPurchase(data), ...prev]);
  }, [userId]);

  const updatePurchase = useCallback(async (id: string, updates: Partial<CreditCardPurchase>) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const dbUpdate: Record<string, unknown> = {};
    if (updates.concept !== undefined) dbUpdate.concept = updates.concept;
    if (updates.amount !== undefined) dbUpdate.amount = updates.amount;
    if (updates.date !== undefined) dbUpdate.date = updates.date;
    if (updates.category !== undefined) dbUpdate.category = updates.category;
    if (updates.description !== undefined) dbUpdate.description = updates.description;
    await supabase.from("credit_card_purchases").update(dbUpdate).eq("id", id);
  }, []);

  const deletePurchase = useCallback(async (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    await supabase.from("credit_card_purchases").delete().eq("id", id);
  }, []);

  const generatePayment = useCallback(async (
    cardId: string,
    purchaseIds: string[],
    paymentDetails: {
      date: string;
      paymentType: string;
      paymentMethod?: string;
      category: string;
      description?: string;
      amount: number;
    }
  ) => {
    if (!userId) return;
    const card = cards.find(c => c.id === cardId);

    onAddExpense({
      concept: `Pago TC ${card?.name ?? ""}`,
      amount: paymentDetails.amount,
      date: paymentDetails.date,
      category: paymentDetails.category,
      status: "Pendiente",
      paymentType: paymentDetails.paymentType,
      paymentMethod: paymentDetails.paymentMethod || "Transferencia",
      description: paymentDetails.description || "",
      user: "",
    });

    setPurchases(prev => prev.map(p => purchaseIds.includes(p.id) ? { ...p, paid: true } : p));
    if (purchaseIds.length > 0) {
      await supabase.from("credit_card_purchases").update({ paid: true }).in("id", purchaseIds);
    }
  }, [userId, cards, onAddExpense]);

  return {
    cards,
    purchases,
    loading,
    addCard,
    updateCard,
    deleteCard,
    addPurchase,
    updatePurchase,
    deletePurchase,
    generatePayment,
  };
}

function mapCard(row: Record<string, unknown>): CreditCard {
  return {
    id: row.id as string,
    name: row.name as string,
    lastFour: row.last_four as string | undefined,
    creditLimit: row.credit_limit != null ? Number(row.credit_limit) : undefined,
    cutDay: row.cut_day as number | undefined,
    paymentDay: row.payment_day as number | undefined,
    color: (row.color as string) || "#0073ea",
    user: (row.user_id as string) || "",
  };
}

function mapPurchase(row: Record<string, unknown>): CreditCardPurchase {
  return {
    id: row.id as string,
    creditCardId: row.credit_card_id as string,
    concept: row.concept as string,
    amount: Number(row.amount),
    date: row.date as string,
    category: row.category as string | undefined,
    description: row.description as string | undefined,
    paid: (row.paid as boolean) || false,
    user: (row.user_id as string) || "",
  };
}
