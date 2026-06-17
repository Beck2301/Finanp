"use client";

import { useState, useMemo } from "react";
import {
  Plus, Trash2, X, CreditCard as CreditCardIcon,
  Edit2, Check, AlertCircle, ChevronRight, History, ArrowUpRight,
} from "lucide-react";
import type { CreditCard, CreditCardPurchase, Expense } from "@/types/finance";

interface CreditCardsViewProps {
  cards: CreditCard[];
  purchases: CreditCardPurchase[];
  expenses: Expense[];
  categories: string[];
  onAddCard: (card: Omit<CreditCard, "id" | "user">) => void;
  onUpdateCard: (id: string, updates: Partial<CreditCard>) => void;
  onDeleteCard: (id: string) => void;
  onAddPurchase: (purchase: Omit<CreditCardPurchase, "id" | "user" | "paid">) => void;
  onUpdatePurchase: (id: string, updates: Partial<CreditCardPurchase>) => void;
  onDeletePurchase: (id: string) => void;
  onGeneratePayment: (
    cardId: string,
    purchaseIds: string[],
    mainExpenseIds: string[],
    details: { date: string; paymentType: string; category: string; description?: string; amount: number }
  ) => void;
}

const CARD_COLORS = [
  "#0073ea", "#a25ddc", "#00c875", "#e2445c",
  "#fdab3d", "#1f6feb", "#2d8a4e", "#9e3c3c",
];

export function CreditCardsView({
  cards, purchases, expenses, categories,
  onAddCard, onUpdateCard, onDeleteCard,
  onAddPurchase, onUpdatePurchase, onDeletePurchase, onGeneratePayment,
}: CreditCardsViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showPaid, setShowPaid] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [showGeneratePayment, setShowGeneratePayment] = useState(false);

  const selectedCard = cards.find(c => c.id === selectedCardId) ?? cards[0] ?? null;
  const activeCardId = selectedCard?.id ?? null;

  // Compras del módulo TC (credit_card_purchases)
  const cardPurchases = useMemo(() =>
    purchases.filter(p => p.creditCardId === activeCardId && (showPaid ? true : !p.paid)),
    [purchases, activeCardId, showPaid]
  );

  // Gastos de la tabla principal con esta tarjeta como forma de pago (deuda)
  const mainTableExpenses = useMemo(() =>
    selectedCard
      ? expenses.filter(e =>
          e.paymentMethod === selectedCard.name &&
          e.status !== "TC Pagado"
        )
      : [],
    [expenses, selectedCard]
  );

  // Abonos registrados hacia esta tarjeta (reducen la deuda)
  const creditedPayments = useMemo(() =>
    selectedCard
      ? expenses.filter(e => e.creditedTo === selectedCard.name)
      : [],
    [expenses, selectedCard]
  );

  // IDs de compras TC sin pagar
  const allUnpaidCCIds = useMemo(() =>
    purchases.filter(p => p.creditCardId === activeCardId && !p.paid).map(p => p.id),
    [purchases, activeCardId]
  );

  // IDs de gastos de tabla principal (pendientes de pago TC)
  const mainExpenseIds = useMemo(() =>
    mainTableExpenses.map(e => e.id),
    [mainTableExpenses]
  );

  const hasUnpaid = allUnpaidCCIds.length > 0 || mainExpenseIds.length > 0;

  // Total abonado a la tarjeta (reduce la deuda pendiente)
  const totalCredited = useMemo(() =>
    creditedPayments.reduce((a, e) => a + e.amount, 0),
    [creditedPayments]
  );

  // Total pendiente combinado (compras - abonos)
  const unpaidTotal = useMemo(() => {
    const ccTotal = purchases
      .filter(p => p.creditCardId === activeCardId && !p.paid)
      .reduce((a, p) => a + p.amount, 0);
    const expTotal = mainTableExpenses.reduce((a, e) => a + e.amount, 0);
    return Math.max(0, ccTotal + expTotal - totalCredited);
  }, [purchases, activeCardId, mainTableExpenses, totalCredited]);

  // Deuda total de TODAS las tarjetas (CC + tabla principal - abonos)
  const totalDebt = useMemo(() => {
    const ccDebt = purchases.filter(p => !p.paid).reduce((a, p) => a + p.amount, 0);
    const expDebt = expenses.filter(e =>
      cards.some(c => c.name === e.paymentMethod) && e.status !== "TC Pagado"
    ).reduce((a, e) => a + e.amount, 0);
    const totalCredits = expenses
      .filter(e => cards.some(c => c.name === e.creditedTo))
      .reduce((a, e) => a + e.amount, 0);
    return Math.max(0, ccDebt + expDebt - totalCredits);
  }, [purchases, expenses, cards]);

  // Unpaid por tarjeta (para el widget) — descontando abonos
  const unpaidByCard = useMemo(() => {
    const map: Record<string, number> = {};
    cards.forEach(card => {
      const cc = purchases.filter(p => p.creditCardId === card.id && !p.paid).reduce((a, p) => a + p.amount, 0);
      const exp = expenses.filter(e => e.paymentMethod === card.name && e.status !== "TC Pagado").reduce((a, e) => a + e.amount, 0);
      const credited = expenses.filter(e => e.creditedTo === card.name).reduce((a, e) => a + e.amount, 0);
      map[card.id] = Math.max(0, cc + exp - credited);
    });
    return map;
  }, [cards, purchases, expenses]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f5f6f8]">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Tarjetas de Crédito</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Las compras aquí <strong>no afectan</strong> tu saldo hasta que generes el pago.
              {totalDebt > 0 && (
                <span className="ml-2 text-orange-500 font-semibold">
                  Deuda total: ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-black transition-all active:scale-95 shadow-md"
          >
            <Plus size={16} /> Nueva Tarjeta
          </button>
        </div>

        {/* Cards grid */}
        {cards.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <CreditCardIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 font-medium">No tienes tarjetas registradas.</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all"
            >
              Agregar primera tarjeta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(card => (
              <CardWidget
                key={card.id}
                card={card}
                unpaid={unpaidByCard[card.id] ?? 0}
                isSelected={activeCardId === card.id}
                onSelect={() => setSelectedCardId(card.id)}
                onEdit={() => setEditingCardId(card.id)}
                onDelete={() => {
                  if (confirm(`¿Eliminar la tarjeta "${card.name}"? También se eliminarán todas sus compras.`)) {
                    onDeleteCard(card.id);
                    if (selectedCardId === card.id) setSelectedCardId(null);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Purchases panel */}
        {activeCardId && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base font-bold text-gray-800">
                  Compras — {selectedCard?.name}
                </h3>
                <button
                  onClick={() => setShowPaid(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${showPaid ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                >
                  <History size={12} />
                  {showPaid ? "Ocultar pagadas" : "Ver historial"}
                </button>
              </div>
              <div className="flex gap-2">
                {hasUnpaid && (
                  <button
                    onClick={() => setShowGeneratePayment(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-all active:scale-95 shadow-sm"
                  >
                    <CreditCardIcon size={14} />
                    Generar Pago
                  </button>
                )}
                <button
                  onClick={() => setShowAddPurchase(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all active:scale-95"
                >
                  <Plus size={14} />
                  Añadir Compra
                </button>
              </div>
            </div>

            {cardPurchases.length === 0 && mainTableExpenses.length === 0 && creditedPayments.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-400 text-sm">
                  {showPaid ? "No hay compras registradas." : "No hay compras pendientes."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[12px] uppercase tracking-wide font-semibold">
                      <th className="px-4 py-2.5 text-left">Fecha</th>
                      <th className="px-4 py-2.5 text-left">Concepto</th>
                      <th className="px-4 py-2.5 text-left hidden sm:table-cell">Categoría</th>
                      <th className="px-4 py-2.5 text-right">Monto</th>
                      <th className="px-4 py-2.5 text-left hidden md:table-cell">Detalle</th>
                      <th className="px-4 py-2.5 text-center w-20">Estado</th>
                      <th className="px-2 py-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Compras del módulo TC */}
                    {cardPurchases.map(p => (
                      <PurchaseRow
                        key={p.id}
                        purchase={p}
                        categories={categories}
                        onUpdate={(updates) => onUpdatePurchase(p.id, updates)}
                        onDelete={() => onDeletePurchase(p.id)}
                      />
                    ))}
                    {/* Gastos de la tabla principal con esta TC */}
                    {mainTableExpenses.map(e => (
                      <MainExpenseRow key={e.id} expense={e} />
                    ))}
                    {/* Abonos registrados a esta tarjeta */}
                    {creditedPayments.map(e => (
                      <CreditedPaymentRow key={e.id} expense={e} />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-700">
                      <td className="px-4 py-3" colSpan={3}>
                        Total pendiente de pago
                        {totalCredited > 0 && (
                          <span className="ml-2 text-[11px] font-normal text-green-600">
                            (abonado: -${totalCredited.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-gray-900">
                        ${unpaidTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} US$
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddCard && (
        <AddCardModal
          onClose={() => setShowAddCard(false)}
          onSave={(card) => { onAddCard(card); setShowAddCard(false); }}
        />
      )}

      {editingCardId && (
        <EditCardModal
          card={cards.find(c => c.id === editingCardId)!}
          onClose={() => setEditingCardId(null)}
          onSave={(updates) => { onUpdateCard(editingCardId, updates); setEditingCardId(null); }}
        />
      )}

      {showAddPurchase && activeCardId && (
        <AddPurchaseModal
          cardName={selectedCard?.name ?? ""}
          cardId={activeCardId}
          categories={categories}
          onClose={() => setShowAddPurchase(false)}
          onSave={(purchase) => { onAddPurchase(purchase); setShowAddPurchase(false); }}
        />
      )}

      {showGeneratePayment && activeCardId && (
        <GeneratePaymentModal
          cardName={selectedCard?.name ?? ""}
          unpaidTotal={unpaidTotal}
          unpaidCount={allUnpaidCCIds.length + mainExpenseIds.length}
          categories={categories}
          onClose={() => setShowGeneratePayment(false)}
          onGenerate={(details) => {
            const purchaseIds = details.markAsPaid ? allUnpaidCCIds : [];
            const expIds = details.markAsPaid ? mainExpenseIds : [];
            onGeneratePayment(activeCardId, purchaseIds, expIds, details);
            setShowGeneratePayment(false);
          }}
        />
      )}
    </div>
  );
}

// ── Card Widget ───────────────────────────────────────────────────────────────

function CardWidget({ card, unpaid, isSelected, onSelect, onEdit, onDelete }: {
  card: CreditCard;
  unpaid: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const usedPct = card.creditLimit && card.creditLimit > 0 ? Math.min(100, (unpaid / card.creditLimit) * 100) : 0;
  const available = card.creditLimit != null ? card.creditLimit - unpaid : null;
  const isHighUsage = usedPct > 75;

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden border-2 ${isSelected ? "border-[#0073ea] shadow-lg shadow-blue-100/50" : "border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5"}`}
    >
      <div
        className="p-5 text-white relative"
        style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}aa)` }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Tarjeta de Crédito</p>
            <p className="text-white font-bold text-lg leading-tight mt-0.5">{card.name}</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"><Edit2 size={13} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-white/70 text-sm font-mono tracking-widest">
            {card.lastFour ? `•••• •••• •••• ${card.lastFour}` : "•••• •••• •••• ••••"}
          </p>
          <CreditCardIcon size={24} className="text-white/60" />
        </div>
      </div>

      <div className="bg-white p-4 space-y-3">
        {card.creditLimit != null ? (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Usado: <span className={`font-bold ${isHighUsage ? "text-red-500" : "text-gray-700"}`}>${unpaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></span>
              <span className="font-semibold">{usedPct.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${isHighUsage ? "bg-red-400" : "bg-green-400"}`} style={{ width: `${usedPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Disponible: ${available != null ? available.toLocaleString("en-US", { minimumFractionDigits: 0 }) : "—"}</span>
              <span>Límite: ${card.creditLimit.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 font-semibold">
            Pendiente: <span className="text-gray-900">${unpaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
          {card.cutDay != null && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              Corte: <strong className="text-gray-700">día {card.cutDay}</strong>
            </span>
          )}
          {card.paymentDay != null && (
            <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 text-orange-600">
              Pago: <strong>día {card.paymentDay}</strong>
            </span>
          )}
        </div>

        {isSelected ? (
          <div className="flex items-center gap-1.5 text-xs text-[#0073ea] font-semibold pt-1">
            <Check size={12} /> Seleccionada — viendo compras abajo
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
            <ChevronRight size={12} /> Click para ver compras
          </div>
        )}
      </div>
    </div>
  );
}

// ── Purchase Row (from credit_card_purchases) ─────────────────────────────────

function PurchaseRow({ purchase, categories, onUpdate, onDelete }: {
  purchase: CreditCardPurchase;
  categories: string[];
  onUpdate: (updates: Partial<CreditCardPurchase>) => void;
  onDelete: () => void;
}) {
  return (
    <tr className={`group hover:bg-blue-50/30 transition-colors ${purchase.paid ? "opacity-50" : ""}`}>
      <td className="px-4 py-2.5">
        <input type="date" value={purchase.date} onChange={e => onUpdate({ date: e.target.value })}
          className="bg-transparent outline-none text-gray-600 text-sm w-full cursor-pointer focus:bg-white focus:ring-1 ring-blue-400 rounded px-1" />
      </td>
      <td className="px-4 py-2.5">
        <input type="text" value={purchase.concept} onChange={e => onUpdate({ concept: e.target.value })}
          className="bg-transparent outline-none text-gray-800 font-medium text-sm w-full focus:bg-white focus:ring-1 ring-blue-400 rounded px-1 min-w-[120px]" placeholder="Concepto..." />
      </td>
      <td className="px-4 py-2.5 hidden sm:table-cell">
        <select value={purchase.category || ""} onChange={e => onUpdate({ category: e.target.value })}
          className="bg-transparent outline-none text-gray-500 text-xs border border-gray-200 rounded-md px-2 py-1 focus:border-gray-400 max-w-[120px]">
          <option value="">Sin categoría</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="px-4 py-2.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-gray-400 text-xs">$</span>
          <input type="number" step="0.01" value={purchase.amount || ""} onChange={e => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
            className="bg-transparent outline-none text-gray-800 font-bold text-sm text-right tabular-nums w-24 focus:bg-white focus:ring-1 ring-blue-400 rounded px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
      </td>
      <td className="px-4 py-2.5 hidden md:table-cell">
        <input type="text" value={purchase.description || ""} onChange={e => onUpdate({ description: e.target.value })}
          className="bg-transparent outline-none text-gray-400 text-sm w-full focus:bg-white focus:ring-1 ring-blue-400 rounded px-1" placeholder="—" />
      </td>
      <td className="px-4 py-2.5 text-center">
        {purchase.paid
          ? <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Pagada</span>
          : <span className="text-[11px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">Pendiente</span>
        }
      </td>
      <td className="px-2 py-2.5">
        <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
      </td>
    </tr>
  );
}

// ── Main Table Expense Row (read-only, from expenses table) ───────────────────

function MainExpenseRow({ expense }: { expense: Expense }) {
  const dateStr = new Date(expense.date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
  return (
    <tr className="hover:bg-purple-50/30 transition-colors bg-purple-50/20">
      <td className="px-4 py-2.5 text-gray-600 text-sm">{dateStr}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-gray-800 font-medium text-sm">{expense.concept}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full border border-purple-200 shrink-0">
            <ArrowUpRight size={9} /> Tabla
          </span>
        </div>
      </td>
      <td className="px-4 py-2.5 hidden sm:table-cell">
        <span className="text-gray-500 text-xs">{expense.category || "—"}</span>
      </td>
      <td className="px-4 py-2.5 text-right">
        <span className="text-gray-800 font-bold text-sm tabular-nums">${expense.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
      </td>
      <td className="px-4 py-2.5 hidden md:table-cell text-gray-400 text-sm">{expense.description || "—"}</td>
      <td className="px-4 py-2.5 text-center">
        <span className="text-[11px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">Pendiente</span>
      </td>
      <td className="px-2 py-2.5" />
    </tr>
  );
}

// ── Credited Payment Row (abono from expenses table) ─────────────────────────────

function CreditedPaymentRow({ expense }: { expense: Expense }) {
  const dateStr = new Date(expense.date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
  return (
    <tr className="hover:bg-green-50/40 transition-colors bg-green-50/20 border-l-2 border-green-400">
      <td className="px-4 py-2.5 text-gray-600 text-sm">{dateStr}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-gray-800 font-medium text-sm">{expense.concept}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full border border-green-200 shrink-0">
            Abono
          </span>
        </div>
      </td>
      <td className="px-4 py-2.5 hidden sm:table-cell">
        <span className="text-gray-500 text-xs">{expense.category || "—"}</span>
      </td>
      <td className="px-4 py-2.5 text-right">
        <span className="text-green-600 font-bold text-sm tabular-nums">-${expense.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
      </td>
      <td className="px-4 py-2.5 hidden md:table-cell text-gray-400 text-sm">{expense.description || "—"}</td>
      <td className="px-4 py-2.5 text-center">
        <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Abonado</span>
      </td>
      <td className="px-2 py-2.5" />
    </tr>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────

function AddCardModal({ onClose, onSave }: { onClose: () => void; onSave: (card: Omit<CreditCard, "id" | "user">) => void }) {
  const [form, setForm] = useState({ name: "", lastFour: "", creditLimit: "", cutDay: "", paymentDay: "", color: CARD_COLORS[0] });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: form.name.trim(), lastFour: form.lastFour.trim() || undefined, creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined, cutDay: form.cutDay ? parseInt(form.cutDay) : undefined, paymentDay: form.paymentDay ? parseInt(form.paymentDay) : undefined, color: form.color });
  };
  return (
    <Modal title="Nueva Tarjeta de Crédito" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre de la tarjeta *"><input required autoFocus type="text" placeholder="Ej. BAC Clásica..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Últimos 4 dígitos"><input type="text" maxLength={4} placeholder="1234" value={form.lastFour} onChange={e => setForm(f => ({ ...f, lastFour: e.target.value.replace(/\D/g, "") }))} className={inputCls} /></Field>
          <Field label="Límite de crédito ($)"><input type="number" step="0.01" placeholder="0.00" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: e.target.value }))} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Día de corte"><input type="number" min="1" max="31" placeholder="22" value={form.cutDay} onChange={e => setForm(f => ({ ...f, cutDay: e.target.value }))} className={inputCls} /></Field>
          <Field label="Día de pago"><input type="number" min="1" max="31" placeholder="2" value={form.paymentDay} onChange={e => setForm(f => ({ ...f, paymentDay: e.target.value }))} className={inputCls} /></Field>
        </div>
        <Field label="Color"><div className="flex gap-2 flex-wrap">{CARD_COLORS.map(c => <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"}`} style={{ background: c }} />)}</div></Field>
        <ModalActions onClose={onClose} label="Crear Tarjeta" />
      </form>
    </Modal>
  );
}

function EditCardModal({ card, onClose, onSave }: { card: CreditCard; onClose: () => void; onSave: (updates: Partial<CreditCard>) => void }) {
  const [form, setForm] = useState({ name: card.name, lastFour: card.lastFour || "", creditLimit: card.creditLimit?.toString() || "", cutDay: card.cutDay?.toString() || "", paymentDay: card.paymentDay?.toString() || "", color: card.color });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: form.name.trim(), lastFour: form.lastFour.trim() || undefined, creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined, cutDay: form.cutDay ? parseInt(form.cutDay) : undefined, paymentDay: form.paymentDay ? parseInt(form.paymentDay) : undefined, color: form.color });
  };
  return (
    <Modal title={`Editar — ${card.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre *"><input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Últimos 4 dígitos"><input type="text" maxLength={4} value={form.lastFour} onChange={e => setForm(f => ({ ...f, lastFour: e.target.value.replace(/\D/g, "") }))} className={inputCls} /></Field>
          <Field label="Límite ($)"><input type="number" step="0.01" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: e.target.value }))} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Día de corte"><input type="number" min="1" max="31" value={form.cutDay} onChange={e => setForm(f => ({ ...f, cutDay: e.target.value }))} className={inputCls} /></Field>
          <Field label="Día de pago"><input type="number" min="1" max="31" value={form.paymentDay} onChange={e => setForm(f => ({ ...f, paymentDay: e.target.value }))} className={inputCls} /></Field>
        </div>
        <Field label="Color"><div className="flex gap-2 flex-wrap">{CARD_COLORS.map(c => <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"}`} style={{ background: c }} />)}</div></Field>
        <ModalActions onClose={onClose} label="Guardar Cambios" />
      </form>
    </Modal>
  );
}

function AddPurchaseModal({ cardId, cardName, categories, onClose, onSave }: { cardId: string; cardName: string; categories: string[]; onClose: () => void; onSave: (purchase: Omit<CreditCardPurchase, "id" | "user" | "paid">) => void }) {
  const [form, setForm] = useState({ concept: "", amount: "", date: new Date().toISOString().split("T")[0], category: categories[0] || "", description: "" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ creditCardId: cardId, concept: form.concept.trim(), amount: parseFloat(form.amount) || 0, date: form.date, category: form.category || undefined, description: form.description.trim() || undefined });
  };
  return (
    <Modal title={`Añadir Compra — ${cardName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha *"><input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} /></Field>
          <Field label="Monto ($) *"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input required type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={`${inputCls} pl-7`} /></div></Field>
        </div>
        <Field label="Concepto *"><input required autoFocus type="text" placeholder="Ej. Supermercado..." value={form.concept} onChange={e => setForm(f => ({ ...f, concept: e.target.value }))} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría"><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}><option value="">Sin categoría</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></Field>
          <Field label="Detalle"><input type="text" placeholder="Opcional..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} /></Field>
        </div>
        <ModalActions onClose={onClose} label="Registrar Compra" />
      </form>
    </Modal>
  );
}

function GeneratePaymentModal({ cardName, unpaidTotal, unpaidCount, categories, onClose, onGenerate }: {
  cardName: string; unpaidTotal: number; unpaidCount: number; categories: string[];
  onClose: () => void;
  onGenerate: (details: { date: string; paymentType: string; paymentMethod: string; category: string; description?: string; amount: number; markAsPaid: boolean }) => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    paymentType: "Pago total",
    paymentMethod: "Transferencia",
    category: "Bancos",
    description: "",
    amount: unpaidTotal.toFixed(2),
    markAsPaid: true,
  });

  const handleTypeChange = (paymentType: string) => {
    setForm(f => ({ ...f, paymentType, markAsPaid: paymentType === "Pago total" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      date: form.date,
      paymentType: form.paymentType,
      paymentMethod: form.paymentMethod,
      category: form.category,
      description: form.description.trim() || undefined,
      amount: parseFloat(form.amount) || 0,
      markAsPaid: form.markAsPaid,
    });
  };

  const isPartial = form.paymentType !== "Pago total";

  return (
    <Modal title={`Generar Pago — ${cardName}`} onClose={onClose}>
      <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm border ${isPartial ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-orange-50 border-orange-200 text-orange-700"}`}>
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        {isPartial
          ? <span>Se registrará un <strong>abono</strong> en tu registro financiero. Las compras <strong>{form.markAsPaid ? "quedarán marcadas como pagadas" : "permanecerán pendientes"}</strong>.</span>
          : <span>Se registrará el pago en tu tabla general como gasto <strong>Pendiente</strong>. Las {unpaidCount} compras quedarán marcadas como pagadas. El saldo se descuenta cuando lo marques como <strong>Completado</strong>.</span>
        }
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha de pago *"><input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} /></Field>
          <Field label="Monto ($) *">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={`${inputCls} pl-7 font-bold`} />
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de pago">
            <select value={form.paymentType} onChange={e => handleTypeChange(e.target.value)} className={inputCls}>
              <option>Pago total</option>
              <option>Pago mínimo</option>
              <option>Pago parcial</option>
            </select>
          </Field>
          <Field label="Forma de pago">
            <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className={inputCls}>
              <option>Transferencia</option>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>SPEI</option>
            </select>
          </Field>
        </div>
        <Field label="Categoría del gasto">
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Descripción (opcional)"><input type="text" placeholder="Notas adicionales..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} /></Field>
        <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={form.markAsPaid}
            onChange={e => setForm(f => ({ ...f, markAsPaid: e.target.checked }))}
            className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">
            Marcar las {unpaidCount} compras como pagadas
          </span>
        </label>
        <div className="pt-2 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm transition-colors">Cancelar</button>
          <button type="submit" className={`flex-[1.5] px-4 py-2.5 text-white rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95 ${isPartial ? "bg-blue-500 hover:bg-blue-600" : "bg-orange-500 hover:bg-orange-600"}`}>
            {isPartial ? "Registrar Abono" : "Registrar Pago"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white transition-all";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-base font-semibold text-gray-800 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <div className="pt-2 flex gap-3">
      <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm transition-colors">Cancelar</button>
      <button type="submit" className="flex-[1.5] px-4 py-2.5 bg-gray-800 hover:bg-black text-white rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95">{label}</button>
    </div>
  );
}
