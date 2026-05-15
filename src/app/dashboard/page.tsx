"use client";

import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  Home, Wallet, PieChart, Settings, Plus, Search, Bell, Menu, 
  ChevronDown, CalendarDays, Calendar as CalIcon, Asterisk, 
  FileText, Hash, CreditCard, Building, AlignLeft, MoreHorizontal,
  ChevronLeft, ChevronRight, Filter, Settings2, PanelLeftClose, PanelLeft,
  Trash2, ArrowUpDown, LogOut, UserPlus
} from "lucide-react";
import { Income, Expense, PaymentStatus } from "@/types/finance";
import { IncomeModal, ExpenseModal, CategoryModal, CustomColumnModal, EditExpenseModal, IncomesListModal } from "@/components/Modals";
import { CalendarView } from "@/components/CalendarView";
import { StatsView } from "@/components/StatsView";
import { BudgetView } from "@/components/BudgetView";
import { CreditCardsView } from "@/components/CreditCardsView";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useCreditCardData } from "@/hooks/useCreditCardData";
import { createClient } from "@/lib/supabase";

const INITIAL_EXPENSES: Expense[] = [
  { id: "1", concept: "Suscripción Netflix", amount: 15.14, date: "2026-04-01", category: "Ocio", user: "Yo", status: "Completado", paymentType: "Pago total", paymentMethod: "Tarjeta" },
  { id: "2", concept: "Supermercado", amount: 86.08, date: "2026-04-16", category: "Alimentación", user: "Yo", status: "Completado", paymentType: "Pago total", paymentMethod: "Efectivo" },
  { id: "3", concept: "Alquiler Mensual", amount: 1828.19, date: "2026-04-24", category: "Servicios", user: "Yo", status: "Pendiente", paymentType: "Pago total", paymentMethod: "Transferencia" },
];

const INITIAL_INCOMES: Income[] = [
  { id: "1", source: "Salario Quincena", amount: 540, date: "2026-04-15", user: "Yo", status: "Completado", type: "Recurrente" },
  { id: "2", source: "Venta Producto", amount: 100, date: "2026-04-20", user: "Yo", status: "Pendiente", type: "Extra" },
];

const DEFAULT_CATEGORIES = ["General", "Recurrente", "Bancos", "Alimentación", "Transporte", "Servicios", "Ocio"];
const DEFAULT_PAYMENT_TYPES = ["Pago mínimo", "Pago total", "Pago parcial", "Pago extraordinario"];
const DEFAULT_PAYMENT_METHODS = ["Efectivo", "Tarjeta", "Transferencia"];
const DEFAULT_STATUSES = ["Completado", "Pendiente", "Atrasado"];

export default function Dashboard() {
  const [filterActive, setFilterActive] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [filterCategory, setFilterCategory] = useState<string>("Todas");
  const [filterPaymentType, setFilterPaymentType] = useState<string>("Todos");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("Todos");

  const {
    loading,
    userId,
    expenses, incomes,
    categories, paymentTypes, paymentMethods, statuses,
    colors, savedFilters, columnWidths,
    addExpense, addExpensesBulk, updateExpense: updateExpenseDb, updateExpenseBulk, deleteExpense,
    addIncome, updateIncome: updateIncomeDb, deleteIncome,
    updateCategories, updatePaymentTypes, updatePaymentMethods, updateStatuses,
    updateColors, updateSavedFilters, updateColumnWidths,
  } = useFinanceData();

  const {
    cards, purchases: ccPurchases,
    addCard, updateCard, deleteCard,
    addPurchase, updatePurchase, deletePurchase, generatePayment,
  } = useCreditCardData(userId, addExpense);

  // Load filters from DB once loaded
  useEffect(() => {
    if (!loading && savedFilters) {
      if (savedFilters.status) setFilterStatus(savedFilters.status);
      if (savedFilters.category) setFilterCategory(savedFilters.category);
      if (savedFilters.paymentType) setFilterPaymentType(savedFilters.paymentType);
      if (savedFilters.paymentMethod) setFilterPaymentMethod(savedFilters.paymentMethod);
    }
  }, [loading, savedFilters]);

  // Save filters to DB when they change
  useEffect(() => {
    if (!loading && userId) {
      updateSavedFilters({
        status: filterStatus,
        category: filterCategory,
        paymentType: filterPaymentType,
        paymentMethod: filterPaymentMethod,
      });
    }
  }, [filterStatus, filterCategory, filterPaymentType, filterPaymentMethod, loading, userId, updateSavedFilters]);

  // Column Resizing Logic
  const [localColumnWidths, setLocalColumnWidths] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (columnWidths && Object.keys(columnWidths).length > 0) {
      setLocalColumnWidths(columnWidths);
    } else {
      // Default widths
      setLocalColumnWidths({
        date: 160,
        status: 160,
        concept: 200,
        amount: 130,
        paymentType: 180,
        paymentMethod: 140,
        category: 130,
        description: 180,
      });
    }
  }, [columnWidths]);

  const handleResize = (id: string, width: number) => {
    setLocalColumnWidths(prev => ({ ...prev, [id]: Math.max(50, width) }));
  };

  const saveResize = (id: string, finalWidth: number) => {
    setLocalColumnWidths(prev => {
      const updated = { ...prev, [id]: Math.max(50, finalWidth) };
      updateColumnWidths(updated);
      return updated;
    });
  };

  const [activeTab, setActiveTab] = useState<string>("resumen");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Modals
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isIncomesListOpen, setIncomesListOpen] = useState(false);

  // Filters & Month
  const [currentDate, setCurrentDate] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [filterCoords, setFilterCoords] = useState({ top: 0, left: 0 });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense | "monto", direction: "asc" | "desc" } | null>(null);
  const [customColumns, setCustomColumns] = useState<{id: string, name: string}[]>([]);

  // Computed data
  let currentMonthExpenses = expenses.filter(e => new Date(e.date + 'T12:00:00').getMonth() === currentDate.getMonth() && new Date(e.date + 'T12:00:00').getFullYear() === currentDate.getFullYear());
  
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
  } else {
    // Default: Sort by date ASC, then original order reverse (since original order is DESC by created_at)
    currentMonthExpenses.reverse().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  // CC card names — expenses with these payment methods don't affect balance
  const ccCardNames = useMemo(() => new Set(cards.map(c => c.name)), [cards]);

  // Payment methods merged with registered CC card names for the dropdown
  const allPaymentMethods = useMemo(() => {
    const merged = [...paymentMethods];
    cards.forEach(c => { if (!merged.includes(c.name)) merged.push(c.name); });
    return merged;
  }, [paymentMethods, cards]);

  // Total Incomes for Current Month (including Recurrent ones that apply this month)
  const totalIncome = currentMonthIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  // Total Expenses for Current Month (CC purchases excluded from balance)
  const projectedExpenses = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = currentMonthExpenses
    .filter(e => e.status === "Completado" && !ccCardNames.has(e.paymentMethod ?? ""))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Accumulated Balance (Disponible Acumulado) up to the selected month
  let accumulatedIncome = 0;
  incomes.forEach(i => {
    const incDate = new Date(i.date);
    if (incDate.getFullYear() > currentDate.getFullYear() ||
       (incDate.getFullYear() === currentDate.getFullYear() && incDate.getMonth() > currentDate.getMonth())) {
       return; // Future income, ignore
    }
    if (i.type === "Recurrente") {
      let monthsCount = (currentDate.getFullYear() - incDate.getFullYear()) * 12 + (currentDate.getMonth() - incDate.getMonth()) + 1;
      accumulatedIncome += i.amount * monthsCount;
    } else {
      accumulatedIncome += i.amount;
    }
  });

  const accumulatedExpenses = expenses.filter(e => {
    if (e.status !== "Completado") return false;
    if (ccCardNames.has(e.paymentMethod ?? "")) return false; // CC purchase — excluded until card is paid
    const expDate = new Date(e.date);
    return expDate.getFullYear() < currentDate.getFullYear() ||
      (expDate.getFullYear() === currentDate.getFullYear() && expDate.getMonth() <= currentDate.getMonth());
  }).reduce((acc, curr) => acc + curr.amount, 0);

  const accumulatedAvailable = accumulatedIncome - accumulatedExpenses;

  // Total Savings (Ahorros)
  const totalAhorros = expenses
    .filter(e => e.status === "Completado" && e.paymentType?.toLowerCase() === "ahorro")
    .reduce((acc, curr) => acc + curr.amount, 0) 
    - incomes
    .filter(i => i.type?.toLowerCase() === "retiro de ahorro")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

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
      let top = rect.bottom + 6;
      let left = rect.left;
      
      if (typeof window !== 'undefined') {
        const spaceBelow = window.innerHeight - top;
        const panelHeight = 350; // Aprox panel height
        
        // Show above if not enough space below
        if (spaceBelow < panelHeight && rect.top > panelHeight) {
          top = rect.top - panelHeight - 6;
        }
        
        // Center horizontally on very small screens, or prevent right overflow
        if (window.innerWidth < 640) {
          left = Math.max(16, (window.innerWidth - 260) / 2);
        } else if (left + 260 > window.innerWidth) {
          left = window.innerWidth - 280;
        }
      }
      setFilterCoords({ top, left });
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
      <IncomesListModal isOpen={isIncomesListOpen} onClose={() => setIncomesListOpen(false)} incomes={incomes} onUpdate={updateIncomeDb} onDelete={deleteIncome} onAdd={addIncome} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} onAdd={(e) => addExpense(e)} onAddBulk={(es) => addExpensesBulk(es)} categories={categories} />
      <EditExpenseModal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} expense={editingExpense} onUpdate={updateExpenseBulk} onAddBulk={addExpensesBulk} categories={categories} />
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
            <NavItem icon={<CreditCard size={18} />} label="Tarjetas de Crédito" active={activeTab === 'tarjetas'} onClick={() => setActiveTab('tarjetas')} collapsed={isSidebarCollapsed} />
          </nav>
        </div>
        
        <div className={`p-4 border-t border-gray-200 cursor-pointer ${isSidebarCollapsed ? 'px-3' : 'px-4'}`} onClick={() => setCategoryModalOpen(true)}>
          <NavItem icon={<Settings2 size={18} />} label="Configurar Categorías" collapsed={isSidebarCollapsed} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="h-[60px] border-b border-gray-200 bg-white flex items-center justify-between px-3 sm:px-6 shrink-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <button className="md:hidden text-gray-500 hover:bg-gray-100 p-1.5 rounded-md shrink-0" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            {isSidebarCollapsed && (
              <button className="hidden md:flex text-gray-500 hover:bg-gray-100 p-1.5 rounded-md transition-colors shrink-0" onClick={() => setSidebarCollapsed(false)} title="Mostrar menú">
                <PanelLeft size={20} />
              </button>
            )}
            <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2 text-gray-800 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition-colors truncate">
              Dashboard Financiero
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all w-64 text-gray-700" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--monday-purple)] to-[var(--monday-blue)] text-white flex items-center justify-center font-bold text-xs shadow-sm select-none">
                <UserPlus size={14} />
              </div>
              <button onClick={handleLogout} title="Cerrar sesión" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f5f6f8]">
          <div className="w-full min-h-full flex flex-col">
            
            <div className="flex items-center gap-2 sm:gap-6 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar shrink-0">
              <Tab label="Resumen" active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} />
              <Tab label="Calendario" active={activeTab === 'calendario'} onClick={() => setActiveTab('calendario')} />
              <Tab label="Estadísticas" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
              <Tab label="Presupuesto" active={activeTab === 'presupuesto'} onClick={() => setActiveTab('presupuesto')} />
              <Tab label="Tarjetas" active={activeTab === 'tarjetas'} onClick={() => setActiveTab('tarjetas')} />
            </div>

            {activeTab === 'calendario' ? (
              <div className="flex-1 min-h-[600px]"><CalendarView incomes={incomes} expenses={expenses} /></div>
            ) : activeTab === 'stats' ? (
              <StatsView expenses={expenses} incomes={incomes} />
            ) : activeTab === 'presupuesto' ? (
              <BudgetView available={accumulatedAvailable} />
            ) : activeTab === 'tarjetas' ? (
              <CreditCardsView
                cards={cards}
                purchases={ccPurchases}
                expenses={expenses}
                categories={categories}
                onAddCard={addCard}
                onUpdateCard={updateCard}
                onDeleteCard={deleteCard}
                onAddPurchase={addPurchase}
                onUpdatePurchase={updatePurchase}
                onDeletePurchase={deletePurchase}
                onGeneratePayment={(cardId, purchaseIds, mainExpenseIds, details) => {
                  generatePayment(cardId, purchaseIds, details);
                  mainExpenseIds.forEach(id => updateExpenseBulk(id, { status: "TC Pagado" }));
                }}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"><ChevronLeft size={18} /></button>
                    <span className="font-semibold text-gray-800 w-36 text-center capitalize">{monthName}</span>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"><ChevronRight size={18} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard title="Ingresos Totales" amount={totalIncome} color="text-[var(--status-done)]" onClick={() => setIncomesListOpen(true)} />
                  <StatCard title="Gastos Totales" amount={totalExpenses} subAmount={`Proyectado: $${formatCurrency(projectedExpenses)}`} color="text-[var(--status-stuck)]" />
                  <StatCard title="Disponible Total" amount={accumulatedAvailable} color="text-[var(--primary)]" isTotal />
                  <StatCard title="Ahorros Totales" amount={totalAhorros} color="text-purple-600" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
                  <div className="px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between bg-white border-b border-gray-100 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ChevronDown size={20} className="text-gray-400 shrink-0" />
                        <span className="truncate">Registro Financiero</span>
                        <span className="text-sm font-normal text-gray-500 ml-1">({currentMonthExpenses.length})</span>
                      </h2>
                      {/* Filter button — portal-based panel */}
                      <div className="flex-shrink-0">
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
                            <CompactFilterSelect label="Forma de pago" options={["Todos", ...allPaymentMethods]} value={filterPaymentMethod} onChange={setFilterPaymentMethod} />
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
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                      <button 
                        onClick={() => setIncomeModalOpen(true)} 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 text-xs sm:text-sm bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-all active:scale-95 border border-blue-100"
                      >
                        <Plus size={14} className="sm:w-4 sm:h-4" />
                        <span>Añadir Ingreso</span>
                      </button>
                      <button 
                        onClick={() => setExpenseModalOpen(true)} 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 text-xs sm:text-sm bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-all active:scale-95 shadow-md"
                      >
                        <Plus size={14} className="sm:w-4 sm:h-4" />
                        <span>Añadir Gasto</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-auto max-h-[60vh] rounded-b-xl border-t border-gray-100">
                    <div className="min-w-max flex flex-col">
                      <div className="flex text-gray-500 text-[13px] border-b border-gray-300 bg-gray-50 sticky top-0 z-20 shadow-sm group/header">
                        <div style={{ width: localColumnWidths.date || 160 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium cursor-pointer hover:bg-gray-100 relative shrink-0">
                          <CalIcon size={14} /> Fecha 
                          <ArrowUpDown size={12} className="opacity-0 group-hover/header:opacity-100 transition-opacity ml-auto" />
                          <ResizeHandle onResize={(w) => handleResize('date', w)} onSave={(w) => saveResize('date', w)} />
                        </div>
                        <div style={{ width: localColumnWidths.status || 160 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium relative shrink-0">
                          <Asterisk size={14} /> Estado
                          <ResizeHandle onResize={(w) => handleResize('status', w)} onSave={(w) => saveResize('status', w)} />
                        </div>
                        <div style={{ width: localColumnWidths.concept || 200 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium relative shrink-0">
                          <FileText size={14} /> Concepto
                          <ResizeHandle onResize={(w) => handleResize('concept', w)} onSave={(w) => saveResize('concept', w)} />
                        </div>
                        <div style={{ width: localColumnWidths.amount || 130 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium cursor-pointer hover:bg-gray-100 relative shrink-0">
                          <Hash size={14} /> Monto 
                          <ArrowUpDown size={12} className="opacity-0 group-hover/header:opacity-100 transition-opacity ml-auto" />
                          <ResizeHandle onResize={(w) => handleResize('amount', w)} onSave={(w) => saveResize('amount', w)} />
                        </div>
                        <div style={{ width: localColumnWidths.paymentType || 180 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium relative shrink-0">
                          <Asterisk size={14} /> Tipo de pago
                          <ResizeHandle onResize={(w) => handleResize('paymentType', w)} onSave={(w) => saveResize('paymentType', w)} />
                        </div>
                        <div style={{ width: localColumnWidths.paymentMethod || 140 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium relative shrink-0">
                          <CreditCard size={14} /> Forma de pago
                          <ResizeHandle onResize={(w) => handleResize('paymentMethod', w)} onSave={(w) => saveResize('paymentMethod', w)} />
                        </div>
                        <div style={{ width: localColumnWidths.category || 130 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium relative shrink-0">
                          <Building size={14} /> Categoría
                          <ResizeHandle onResize={(w) => handleResize('category', w)} onSave={(w) => saveResize('category', w)} />
                        </div>
                        <div style={{ width: localColumnWidths.description || 180 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium relative shrink-0">
                          <AlignLeft size={14} /> Detalle
                          <ResizeHandle onResize={(w) => handleResize('description', w)} onSave={(w) => saveResize('description', w)} />
                        </div>
                        {customColumns.map(col => (
                          <div key={col.id} style={{ width: localColumnWidths[col.id] || 150 }} className="p-2 flex items-center gap-1.5 border-r border-gray-300 font-medium bg-gray-50 relative shrink-0">
                            {col.name}
                            <ResizeHandle onResize={(w) => handleResize(col.id, w)} onSave={(w) => saveResize(col.id, w)} />
                          </div>
                        ))}
                        <div style={{ width: 100 }} className="p-2 flex items-center justify-center font-medium bg-gray-100/50 border-l border-gray-300 shrink-0">
                          <button 
                            onClick={addCustomColumn} 
                            className="p-1.5 hover:bg-gray-200 text-gray-500 rounded transition-colors" 
                            title="Añadir columna"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col bg-white">
                        {currentMonthExpenses.length === 0 && <div className="p-4 text-center text-gray-500 text-sm">No hay gastos registrados.</div>}
                        {currentMonthExpenses.map((item) => {
                          const isCCExpense = ccCardNames.has(item.paymentMethod ?? "");
                          return (
                          <div key={item.id} className={`flex text-[13px] border-b border-gray-300 hover:bg-blue-50/50 transition-colors group relative ${isCCExpense ? 'bg-purple-50/40 text-gray-700' : item.status === 'Pendiente' ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-800'}`}>
                            {/* Row Action Buttons Moved to a real column below */}
                            
                            <div style={{ width: localColumnWidths.date || 160 }} className="border-r border-gray-300 flex items-center font-medium shrink-0">
                              <input 
                                type="date" 
                                value={item.date} 
                                onChange={(e) => updateExpense(item.id, 'date', e.target.value)} 
                                className="w-full h-full px-5 py-2 bg-transparent outline-none focus:bg-white focus:ring-1 ring-blue-400 appearance-none" 
                              />
                            </div>
                            
                            <div style={{ width: localColumnWidths.status || 160 }} className="p-2 border-r border-gray-300 flex items-center overflow-visible shrink-0">
                              <TablePillSelect value={item.status} options={statuses} type="status" onSelect={(v) => updateExpense(item.id, 'status', v)} onAddOption={(v) => updateStatuses([...statuses, v])} onDeleteOption={(v) => updateStatuses(statuses.filter(s => s !== v))} colors={colors} onUpdateColors={updateColors} />
                            </div>
                            
                            <div style={{ width: localColumnWidths.concept || 200 }} className="border-r border-gray-300 flex items-center gap-2 font-medium shrink-0">
                              <input type="text" value={item.concept} onChange={(e) => updateExpense(item.id, 'concept', e.target.value)} className="w-full h-full px-2 py-2 bg-transparent outline-none focus:bg-white focus:ring-1 ring-blue-400 placeholder-gray-300" placeholder="Añadir concepto..." />
                            </div>
                            
                            <div style={{ width: localColumnWidths.amount || 130 }} className="border-r border-gray-300 flex items-center justify-end font-mono font-medium shrink-0">
                              <div className="flex items-center w-full h-full focus-within:bg-white focus-within:ring-1 ring-blue-400 px-2 py-2">
                                <input 
                                  type="number" 
                                  step="0.01"
                                  value={item.amount || ''} 
                                  onChange={(e) => updateExpense(item.id, 'amount', parseFloat(e.target.value) || 0)} 
                                  className="w-full bg-transparent outline-none text-right placeholder-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                  placeholder="0.00" 
                                />
                                <span className="text-gray-400 ml-1">US$</span>
                              </div>
                            </div>
                            
                            <div style={{ width: localColumnWidths.paymentType || 180 }} className="p-2 border-r border-gray-300 flex items-center overflow-visible shrink-0">
                              <TablePillSelect value={item.paymentType || ''} options={paymentTypes} type="paymentType" onSelect={(v) => updateExpense(item.id, 'paymentType', v)} onAddOption={(v) => updatePaymentTypes([...paymentTypes, v])} onDeleteOption={(v) => { if(v.toLowerCase() === 'ahorro' || v.toLowerCase() === 'retiro de ahorro') { alert('Esta opción es obligatoria para el funcionamiento de tus ahorros y no se puede borrar.'); return; } updatePaymentTypes(paymentTypes.filter(s => s !== v)); }} colors={colors} onUpdateColors={updateColors} />
                            </div>
                            
                            <div style={{ width: localColumnWidths.paymentMethod || 140 }} className="p-2 border-r border-gray-300 flex items-center overflow-visible shrink-0">
                              <TablePillSelect value={item.paymentMethod || ''} options={allPaymentMethods} type="paymentMethod" onSelect={(v) => updateExpense(item.id, 'paymentMethod', v)} onAddOption={(v) => updatePaymentMethods([...paymentMethods, v])} onDeleteOption={(v) => updatePaymentMethods(paymentMethods.filter(s => s !== v))} colors={colors} onUpdateColors={updateColors} ccCardNames={ccCardNames} />
                            </div>
                            
                            <div style={{ width: localColumnWidths.category || 130 }} className="p-2 border-r border-gray-300 flex items-center overflow-visible shrink-0">
                              <TablePillSelect value={item.category} options={categories} type="category" onSelect={(v) => updateExpense(item.id, 'category', v)} onAddOption={(v) => updateCategories([...categories, v])} onDeleteOption={(v) => { if(v.toLowerCase() === 'ahorro') { alert('Esta opción es obligatoria para el funcionamiento de tus ahorros y no se puede borrar.'); return; } updateCategories(categories.filter(s => s !== v)); }} colors={colors} onUpdateColors={updateColors} />
                            </div>
                            
                            <div style={{ width: localColumnWidths.description || 180 }} className="border-r border-gray-300 flex items-center shrink-0">
                              <input type="text" value={item.description || ''} onChange={(e) => updateExpense(item.id, 'description', e.target.value)} className="w-full h-full px-2 py-2 bg-transparent outline-none focus:bg-white focus:ring-1 ring-blue-400 placeholder-gray-300" placeholder="Añadir detalle..." />
                            </div>
                            
                            {customColumns.map(col => (
                              <div key={col.id} style={{ width: localColumnWidths[col.id] || 150 }} className="border-r border-gray-300 flex items-center shrink-0">
                                <input type="text" className="w-full h-full px-2 py-2 bg-transparent outline-none focus:bg-white focus:ring-1 ring-blue-400 placeholder-gray-200" placeholder="-" />
                              </div>
                            ))}
                            <div className="w-[100px] flex items-center justify-center gap-2 border-l border-gray-200 px-2 shrink-0 bg-gray-50/30">
                              <button 
                                onClick={() => setEditingExpense(item)} 
                                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95" 
                                title="Editar"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              <button 
                                onClick={() => deleteExpense(item.id)} 
                                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-95" 
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          );
                        })}

                        <div className="flex text-[13px] text-gray-500 bg-gray-50 border-t border-gray-300 font-medium sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                          <div style={{ width: localColumnWidths.date || 160 }} className="p-2 border-r border-gray-300 text-right uppercase tracking-wider text-[11px] flex items-center justify-end shrink-0">SUMA COMPLETADOS</div>
                          <div style={{ width: localColumnWidths.status || 160 }} className="p-2 border-r border-gray-300 shrink-0"></div>
                          <div style={{ width: localColumnWidths.concept || 200 }} className="p-2 border-r border-gray-300 shrink-0"></div>
                          <div style={{ width: localColumnWidths.amount || 130 }} className="p-2 border-r border-gray-300 flex items-center justify-end font-mono font-bold text-gray-800 text-[14px] shrink-0">{formatCurrency(totalExpenses)} US$</div>
                          <div style={{ width: localColumnWidths.paymentType || 180 }} className="p-2 border-r border-gray-300 shrink-0"></div>
                          <div style={{ width: localColumnWidths.paymentMethod || 140 }} className="p-2 border-r border-gray-300 shrink-0"></div>
                          <div style={{ width: localColumnWidths.category || 130 }} className="p-2 border-r border-gray-300 shrink-0"></div>
                          <div style={{ width: localColumnWidths.description || 180 }} className="p-2 border-r border-gray-300 shrink-0"></div>
                          {customColumns.map(col => <div key={col.id} style={{ width: localColumnWidths[col.id] || 150 }} className="p-2 border-r border-gray-300 shrink-0"></div>)}
                          <div className="w-[100px] border-l border-gray-300 shrink-0"></div>
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

function StatCard({ title, amount, color, isTotal, onClick, subAmount }: { title: string, amount: number, color: string, isTotal?: boolean, onClick?: () => void, subAmount?: string }) {
  return (
    <div onClick={onClick} className={`p-5 rounded-xl border shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-center transition-transform hover:-translate-y-0.5 duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${isTotal ? 'bg-blue-50/50 border-blue-200 shadow-blue-100/50' : 'bg-white border-gray-200'}`}>
      <span className="text-gray-500 text-[13px] font-semibold uppercase tracking-wide mb-1.5 flex items-center justify-between">
        {title} {onClick && <Plus size={14} className="text-gray-400" />}
      </span>
      <span className={`text-3xl font-bold tabular-nums tracking-tight ${color}`}>
        ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}
      </span>
      {subAmount && (
        <span className="text-base text-gray-600 mt-1">{subAmount}</span>
      )}
    </div>
  );
}

// ----------------------------------------
// Custom Select for Notion-style Pills (Portal)
// ----------------------------------------
function ResizeHandle({ onResize, onSave }: { onResize: (width: number) => void, onSave: (finalWidth: number) => void }) {
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.pageX;
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;
    const startWidth = parent.getBoundingClientRect().width;
    let currentWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      // Usar requestAnimationFrame para evitar re-renders excesivos
      requestAnimationFrame(() => {
        currentWidth = startWidth + (moveEvent.pageX - startX);
        onResize(currentWidth);
      });
    };

    const onMouseUp = () => {
      onSave(currentWidth);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors z-40 group"
    >
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gray-300 group-hover:bg-blue-400" />
    </div>
  );
}

function TablePillSelect({ value, options, type, onSelect, onAddOption, onDeleteOption, colors, onUpdateColors, ccCardNames }: { value: string, options: string[], type: string, onSelect: (v: string) => void, onAddOption?: (v: string) => void, onDeleteOption?: (v: string) => void, colors?: Record<string, string>, onUpdateColors?: (c: Record<string, string>) => void, ccCardNames?: Set<string> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newOpt, setNewOpt] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, maxHeight: 300 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const dropWidth = rect.width > 220 ? rect.width : 220;
      let top = rect.bottom + 4;
      let maxH = Math.min(spaceBelow, 320);

      if (spaceBelow < 180 && spaceAbove > spaceBelow) {
        // Show above
        maxH = Math.min(spaceAbove, 320);
        top = rect.top - 4 - maxH;
      }

      setCoords({ top, left: rect.left, width: dropWidth, maxHeight: maxH });
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
    const handleScroll = (e: Event) => {
      // Only close if the scroll is outside the dropdown panel
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    };

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

  const NOTION_COLORS: Record<string, { bg: string, text: string }> = {
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
    brown: { bg: 'bg-orange-100', text: 'text-orange-800' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    green: { bg: 'bg-green-50', text: 'text-green-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700' },
    red: { bg: 'bg-red-50', text: 'text-red-700' },
    black: { bg: 'bg-gray-800', text: 'text-white' },
  };

  const getPillClasses = (t: string, v: string) => {
    const base = "px-2.5 py-0.5 rounded-[4px] text-[13px] font-medium inline-flex items-center gap-1.5 select-none w-max max-w-full truncate";
    
    // Check if custom color exists for this specific value
    const customColorKey = `${t}:${v}`;
    const customColor = colors?.[customColorKey];
    
    if (customColor && NOTION_COLORS[customColor]) {
      const c = NOTION_COLORS[customColor];
      return `${base} ${c.bg} ${c.text}`;
    }

    // Default fallbacks
    if (t === "status") {
      if (v === "Completado") return `${base} bg-green-50 text-green-700`;
      if (v === "Pendiente") return `${base} bg-gray-200 text-gray-800`;
      return `${base} bg-gray-100 text-gray-600`;
    }
    if (t === "paymentType") {
      if (v === "Pago total") return `${base} bg-green-50 text-green-700`;
      return `${base} bg-gray-100 text-gray-600`;
    }
    if (t === "category") return `${base} bg-gray-800 text-white`;
    return `${base} bg-gray-100 text-gray-600`;
  };

  const getContrastYIQ = (hexcolor: string) => {
    if (!hexcolor || !hexcolor.startsWith('#')) return '#ffffff';
    const hex = hexcolor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 2), 16) || 0;
    const b = parseInt(hex.substring(4, 2), 16) || 0;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  const getPillStyle = (t: string, v: string) => {
    const customColor = colors?.[`${t}:${v}`];
    if (customColor && !NOTION_COLORS[customColor]) {
      if (customColor.includes('|')) {
        const [bg, text] = customColor.split('|');
        return { backgroundColor: bg, color: text };
      }
      return { backgroundColor: customColor, color: getContrastYIQ(customColor) };
    }
    return {};
  };

  const parseCustomColor = (t: string, v: string) => {
    const raw = colors?.[`${t}:${v}`];
    if (!raw || NOTION_COLORS[raw]) return { bg: "#808080", text: "#ffffff" };
    if (raw.includes('|')) {
      const [bg, text] = raw.split('|');
      return { bg, text };
    }
    return { bg: raw, text: getContrastYIQ(raw) };
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
      <div style={{ maxHeight: coords.maxHeight - 80 }} className="overflow-y-auto overflow-x-hidden space-y-0.5 mb-1.5 scrollbar-thin">
        {options.map(opt => (
          <div 
            key={opt} 
            className="group/item px-2 py-1 hover:bg-[#3f3f3f] rounded cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex-1 flex items-center h-full py-1" onClick={() => { onSelect(opt); setIsOpen(false); }}>
              <span className={getPillClasses(type, opt)} style={getPillStyle(type, opt)}>
                {(type === "status" || type === "paymentType") && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></div>}
                <span className="truncate">{opt}</span>
              </span>
            </div>
            
            {onUpdateColors && (
              <div className="flex opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 items-center gap-1.5 ml-2 bg-[#4f4f4f] px-1.5 py-1 rounded border border-[#5f5f5f] transition-opacity">
                <input 
                  type="color"
                  value={parseCustomColor(type, opt).bg}
                  onChange={(e) => {
                    const text = parseCustomColor(type, opt).text;
                    onUpdateColors({ ...colors, [`${type}:${opt}`]: `${e.target.value}|${text}` });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
                  title="Fondo"
                />
                <input 
                  type="color"
                  value={parseCustomColor(type, opt).text}
                  onChange={(e) => {
                    const bg = parseCustomColor(type, opt).bg;
                    onUpdateColors({ ...colors, [`${type}:${opt}`]: `${bg}|${e.target.value}` });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
                  title="Texto"
                />
                {onDeleteOption && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Seguro que deseas eliminar la opción '${opt}'?`)) {
                        onDeleteOption(opt);
                      }
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Eliminar opción"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
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
          <span className={ccCardNames?.has(value) ? "px-2.5 py-0.5 rounded-[4px] text-[13px] font-medium inline-flex items-center gap-1.5 select-none w-max max-w-full truncate bg-purple-50 text-purple-700 border border-purple-200" : getPillClasses(type, value)} style={ccCardNames?.has(value) ? {} : getPillStyle(type, value)}>
            {ccCardNames?.has(value) ? <CreditCard size={11} className="shrink-0" /> : (type === "status" || type === "paymentType") && <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-80"></div>}
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
