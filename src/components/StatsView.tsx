"use client";

import { useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from "recharts";
import { Income, Expense } from "@/types/finance";
import { TrendingDown, TrendingUp, DollarSign, AlertCircle } from "lucide-react";

interface StatsViewProps {
  expenses: Expense[];
  incomes: Income[];
}

const COLORS = ["#0073ea", "#a25ddc", "#00c875", "#e2445c", "#fdab3d", "#579bfc", "#ff7043", "#26c6da", "#66bb6a", "#ec407a"];

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function StatsView({ expenses, incomes }: StatsViewProps) {
  // By category
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // By status
  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.status] = (map[e.status] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Monthly comparison (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthExpenses = expenses
        .filter(e => { const d = new Date(e.date); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((acc, e) => acc + e.amount, 0);
      const monthIncomes = incomes
        .filter(inc => {
          const d = new Date(inc.date);
          const isSame = d.getMonth() === month && d.getFullYear() === year;
          const isRecurrentPast = inc.type === "Recurrente" && (d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() <= month));
          return isSame || isRecurrentPast;
        })
        .reduce((acc, inc) => acc + inc.amount, 0);
      return { name: MONTHS[month], gastos: monthExpenses, ingresos: monthIncomes, balance: monthIncomes - monthExpenses };
    });
  }, [expenses, incomes]);

  // Top expenses
  const topExpenses = useMemo(() =>
    [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5),
    [expenses]
  );

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalIncomes = incomes.reduce((acc, i) => acc + i.amount, 0);
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const biggestExpense = expenses.reduce((max, e) => e.amount > max ? e.amount : max, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-[13px]">
          <p className="font-semibold text-gray-700 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }}></span>
              {p.name}: <span className="font-bold">${p.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-[13px]">
          <p className="font-semibold text-gray-700">{payload[0].name}</p>
          <p className="text-gray-600">${payload[0].value.toFixed(2)} <span className="text-gray-400">({((payload[0].value / totalExpenses) * 100).toFixed(1)}%)</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f5f6f8]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Gastado"
            value={`$${totalExpenses.toFixed(2)}`}
            subtitle={`${expenses.length} transacciones`}
            icon={<TrendingDown size={20} />}
            color="text-red-500"
            bg="bg-red-50"
          />
          <KpiCard
            title="Total Ingresos"
            value={`$${totalIncomes.toFixed(2)}`}
            subtitle={`${incomes.length} registros`}
            icon={<TrendingUp size={20} />}
            color="text-green-600"
            bg="bg-green-50"
          />
          <KpiCard
            title="Gasto Promedio"
            value={`$${avgExpense.toFixed(2)}`}
            subtitle="por transacción"
            icon={<DollarSign size={20} />}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <KpiCard
            title="Mayor Gasto"
            value={`$${biggestExpense.toFixed(2)}`}
            subtitle="transacción única"
            icon={<AlertCircle size={20} />}
            color="text-orange-500"
            bg="bg-orange-50"
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie by category */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">Gastos por Categoría</h3>
            {byCategory.length === 0 ? <EmptyChart /> : (
              <div className="flex flex-col gap-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {byCategory.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-[13px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }}></span>
                      <span className="text-gray-600 truncate flex-1">{item.name}</span>
                      <span className="font-semibold text-gray-800">${item.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bar by status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">Gastos por Estado de Pago</h3>
            {byStatus.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byStatus} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f6f8" }} />
                  <Bar dataKey="value" name="Monto" radius={[6, 6, 0, 0]}>
                    {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-1">Tendencia Mensual</h3>
          <p className="text-sm text-gray-400 mb-6">Últimos 6 meses — Ingresos vs Gastos</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c875" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00c875" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e2445c" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#e2445c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }} />
              <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#00c875" strokeWidth={2.5} fill="url(#colorIngresos)" dot={{ fill: "#00c875", r: 4 }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#e2445c" strokeWidth={2.5} fill="url(#colorGastos)" dot={{ fill: "#e2445c", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 expenses table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Top 5 Gastos Más Altos</h3>
          {topExpenses.length === 0 ? <EmptyChart /> : (
            <div className="space-y-3">
              {topExpenses.map((expense, i) => {
                const pct = totalExpenses > 0 ? (expense.amount / totalExpenses) * 100 : 0;
                return (
                  <div key={expense.id} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[12px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">{expense.concept}</span>
                        <span className="text-sm font-bold text-gray-900 shrink-0">${expense.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}></div>
                        </div>
                        <span className="text-[12px] text-gray-400 shrink-0">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <span className="text-[12px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{expense.category}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, color, bg }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string, bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`${bg} ${color} p-2.5 rounded-lg shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{title}</p>
        <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
        <p className="text-[12px] text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center text-gray-300 gap-2">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><TrendingDown size={22} /></div>
      <p className="text-sm">No hay datos para mostrar</p>
    </div>
  );
}
