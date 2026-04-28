import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Income, Expense, PaymentStatus, IncomeType, ExpenseCategory } from "@/types/finance";

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (income: Omit<Income, "id">) => void;
}

export function IncomeModal({ isOpen, onClose, onAdd }: IncomeModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "Extra" as IncomeType,
    source: "",
    amount: "",
    description: "",
    user: "Ambos",
    status: "Completado" as PaymentStatus,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-lg font-semibold text-gray-800">Añadir Ingreso</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Concepto del Ingreso</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Salario, Venta, etc..."
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Monto ($)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</div>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-semibold text-gray-800 tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Clasificación</label>
              <div className="flex gap-2">
                {["Recurrente", "Extra", "Retiro de ahorro"].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, type: t as IncomeType})}
                    className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      formData.type === t 
                        ? 'bg-gray-800 border-gray-800 text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-black text-white rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95"
            >
              Añadir Ingreso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, "id">) => void;
  onAddBulk?: (expenses: Omit<Expense, "id">[]) => void;
  categories: string[];
}

export function ExpenseModal({ isOpen, onClose, onAdd, onAddBulk, categories }: ExpenseModalProps) {
  const [recurrenceMonths, setRecurrenceMonths] = useState(1);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: "General" as ExpenseCategory,
    concept: "",
    amount: "",
    description: "",
    status: "Completado" as PaymentStatus,
    paymentType: "Pago total",
    paymentMethod: "Efectivo",
    user: "Ambos",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category === "Recurrente" && recurrenceMonths > 1) {
      const expensesToCreate = [];
      const baseDate = new Date(formData.date + "T12:00:00");
      for (let i = 0; i < recurrenceMonths; i++) {
        const nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
        const formattedDate = nextDate.toISOString().split('T')[0];
        expensesToCreate.push({ 
          ...formData, 
          amount: parseFloat(formData.amount) || 0,
          date: formattedDate, 
          status: i === 0 ? formData.status : "Pendiente" 
        });
      }
      if (onAddBulk) onAddBulk(expensesToCreate);
      else expensesToCreate.forEach(ex => onAdd(ex));
    } else {
      onAdd({ ...formData, amount: parseFloat(formData.amount) || 0 });
    }
    
    setFormData({
      concept: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      category: categories[0] || "General",
      status: "Pendiente" as PaymentStatus,
      paymentType: "Pago total",
      paymentMethod: "Efectivo",
      user: "Ambos",
      description: ""
    });
    setRecurrenceMonths(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Añadir Gasto</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Monto ($)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-medium">$</div>
                <input type="number" step="0.01" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-semibold text-gray-800 tabular-nums" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Concepto</label>
            <input type="text" required placeholder="Ej. Supermercado, Luz..." value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Categoría</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {formData.category === "Recurrente" && (
              <div className="col-span-2 sm:col-span-1 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Meses a generar</label>
                <input type="number" min="1" max="60" value={recurrenceMonths} onChange={e => setRecurrenceMonths(parseInt(e.target.value) || 1)} className="w-full px-3 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm font-bold text-blue-700 bg-white" />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PaymentStatus})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white">
                <option value="Completado">Completado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tipo de Pago</label>
              <select value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white">
                <option value="Pago total">Pago total</option>
                <option value="Pago mínimo">Pago mínimo</option>
                <option value="Pago parcial">Pago parcial</option>
                <option value="Pago extraordinario">Pago extraordinario</option>
                <option value="Ahorro">Ahorro</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Forma de Pago</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm transition-colors">Cancelar</button>
            <button type="submit" className="flex-[1.5] px-4 py-2.5 bg-gray-800 hover:bg-black text-white rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95">Guardar Gasto</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for managing categories
export function CategoryModal({ isOpen, onClose, categories, setCategories }: { isOpen: boolean, onClose: () => void, categories: string[], setCategories: (cats: string[]) => void }) {
  const [newCat, setNewCat] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      setCategories([...categories, newCat.trim()]);
      setNewCat("");
    }
  };

  const handleRemove = (cat: string) => {
    if (cat === "Recurrente" || cat === "General") return; 
    setCategories(categories.filter(c => c !== cat));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-lg font-semibold text-gray-800">Categorías</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nueva categoría..."
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-gray-400 outline-none text-sm font-medium"
            />
            <button onClick={handleAdd} className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-all active:scale-95"><Plus size={20} /></button>
          </div>
          <ul className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {categories.map(cat => (
              <li key={cat} className="flex justify-between items-center px-3 py-2 bg-gray-50/50 rounded-lg border border-gray-100 group">
                <span className="text-sm font-medium text-gray-700">{cat}</span>
                {cat !== "Recurrente" && cat !== "General" && (
                  <button onClick={() => handleRemove(cat)} className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Modal for adding a custom column
export function CustomColumnModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (name: string) => void }) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-lg font-semibold text-gray-800">Nueva Columna</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nombre de la columna</label>
            <input 
              type="text" 
              autoFocus
              placeholder="Ej. Responsable, Notas..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-gray-400 outline-none text-sm font-medium text-gray-700"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95">Añadir</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditExpenseModal({ isOpen, onClose, expense, onUpdate, onAddBulk, categories }: { isOpen: boolean, onClose: () => void, expense: Expense | null, onUpdate: (id: string, updates: Partial<Expense>) => void, onAddBulk?: (expenses: Omit<Expense, "id">[]) => void, categories: string[] }) {
  const [recurrenceMonths, setRecurrenceMonths] = useState(1);
  const [formData, setFormData] = useState({
    date: "",
    category: "General" as ExpenseCategory,
    concept: "",
    amount: "",
    description: "",
    status: "Completado" as PaymentStatus,
    paymentType: "Pago total",
    paymentMethod: "Efectivo",
  });

  if (!isOpen || !expense) return null;

  if (formData.concept === "" && expense.concept) {
    setFormData({
      date: expense.date,
      category: expense.category,
      concept: expense.concept,
      amount: expense.amount.toString(),
      description: expense.description || "",
      status: expense.status,
      paymentType: expense.paymentType || "Pago total",
      paymentMethod: expense.paymentMethod || "Efectivo",
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(expense.id, {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
    });

    if (formData.category === "Recurrente" && recurrenceMonths > 1 && onAddBulk) {
      const bulkExpenses: Omit<Expense, "id">[] = [];
      const baseDate = new Date(formData.date + 'T12:00:00'); 
      
      for (let i = 1; i < recurrenceMonths; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setMonth(nextDate.getMonth() + i);
        
        bulkExpenses.push({
          concept: formData.concept,
          amount: parseFloat(formData.amount) || 0,
          date: nextDate.toISOString().split('T')[0],
          category: formData.category,
          status: "Pendiente",
          description: formData.description,
          paymentType: formData.paymentType,
          paymentMethod: formData.paymentMethod,
          user: expense.user
        });
      }
      onAddBulk(bulkExpenses);
    }

    setFormData({ date: "", category: "General", concept: "", amount: "", description: "", status: "Completado", paymentType: "Pago total", paymentMethod: "Efectivo" });
    setRecurrenceMonths(1);
    onClose();
  };

  const handleCancel = () => {
    setFormData({ date: "", category: "General", concept: "", amount: "", description: "", status: "Completado", paymentType: "Pago total", paymentMethod: "Efectivo" });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Editar Gasto</h2>
          <button onClick={handleCancel} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Monto ($)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</div>
                <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-semibold text-gray-800 tabular-nums" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Concepto</label>
            <input type="text" required value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Categoría</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {formData.category === "Recurrente" && (
              <div className="col-span-2 sm:col-span-1 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Generar meses adicionales</label>
                <input type="number" min="1" max="60" value={recurrenceMonths} onChange={e => setRecurrenceMonths(parseInt(e.target.value) || 1)} className="w-full px-3 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm font-bold text-blue-700 bg-white" />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PaymentStatus})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white">
                <option value="Completado">Completado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tipo de Pago</label>
              <select value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white">
                <option value="Pago total">Pago total</option>
                <option value="Pago mínimo">Pago mínimo</option>
                <option value="Pago parcial">Pago parcial</option>
                <option value="Pago extraordinario">Pago extraordinario</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Forma de Pago</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium text-gray-700 bg-white">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm transition-colors">Cancelar</button>
            <button type="submit" className="flex-[1.5] px-4 py-2.5 bg-gray-800 hover:bg-black text-white rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Incomes List Modal
export function IncomesListModal({ isOpen, onClose, incomes, onUpdate, onDelete, onAdd }: { isOpen: boolean, onClose: () => void, incomes: Income[], onUpdate: (id: string, updates: Partial<Income>) => void, onDelete: (id: string) => void, onAdd?: (income: Omit<Income, "id">) => void }) {
  if (!isOpen) return null;

  const handleQuickAdd = () => {
    if (onAdd) {
      onAdd({
        source: "Nuevo Ingreso",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: "Extra",
        user: "Ambos",
        status: "Completado"
      });
    }
  };

  const totalIncomes = incomes.reduce((acc, inc) => acc + inc.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Administrar Ingresos</h2>
            <button 
              onClick={handleQuickAdd}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all active:scale-95 shadow-sm"
            >
              <Plus size={14} />
              Añadir
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/30">
          {incomes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm font-medium">No hay ingresos registrados.</p>
            </div>
          ) : (
            incomes.map(inc => (
              <div key={inc.id} className="bg-white border border-gray-100 rounded-lg p-3 hover:border-gray-300 transition-all shadow-sm group">
                <div className="flex items-center gap-4">
                  {/* Concepto */}
                  <div className="flex-[2] min-w-0">
                    <input 
                      type="text" 
                      value={inc.source} 
                      onChange={e => onUpdate(inc.id, { source: e.target.value })} 
                      className="w-full font-semibold text-gray-700 text-sm bg-transparent outline-none focus:bg-gray-50 px-2 py-1.5 rounded transition-all"
                      placeholder="Concepto..."
                    />
                  </div>

                  {/* Tipo (Pill) */}
                  <div className="flex-1">
                    <select 
                      value={inc.type} 
                      onChange={e => onUpdate(inc.id, { type: e.target.value as IncomeType })} 
                      className="w-full px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 outline-none border border-gray-200 focus:border-gray-400 cursor-pointer"
                    >
                      <option value="Extra">Extra</option>
                      <option value="Recurrente">Recurrente</option>
                      <option value="Retiro de ahorro">Retiro de ahorro</option>
                    </select>
                  </div>

                  {/* Fecha */}
                  <div className="flex-1">
                    <input 
                      type="date" 
                      value={inc.date} 
                      onChange={e => onUpdate(inc.id, { date: e.target.value })} 
                      className="w-full bg-transparent outline-none text-[11px] text-gray-400 font-medium focus:text-gray-600 cursor-pointer" 
                    />
                  </div>

                  {/* Monto */}
                  <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center bg-gray-50/50 px-2 py-1 rounded border border-gray-100 focus-within:border-gray-300 focus-within:bg-white transition-all">
                      <span className="text-gray-400 text-xs mr-1">$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={inc.amount} 
                        onChange={e => onUpdate(inc.id, { amount: parseFloat(e.target.value) || 0 })} 
                        className="w-full text-right font-semibold text-gray-700 text-sm bg-transparent outline-none tabular-nums" 
                      />
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => onDelete(inc.id)} 
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" 
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {incomes.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
            <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider">Total Acumulado</span>
            <div className="text-xl font-semibold text-gray-800">
              <span className="text-gray-300 mr-1">$</span>
              {totalIncomes.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
