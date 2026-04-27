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
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
          <h2 className="text-xl font-bold text-blue-900">Añadir Ingreso</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monto ($)</label>
              <input 
                type="number" 
                step="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Concepto</label>
            <input 
              type="text" 
              required
              placeholder="Ej. Salario Quincena..."
              value={formData.source}
              onChange={e => setFormData({...formData, source: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as IncomeType})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="Recurrente">Recurrente</option>
                <option value="Extra">Extra</option>
                <option value="Retiro de ahorro">Retiro de ahorro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detalle (opcional)</label>
            <textarea 
              rows={2}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">Guardar Ingreso</button>
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
          <h2 className="text-xl font-bold text-red-900">Añadir Gasto</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monto ($)</label>
              <input type="number" step="0.01" required placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm tabular-nums" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Concepto</label>
            <input type="text" required placeholder="Ej. Supermercado, Luz..." value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoría</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm bg-white">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {formData.category === "Recurrente" && (
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-blue-600">Meses a generar</label>
                <input type="number" min="1" max="60" value={recurrenceMonths} onChange={e => setRecurrenceMonths(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-blue-50" title="Cantidad de meses a generar (ej. 12)" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PaymentStatus})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm bg-white">
                <option value="Completado">Completado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Pago</label>
              <select value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm bg-white">
                <option value="Pago total">Pago total</option>
                <option value="Pago mínimo">Pago mínimo</option>
                <option value="Pago parcial">Pago parcial</option>
                <option value="Pago extraordinario">Pago extraordinario</option>
                <option value="Ahorro">Ahorro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Forma de Pago</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm bg-white">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detalle (opcional)</label>
            <textarea rows={2} placeholder="Descripción adicional..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm resize-none" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-sm">Guardar Gasto</button>
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
    if (cat === "Recurrente" || cat === "General") return; // Protegidas
    setCategories(categories.filter(c => c !== cat));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Editar Categorías</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Nueva categoría..."
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm"
            />
            <button onClick={handleAdd} className="px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)]"><Plus size={18} /></button>
          </div>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto">
            {categories.map(cat => (
              <li key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded-md border border-gray-100">
                <span className="text-sm font-medium text-gray-700">{cat}</span>
                {cat !== "Recurrente" && cat !== "General" && (
                  <button onClick={() => handleRemove(cat)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Nueva Columna</h2>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de la columna</label>
          <input 
            type="text" 
            autoFocus
            placeholder="Ej. Responsable, Notas..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm mb-4"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-sm">Añadir</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Expense Modal
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Editar Gasto</h2>
          <button onClick={handleCancel} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monto ($)</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm tabular-nums" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Concepto</label>
            <input type="text" required value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoría</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm bg-white">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {formData.category === "Recurrente" && (
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-blue-600">Generar meses adicionales</label>
                <input type="number" min="1" max="60" value={recurrenceMonths} onChange={e => setRecurrenceMonths(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-blue-50" title="Generar más meses a partir de esta fecha" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PaymentStatus})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm bg-white">
                <option value="Completado">Completado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Pago</label>
              <select value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm bg-white">
                <option value="Pago total">Pago total</option>
                <option value="Pago mínimo">Pago mínimo</option>
                <option value="Pago parcial">Pago parcial</option>
                <option value="Pago extraordinario">Pago extraordinario</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Forma de Pago</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm bg-white">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detalle (opcional)</label>
            <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm resize-none" />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-sm">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Incomes List Modal
export function IncomesListModal({ isOpen, onClose, incomes, onUpdate, onDelete }: { isOpen: boolean, onClose: () => void, incomes: Income[], onUpdate: (id: string, updates: Partial<Income>) => void, onDelete: (id: string) => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
          <h2 className="text-xl font-bold text-blue-900">Administrar Ingresos</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {incomes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay ingresos registrados.</p>
          ) : (
            incomes.map(inc => (
              <div key={inc.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <input type="text" value={inc.source} onChange={e => onUpdate(inc.id, { source: e.target.value })} className="font-semibold text-gray-800 text-base sm:text-lg bg-transparent outline-none border-b border-transparent focus:border-blue-400 focus:bg-gray-50 px-1 py-0.5 rounded flex-1 min-w-[120px]" />
                      <select value={inc.type} onChange={e => onUpdate(inc.id, { type: e.target.value as IncomeType })} className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 outline-none cursor-pointer border border-transparent focus:ring-2 focus:ring-blue-400">
                        <option value="Extra">EXTRA</option>
                        <option value="Recurrente">RECURRENTE</option>
                        <option value="Retiro de ahorro">RETIRO DE AHORRO</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 px-1">
                      <input type="date" value={inc.date} onChange={e => onUpdate(inc.id, { date: e.target.value })} className="bg-transparent outline-none focus:text-blue-600 cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 border-t sm:border-0 pt-3 sm:pt-0 border-gray-100 w-full sm:w-auto">
                    <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-400 font-medium mr-1">$</span>
                      <input type="number" step="0.01" value={inc.amount} onChange={e => onUpdate(inc.id, { amount: parseFloat(e.target.value) || 0 })} className="w-24 sm:w-28 font-bold text-gray-800 text-right text-base sm:text-lg bg-transparent outline-none border-b border-transparent focus:border-blue-400 px-1 py-0.5 rounded tabular-nums" />
                    </div>
                    <button onClick={() => onDelete(inc.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Eliminar ingreso"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
