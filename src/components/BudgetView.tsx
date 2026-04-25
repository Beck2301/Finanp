"use client";

import { useState, useMemo } from "react";
import { CalendarDays, TrendingDown, ChevronRight } from "lucide-react";

interface BudgetViewProps {
  available: number;
}

const PRESETS = [
  { label: "Hasta el 15", getDate: () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 15); } },
  { label: "Fin de mes", getDate: () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth() + 1, 0); } },
  { label: "Próximos 7 días", getDate: () => { const n = new Date(); n.setDate(n.getDate() + 7); return n; } },
  { label: "Próximos 30 días", getDate: () => { const n = new Date(); n.setDate(n.getDate() + 30); return n; } },
];

function getDaysBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export function BudgetView({ available }: BudgetViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return d;
  });

  const [customInput, setCustomInput] = useState(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return d.toISOString().split("T")[0];
  });

  const days = useMemo(() => getDaysBetween(today, endDate), [endDate]);
  const dailyBudget = available > 0 ? available / days : 0;

  const handlePreset = (getDate: () => Date) => {
    const d = getDate();
    if (d < today) return;
    setEndDate(d);
    setCustomInput(d.toISOString().split("T")[0]);
  };

  const handleCustomDate = (val: string) => {
    setCustomInput(val);
    const d = new Date(val + "T00:00:00");
    if (!isNaN(d.getTime()) && d >= today) setEndDate(d);
  };

  const progressPct = Math.min(100, (days / 31) * 100);
  const isGood = dailyBudget > 20;
  const isTight = dailyBudget > 0 && dailyBudget <= 20;
  const isNegative = available <= 0;

  const statusColor = isNegative ? "text-red-500" : isTight ? "text-orange-500" : "text-green-600";
  const statusBg = isNegative ? "bg-red-50 border-red-200" : isTight ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200";
  const barColor = isNegative ? "bg-red-400" : isTight ? "bg-orange-400" : "bg-green-500";
  const statusLabel = isNegative ? "⚠️ Saldo negativo" : isTight ? "⚡ Ajustado" : "✓ Bien";

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f5f6f8]">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Calculadora de Presupuesto</h2>
          <p className="text-gray-400 text-sm mt-1">Calcula cuánto puedes gastar por día según tu dinero disponible.</p>
        </div>

        {/* Main card */}
        <div className={`bg-white rounded-2xl border shadow-sm p-6 ${isNegative ? 'border-red-200' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Disponible actualmente</p>
              <p className={`text-4xl font-bold tabular-nums ${isNegative ? 'text-red-500' : 'text-gray-800'}`}>
                ${available.toFixed(2)}
              </p>
            </div>
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${statusBg} ${statusColor}`}>{statusLabel}</span>
          </div>

          {/* Date selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><CalendarDays size={16} /> Gastar hasta el...</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map(p => {
                const d = p.getDate();
                const isSelected = d.toDateString() === endDate.toDateString();
                return (
                  <button
                    key={p.label}
                    onClick={() => handlePreset(p.getDate)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isSelected ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <input
                type="date"
                value={customInput}
                min={today.toISOString().split("T")[0]}
                onChange={e => handleCustomDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] text-gray-700"
              />
            </div>
          </div>

          {/* Result */}
          <div className={`rounded-xl p-5 border ${statusBg} flex items-center justify-between`}>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">Puedes gastar hasta</p>
              <p className={`text-3xl font-bold tabular-nums ${statusColor}`}>
                ${dailyBudget.toFixed(2)} <span className="text-lg font-medium">/ día</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Durante <span className="font-semibold text-gray-600">{days} días</span> — hasta el <span className="font-semibold text-gray-600">{formatDate(endDate)}</span>
              </p>
            </div>
            <TrendingDown size={40} className={`${statusColor} opacity-20`} />
          </div>
        </div>

        {/* Breakdown cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BreakdownCard label="Por semana" value={`$${(dailyBudget * 7).toFixed(2)}`} sub="7 días" color={statusColor} />
          <BreakdownCard label="Por día" value={`$${dailyBudget.toFixed(2)}`} sub={`${days} días restantes`} color={statusColor} highlight />
          <BreakdownCard label="Por hora" value={`$${(dailyBudget / 24).toFixed(2)}`} sub="24 horas" color={statusColor} />
        </div>

        {/* Timeline bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-700">Rango de tiempo</p>
            <p className="text-sm text-gray-400">{days} días</p>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] text-gray-400">
            <span>Hoy — {formatDate(today)}</span>
            <span>{formatDate(endDate)}</span>
          </div>
        </div>

        {/* Tips */}
        {!isNegative && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-bold text-gray-700 mb-3">💡 Sugerencias</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><ChevronRight size={14} className="text-blue-400 shrink-0" /> Tu presupuesto diario ideal es de <strong className={`${statusColor}`}>${dailyBudget.toFixed(2)}</strong>.</li>
              <li className="flex items-center gap-2"><ChevronRight size={14} className="text-blue-400 shrink-0" /> Si quieres ahorrar <strong>$50</strong>, tu límite diario sería <strong>${Math.max(0, (available - 50) / days).toFixed(2)}</strong>.</li>
              <li className="flex items-center gap-2"><ChevronRight size={14} className="text-blue-400 shrink-0" /> Si quieres ahorrar <strong>$100</strong>, tu límite diario sería <strong>${Math.max(0, (available - 100) / days).toFixed(2)}</strong>.</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

function BreakdownCard({ label, value, sub, color, highlight }: { label: string, value: string, sub: string, color: string, highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${highlight ? 'text-white' : color}`}>{value}</p>
      <p className={`text-xs mt-0.5 ${highlight ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>
    </div>
  );
}
