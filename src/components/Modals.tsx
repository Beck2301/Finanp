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
    status: "Recibido" as PaymentStatus,
    user: "Ambos",
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
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as PaymentStatus})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="Completado">Completado</option>
                <option value="Pendiente">Pendiente</option>
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
  categories: string[];
}

export function ExpenseModal({ isOpen, onClose, onAdd, categories }: ExpenseModalProps) {
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
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
    });
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
