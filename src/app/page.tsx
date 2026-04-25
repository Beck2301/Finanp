"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Home, Wallet, PieChart, Settings, Plus, Search, Bell, Menu, 
  ChevronDown, CalendarDays, Calendar as CalIcon, Asterisk, 
  FileText, Hash, CreditCard, Building, AlignLeft, MoreHorizontal,
  ChevronLeft, ChevronRight, Filter, Settings2, PanelLeftClose, PanelLeft,
  Trash2, ArrowUpDown, LogOut
} from "lucide-react";
import { Income, Expense, PaymentStatus } from "@/types/finance";
import { IncomeModal, ExpenseModal, CategoryModal, CustomColumnModal } from "@/components/Modals";
import { CalendarView } from "@/components/CalendarView";
import { StatsView } from "@/components/StatsView";
import { BudgetView } from "@/components/BudgetView";
import { useFinanceData } from "@/hooks/useFinanceData";
import { createClient } from "@/lib/supabase";

const INITIAL_EXPENSES: Expense[] = [
  { id: "1", concept: "Credisiman", amount: 15.14, date: "2026-04-01", category: "Bancos", user: "Karen", status: "Completado", paymentType: "Pago mínimo", paymentMethod: "Efectivo", description: "15.59 en Nico" },
  { id: "2", concept: "Tarjeta San Nicolás", amount: 86.08, date: "2026-04-16", category: "Bancos", user: "Karen", status: "Completado", paymentType: "Pago mínimo", paymentMethod: "Efectivo" },
  { id: "3", concept: "BAC Economía", amount: 1828.19, date: "2026-04-24", category: "Bancos", user: "Ambos", status: "Pendiente", paymentType: "Pago total", paymentMethod: "Efectivo" },
];

const INITIAL_INCOMES: Income[] = [
  { id: "1", source: "Salario Quincena", amount: 540, date: "2026-04-15", user: "Bryan", status: "Completado", type: "Recurrente" },
  { id: "2", source: "Bono", amount: 100, date: "2026-04-20", user: "Karen", status: "Pendiente", type: "Extra" },
];

const DEFAULT_CATEGORIES = ["General", "Recurrente", "Bancos", "Alimentación", "Transporte", "Servicios", "Ocio"];
const DEFAULT_PAYMENT_TYPES = ["Pago mínimo", "Pago total", "Pago parcial", "Pago extraordinario"];
const DEFAULT_PAYMENT_METHODS = ["Efectivo", "Tarjeta", "Transferencia"];
const DEFAULT_STATUSES = ["Completado", "Pendiente", "Atrasado"];

export default function Dashboard() {
  const {
    loading,
    expenses, incomes,
    categories, paymentTypes, paymentMethods, statuses,
    addExpense, updateExpense: updateExpenseDb, deleteExpense,
    addIncome,
    updateCategories, updatePaymentTypes, updatePaymentMethods, updateStatuses,
  } = useFinanceData();

  const [activeTab, setActiveTab] = useState<string>("resumen");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Modals
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);

  // Filters & Month
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [filterActive, setFilterActive] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [filterCategory, setFilterCategory] = useState<string>("Todas");
  const [filterPaymentType, setFilterPaymentType] = useState<string>("Todos");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("Todos");
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [filterCoords, setFilterCoords] = useState({ top: 0, left: 0 });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense | "monto", direction: "asc" | "desc" } | null>(null);
  const [customColumns, setCustomColumns] = useState<{id: string, name: string}[]>([]);

  // Computed data
  let currentMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === currentDate.getMonth() && new Date(e.date).getFullYear() === currentDate.getFullYear());
  
  if (filterStatus !== "Todos") currentMonthExpenses = currentMonthExpenses.filter(e => e.status === filterStatus);
  if (filterCategory !== "Todas") currentMonthExpenses = currentMonthExpenses.filter(e => e.category === filterCategory);
  if (filterPaymentType !== "Todos") currentMonthExpenses = currentMonthExpenses.filter(e => e.paymentType === filterPaymentType);
  if (filterPaymentMethod !== "Todos") currentMonthExpenses = currentMonthExpenses.filter(e => e.paymentMethod === filterPaymentMethod);

  const activeFilterCount = [filterStatus !== "Todos", filterCategory !== "Todas", filterPaymentType !== "Todos", filterPaymentMethod !== "Todos"].filter(Boolean).length;

  const clearFilters = () => { setFilterStatus("Todos"); setFilterCategory("Todas"); setFilterPaymentType("Todos"); setFilterPaymentMethod("Todos"); };

  if (sortConfig) {
    currentMonthExpenses.sort((a, b) => {
      if (sortConfig.key === "monto") {
        return sortConfig.direction === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortConfig.key === "date") {
        return sortConfig.direction === "asc" ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
  }
  
  const currentMonthIncomes = incomes.filter(i => {
    const incDate = new Date(i.date);
    const isSameMonthYear = incDate.getMonth() === currentDate.getMonth() && incDate.getFullYear() === currentDate.getFullYear();
    const isRecurrentAndPast = i.type === "Recurrente" && (
      incDate.getFullYear() < currentDate.getFullYear() || 
      (incDate.getFullYear() === currentDate.getFullYear() && incDate.getMonth() <= currentDate.getMonth())
    );
    return isSameMonthYear || isRecurrentAndPast;
  });

  const totalIncome = currentMonthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const available = totalIncome - totalExpenses;

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);

  const handleSort = (key: keyof Expense | "monto") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const updateExpense = (id: string, field: keyof Expense, value: any) => updateExpenseDb(id, field, value);
  const addCustomColumn = () => { setColumnModalOpen(true); };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const toggleFilter = () => {
    if (!filterActive && filterBtnRef.current) {
      const rect = filterBtnRef.current.getBoundingClientRect();
      setFilterCoords({ top: rect.bottom + 6, left: rect.left });
    }
    setFilterActive(f => !f);
  };

  useEffect(() => {
    if (!filterActive) return;
    const handle = (e: MouseEvent) => {
      if (
        filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target as Node)
      ) setFilterActive(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [filterActive]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f5f6f8] text-[var(--foreground)] font-sans">
      <CustomColumnModal isOpen={isColumnModalOpen} onClose={() => setColumnModalOpen(false)} onAdd={(name) => setCustomColumns([...customColumns, { id: `col_${Date.now()}`, name }])} />
      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIncomeModalOpen(false)} onAdd={(i) => addIncome(i)} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} onAdd={(e) => addExpense(e)} categories={categories} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} categories={categories} setCategories={updateCategories} />
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'} ${isSidebarCollapsed ? 'md:w-[68px]' : 'md:w-[260px]'}`}>
        <div className={`p-4 flex items-center justify-between border-b border-gray-200 h-[60px] shrink-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">F</div>
            {!isSidebarCollapsed && <span className="font-bold text-xl tracking-tight text-gray-800 truncate">Finanzas</span>}
          </div>
          <div className="flex gap-1">
            {!isSidebarCollapsed && <button className="hidden md:flex text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors" onClick={() => setSidebarCollapsed(true)} title="Ocultar menú"><PanelLeftClose size={18}/></button>}
            <button className="md:hidden text-gray-500 hover:bg-gray-100 p-1.5 rounded-md" onClick={() => setSidebarOpen(false)}><ChevronDown className="rotate-90" size={20}/></button>
          </div>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden no-scrollbar">
          {!isSidebarCollapsed && <div className="px-4 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Favoritos</div>}
          <nav className={`space-y-[2px] ${isSidebarCollapsed ? 'px-3' : 'px-2'}`} aria-label="Navegación principal">
            <NavItem icon={<Home size={18} />} label="Inicio" active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} collapsed={isSidebarCollapsed} />
            <NavItem icon={<CalendarDays size={18} />} label="Calendario Mensual" active={activeTab === 'calendario'} onClick={() => setActiveTab('calendario')} collapsed={isSidebarCollapsed} />
            <NavItem icon={<PieChart size={18} />} label="Estadísticas" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} collapsed={isSidebarCollapsed} />
            <NavItem icon={<Wallet size={18} />} label="Presupuesto" active={activeTab === 'presupuesto'} onClick={() => setActiveTab('presupuesto')} collapsed={isSidebarCollapsed} />
          </nav>
        </div>
        
        <div className={`p-4 border-t border-gray-200 cursor-pointer ${isSidebarCollapsed ? 'px-3' : 'px-4'}`} onClick={() => setCategoryModalOpen(true)}>
          <NavItem icon={<Settings2 size={18} />} label="Configurar Categorías" collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="h-[60px] border-b border-gray-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-500 hover:bg-gray-100 p-1.5 rounded-md" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            {isSidebarCollapsed && (
              <button className="hidden md:flex text-gray-500 hover:bg-gray-100 p-1.5 rounded-md transition-colors" onClick={() => setSidebarCollapsed(false)} title="Mostrar menú">
                <PanelLeft size={20} />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-800 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition-colors">
              Gastos Compartidos
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all w-64 text-gray-700" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--monday-purple)] to-[var(--monday-blue)] text-white flex items-center justify-center font-bold text-xs shadow-sm select-none">
                K&B
              </div>
              <button onClick={handleLogout} title="Cerrar sesión" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f5f6f8]">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar shrink-0">
              <Tab label="Resumen" active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} />
              <Tab label="Calendario" active={activeTab === 'calendario'} onClick={() => setActiveTab('calendario')} />
              <Tab label="Estadísticas" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
              <Tab label="Presupuesto" active={activeTab === 'presupuesto'} onClick={() => setActiveTab('presupuesto')} />
            </div>

            {activeTab === 'calendario' ? (
              <div className="flex-1 min-h-[600px]"><CalendarView incomes={incomes} expenses={expenses} /></div>
            ) : activeTab === 'stats' ? (
              <StatsView expenses={expenses} incomes={incomes} />
            ) : activeTab === 'presupuesto' ? (
              <BudgetView available={available} />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"><ChevronLeft size={18} /></button>
                    <span className="font-semibold text-gray-800 w-36 text-center capitalize">{monthName}</span>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"><ChevronRight size={18} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <StatCard title="Ingresos Totales" amount={totalIncome} color="text-[var(--status-done)]" onClick={() => setIncomeModalOpen(true)} />
                  <StatCard title="Gastos Totales" amount={totalExpenses} color="text-[var(--status-stuck)]" />
                  <StatCard title="Disponible" amount={available} color="text-[var(--primary)]" isTotal />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
                  <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ChevronDown size={20} className="text-gray-400" />
                        Registro Financiero de Gastos
                        <span className="text-sm font-normal text-gray-500 ml-2">({currentMonthExpenses.length} items)</span>
                      </h2>
                      {/* Filter button — portal-based panel */}
                      <div>
                        <button
                          ref={filterBtnRef}
                          onClick={toggleFilter}
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-medium rounded-md transition-all border ${
                            filterActive || activeFilterCount > 0
                              ? 'bg-[#e8f0fe] text-[#1a56db] border-[#c7d7fb]'
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          <Filter size={13} />
                          Filtrar
                          {activeFilterCount > 0 && (
                            <span className="w-[18px] h-[18px] rounded-full bg-[#1a56db] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                              {activeFilterCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Portal filter panel */}
                      {filterActive && typeof document !== 'undefined' && createPortal(
                        <div
                          ref={filterPanelRef}
                          style={{ top: filterCoords.top, left: filterCoords.left }}
                          className="fixed z-[99999] w-[260px] bg-white rounded-xl border border-gray-200 shadow-[0_8px_40px_rgba(0,0,0,0.14)] overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <span className="text-[13px] font-semibold text-gray-700">Filtros</span>
                            {activeFilterCount > 0 && (
                              <button onClick={clearFilters} className="text-[12px] text-red-500 hover:text-red-700 font-medium transition-colors">
                                Limpiar ({activeFilterCount})
                              </button>
                            )}
                          </div>
                          <div className="p-3 space-y-3">
                            <CompactFilterSelect label="Estado" options={["Todos", ...statuses]} value={filterStatus} onChange={setFilterStatus} />
                            <CompactFilterSelect label="Categoría" options={["Todas", ...categories]} value={filterCategory} onChange={setFilterCategory} />
                            <CompactFilterSelect label="Tipo de pago" options={["Todos", ...paymentTypes]} value={filterPaymentType} onChange={setFilterPaymentType} />
                            <CompactFilterSelect label="Forma de pago" options={["Todos", ...paymentMethods]} value={filterPaymentMethod} onChange={setFilterPaymentMethod} />
                          </div>
                          <div className="px-3 pb-3">
                            <button
                              onClick={() => setFilterActive(false)}
                              className="w-full py-1.5 rounded-lg bg-gray-800 text-white text-[13px] font-semibold hover:bg-gray-700 transition-colors"
                            >
                              Aplicar
                            </button>
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setIncomeModalOpen(true)} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-colors">Añadir Ingreso</button>
                      <button onClick={() => setExpenseModalOpen(true)} className="px-3 py-1.5 text-sm bg-[var(--primary)] text-white font-medium rounded-md hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-1.5 shadow-sm">
                        <Plus size={16} /> Añadir Gasto
                      </button>
                    </div>
                  </div>

                  <div className="overflow-auto max-h-[60vh] rounded-b-xl border-t border-gray-100">
                    <div className="min-w-max flex flex-col">
                      <div className="flex text-gray-500 text-[13px] border-b border-gray-200 bg-gray-50 sticky top-0 z-20 shadow-sm group/header">
                        <div onClick={() => handleSort('date')} className="w-[160px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium cursor-pointer hover:bg-gray-100"><CalIcon size={14} /> Fecha <ArrowUpDown size={12} className="opacity-0 group-hover/header:opacity-100 transition-opacity ml-auto" /></div>
                        <div className="w-[160px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium"><Asterisk size={14} /> Estado</div>
                        <div className="w-[200px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium"><FileText size={14} /> Concepto</div>
                        <div onClick={() => handleSort('monto')} className="w-[130px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium cursor-pointer hover:bg-gray-100"><Hash size={14} /> Monto <ArrowUpDown size={12} className="opacity-0 group-hover/header:opacity-100 transition-opacity ml-auto" /></div>
                        <div className="w-[180px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium"><Asterisk size={14} /> Tipo de pago</div>
                        <div className="w-[140px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium"><CreditCard size={14} /> Forma de pago</div>
                        <div className="w-[130px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium"><Building size={14} /> Categoría</div>
                        <div className="w-[180px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium"><AlignLeft size={14} /> Detalle</div>
                        {customColumns.map(col => (
                          <div key={col.id} className="w-[150px] p-2 flex items-center gap-1.5 border-r border-gray-200 font-medium bg-gray-50">{col.name}</div>
                        ))}
                        <div onClick={addCustomColumn} className="w-[50px] p-2 flex items-center justify-center font-medium cursor-pointer hover:bg-gray-200 text-gray-400" title="Añadir columna"><Plus size={16} /></div>
                      </div>

                      <div className="flex flex-col bg-white">
                        {currentMonthExpenses.length === 0 && <div className="p-4 text-center text-gray-500 text-sm">No hay gastos registrados.</div>}
                        {currentMonthExpenses.map((item) => (
                          <div key={item.id} className={`flex text-[13px] text-gray-700 border-b border-gray-100 hover:bg-blue-50/30 transition-colors group relative ${item.status === 'Completado' ? 'bg-gray-50 opacity-70 grayscale-[20%]' : ''}`}>
                            <div className="absolute right-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 px-2 pointer-events-none z-30">
                              <button onClick={() => deleteExpense(item.id)} className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 pointer-events-auto transition-colors shadow-sm" title="Eliminar fila"><Trash2 size={14} /></button>
                            </div>
                            
                            <div className="w-[160px] border-r border-gray-100 flex items-center font-medium">
                              <input type="date" value={item.date} onChange={(e) => updateExpense(item.id, 'date', e.target.value)} className="w-full h-full px-2 py-2 bg-transparent outline-none focus:bg-white focus:ring-1 ring-blue-400 text-gray-600" />
                            </div>
                            
                            <div className="w-[160px] p-2 border-r border-gray-100 flex items-center overflow-visible">
                              <TablePillSelect value={item.status} options={statuses} type="status" onSelect={(v) => updateExpense(item.id, 'status', v)} onAddOption={(v) => updateStatuses([...statuses, v])} />
                            </div>
                            
                            <div className="w-[200px] border-r border-gray-100 flex items-center gap-2 font-medium text-gray-800">
                              <input type="text" value={item.concept} onChange={(e) => updateExpense(item.id, 'concept', e.target.value)} className="w-full h-full px-2 py-2 bg-transparent outline-none focus:bg-white focus:ring-1 ring-blue-400 placeholder-gray-300" placeholder="Añadir concepto..." />
                            </div>
                            
                            <div className="w-[130px] border-r border-gray-100 flex items-center justify-end font-mono font-medium">
                              <div className="flex items-center w-full h-full focus-within:bg-white focus-within:ring-1 ring-blue-400 px-2 py-2">
                                <input type="number" step="0.01" value={item.amount || ''} onChange={(e) => updateExpense(item.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full bg-transparent outline-none text-right placeholder-gray-300 text-gray-800" placeholder="0.00" />
                                <span className="text-gray-400 ml-1">US$</span>
                              </div>
                            </div>
                            
                            <div className="w-[180px] p-2 border-r border-gray-100 flex items-center overflow-visible">
                              <TablePillSelect value={item.paymentType || ''} options={paymentTypes} type="paymentType" onSelect={(v) => updateExpense(item.id, 'paymentType', v)} onAddOption={(v) => updatePaymentTypes([...paymentTypes, v])} />
                            </div>
                            
                            <div className="w-[140px] p-2 border-r border-gray-100 flex items-center overflow-visible">
                              <TablePillSelect value={item.paymentMethod || ''} options={paymentMethods} type="paymentMethod" onSelect={(v) => updateExpense(item.id, 'paymentMethod', v)} onAddOption={(v) => updatePaymentMethods([...paymentMethods, v])} />
                            </div>
                            
                            <div className="w-[130px] p-2 border-r border-gray-100 flex items-center overflow-visible">
                              <TablePillSelect value={item.category} options={categories} type="category" onSelect={(v) => updateExpense(item.id, 'category', v)} onAddOption={(v) => updateCategories([...categories, v])} />
                            </div>
                            
                            <div className="w-[180px] border-r border-gray-100 flex items-center text-gray-500">
                              <input type="text" value={item.description || ''} onChange={(e) => updateExpense(item.id, 'description', e.target.value)} className="w-full h-full px-2 py-2 bg-transparent outline-none focus:bg-white focus:ring-1 ring-blue-400 placeholder-gray-300" placeholder="Añadir detalle..." />
                            </div>
                            
                            {customColumns.map(col => (
                              <div key={col.id} className="w-[150px] border-r border-gray-100 flex items-center text-gray-500">
                                <input type="text" className="w-full h-full px-2 py-2 bg-transparent outline-none focus:bg-white focus:ring-1 ring-blue-400 placeholder-gray-200" placeholder="-" />
                              </div>
                            ))}
                            <div className="w-[50px] bg-transparent pointer-events-none"></div> {/* Spacer for trash icon */}
                          </div>
                        ))}
                        
                        <div className="flex text-[13px] text-gray-500 bg-gray-50 border-t border-gray-200 font-medium sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                          <div className="w-[160px] p-2 border-r border-gray-200 text-right uppercase tracking-wider text-[11px] flex items-center justify-end">SUMA</div>
                          <div className="w-[160px] p-2 border-r border-gray-200"></div>
                          <div className="w-[200px] p-2 border-r border-gray-200"></div>
                          <div className="w-[130px] p-2 border-r border-gray-200 flex items-center justify-end font-mono font-bold text-gray-800 text-[14px]">{totalExpenses.toFixed(2)} US$</div>
                          <div className="w-[180px] p-2 border-r border-gray-200"></div>
                          <div className="w-[140px] p-2 border-r border-gray-200"></div>
                          <div className="w-[130px] p-2 border-r border-gray-200"></div>
                          <div className="w-[180px] p-2 border-r border-gray-200"></div>
                          {customColumns.map(col => <div key={col.id} className="w-[150px] p-2 border-r border-gray-200"></div>)}
                          <div className="w-[50px]"></div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, collapsed?: boolean }) {
  return (
    <a href="#" onClick={(e) => { if(onClick) { e.preventDefault(); onClick(); } }} className={`flex items-center px-3 py-2.5 rounded-md transition-colors text-[14px] font-[400] ${active ? 'bg-[var(--sidebar-active)] text-blue-700 font-medium' : 'text-[var(--sidebar-text)] hover:bg-gray-100 focus:bg-gray-100'} ${collapsed ? 'justify-center' : 'gap-2.5'}`} title={collapsed ? label : undefined}>
      <span className={active ? 'text-[var(--primary)]' : 'text-gray-500'}>{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </a>
  );
}

function Tab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`pb-3 mb-[-1px] font-medium text-sm border-b-[3px] transition-all whitespace-nowrap focus:outline-none ${active ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}>
      {label}
    </button>
  );
}

function StatCard({ title, amount, color, isTotal, onClick }: { title: string, amount: number, color: string, isTotal?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`p-5 rounded-xl border shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-center transition-transform hover:-translate-y-0.5 duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${isTotal ? 'bg-blue-50/50 border-blue-200 shadow-blue-100/50' : 'bg-white border-gray-200'}`}>
      <span className="text-gray-500 text-[13px] font-semibold uppercase tracking-wide mb-1.5 flex items-center justify-between">
        {title} {onClick && <Plus size={14} className="text-gray-400" />}
      </span>
      <span className={`text-3xl font-bold tabular-nums tracking-tight ${color}`}>${amount.toFixed(2)}</span>
    </div>
  );
}

// ----------------------------------------
// Custom Select for Notion-style Pills (Portal)
// ----------------------------------------
function TablePillSelect({ value, options, onSelect, onAddOption, type }: { value: string, options: string[], onSelect: (v: string) => void, onAddOption: (v: string) => void, type: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newOpt, setNewOpt] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ 
        top: rect.bottom + 4, 
        left: rect.left, 
        width: rect.width > 220 ? rect.width : 220 
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true); // capture scroll anywhere
      window.addEventListener("resize", handleScroll);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  const getPillClasses = (t: string, v: string) => {
    const base = "px-2.5 py-0.5 rounded-[4px] text-[13px] font-medium inline-flex items-center gap-1.5 select-none w-max max-w-full truncate";
    if (t === "status") {
      if (v === "Completado") return `${base} bg-[var(--pill-green-bg)] text-[var(--pill-green-text)]`;
      if (v === "Pendiente") return `${base} bg-[var(--pill-pink-bg)] text-[var(--pill-pink-text)]`;
      return `${base} bg-[var(--pill-gray-bg)] text-[var(--pill-gray-text)]`;
    }
    if (t === "paymentType") {
      if (v === "Pago mínimo") return `${base} bg-[var(--pill-brown-bg)] text-[var(--pill-brown-text)]`;
      if (v === "Pago total") return `${base} bg-[var(--pill-green-bg)] text-[var(--pill-green-text)]`;
      return `${base} bg-[var(--pill-gray-bg)] text-[var(--pill-gray-text)]`;
    }
    if (t === "paymentMethod") return `${base} bg-gray-100 text-gray-600`;
    if (t === "category") return `${base} bg-gray-800 text-white`;
    return base;
  };

  const handleAdd = () => {
    if (newOpt.trim() && !options.includes(newOpt.trim())) {
      onAddOption(newOpt.trim());
      onSelect(newOpt.trim());
      setNewOpt("");
      setIsOpen(false);
    }
  };

  const dropdownMenu = isOpen && typeof document !== 'undefined' ? createPortal(
    <div 
      ref={dropdownRef}
      style={{ top: coords.top, left: coords.left, width: coords.width }}
      className="fixed bg-[#2d2d2d] rounded-lg shadow-2xl border border-[#3f3f3f] z-[99999] p-1.5 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2 py-1 mb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none">Seleccionar opción</div>
      <div className="max-h-48 overflow-y-auto no-scrollbar space-y-0.5 mb-1.5">
        {options.map(opt => (
          <div 
            key={opt} 
            onClick={() => { onSelect(opt); setIsOpen(false); }}
            className="px-2 py-1.5 hover:bg-[#3f3f3f] rounded cursor-pointer flex items-center transition-colors"
          >
            <span className={getPillClasses(type, opt)}>
              {(type === "status" || type === "paymentType") && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></div>}
              <span className="truncate">{opt}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="pt-1.5 border-t border-[#3f3f3f] px-1">
        <input 
          type="text" 
          placeholder="Nueva opción..." 
          value={newOpt}
          onChange={e => setNewOpt(e.target.value)}
          onKeyDown={e => {
            if(e.key === 'Enter') handleAdd();
            e.stopPropagation();
          }}
          className="w-full px-2 py-1.5 bg-[#1e1e1e] border border-[#3f3f3f] rounded text-[#d4d4d4] text-[13px] outline-none focus:border-blue-500 placeholder-gray-500"
        />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div 
        ref={buttonRef} 
        onClick={toggle} 
        className={`w-full h-full cursor-pointer hover:bg-gray-100 p-1.5 rounded-md transition-colors flex items-center ${isOpen ? 'ring-1 ring-blue-400 bg-blue-50/50' : ''}`}
      >
        {value ? (
          <span className={getPillClasses(type, value)}>
            {(type === "status" || type === "paymentType") && <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${value.includes('total') || value === 'Completado' ? 'bg-current opacity-80' : 'bg-current opacity-80'}`}></div>}
            <span className="truncate">{value}</span>
          </span>
        ) : (
          <span className="text-gray-300 text-[13px]">Vacío</span>
        )}
      </div>
      {dropdownMenu}
    </>
  );
}

function CompactFilterSelect({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-[13px] font-medium px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors border ${value === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
