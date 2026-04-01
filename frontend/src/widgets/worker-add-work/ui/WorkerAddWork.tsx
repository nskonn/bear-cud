import { useState, useMemo } from 'react';
import { ChevronLeft, CheckCircle, Plus, X } from 'lucide-react';
import { useAuth } from '@/src/app/providers/AuthProvider';
import { useCatalog } from '@/src/entities/catalog/model/queries';
import { useAddWorkLog, useUpdateWorkLog } from '@/src/entities/work-log/model/queries';
import { WorkLog } from '@/src/shared/types';

interface WorkerAddWorkProps {
  initialLog: WorkLog | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export const WorkerAddWork = ({ initialLog, onCancel, onSubmit }: WorkerAddWorkProps) => {
  const { currentUser } = useAuth();
  const { data: catalog = [] } = useCatalog();
  const { mutateAsync: addWorkLog } = useAddWorkLog();
  const { mutateAsync: updateWorkLog } = useUpdateWorkLog();

  const availableItems = useMemo(() => catalog.filter(item => item.position === currentUser?.position), [catalog, currentUser]);
  
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    if (initialLog) {
      const initialQty: Record<string, number> = {};
      initialLog.items.forEach(item => {
        initialQty[item.itemId] = item.qty;
      });
      return initialQty;
    }
    return {};
  });

  const [expenses, setExpenses] = useState<{ id: string, name: string, amount: number }[]>(() => {
    if (initialLog && initialLog.expenses) {
      return initialLog.expenses.map(e => ({ id: e.id || Math.random().toString(), name: e.name, amount: e.amount }));
    }
    return [];
  });

  const handleQtyChange = (itemId: string, qty: string) => {
    const val = parseInt(qty) || 0;
    setQuantities(prev => ({ ...prev, [itemId]: val < 0 ? 0 : val }));
  };

  const calculateTotal = () => {
    let totalHours = 0;
    availableItems.forEach(item => {
      const qty = quantities[item.id] || 0;
      totalHours += qty * item.standardHours;
    });
    const hourlyRate = currentUser?.hourlyRate || 0;
    const totalEarnedFromItems = totalHours * hourlyRate;
    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return totalEarnedFromItems + expensesTotal;
  };

  const handleSubmit = async () => {
    const hourlyRate = currentUser?.hourlyRate || 0;
    const logItems = availableItems
      .filter(item => quantities[item.id] > 0)
      .map(item => ({
        itemId: item.id,
        name: item.name,
        qty: quantities[item.id],
        standardHours: item.standardHours,
        total: quantities[item.id] * item.standardHours * hourlyRate
      }));
    
    if (logItems.length > 0 || expenses.length > 0) {
      const totalEarned = calculateTotal();
      const validExpenses = expenses.filter(e => e.name.trim() && e.amount > 0).map(e => ({ name: e.name, amount: e.amount }));
      
      if (initialLog) {
        await updateWorkLog({
          id: initialLog.id,
          log: { 
            date: initialLog.date,
            items: logItems,
            expenses: validExpenses,
            totalEarned 
          }
        });
      } else {
        await addWorkLog({
          userId: currentUser!.id,
          date: new Date().toISOString(),
          items: logItems,
          expenses: validExpenses,
          totalEarned
        });
      }
      onSubmit();
    }
  };

  const total = calculateTotal();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center mb-4">
        <button onClick={onCancel} className="p-2 -ml-2 text-stone-500 hover:text-stone-800">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-stone-800">
          {initialLog ? 'Редактирование записи' : 'Что вы сделали сегодня?'}
        </h2>
      </div>

      <div className="space-y-3">
        {availableItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center">
            <div className="flex-1 pr-4">
              <h4 className="font-medium text-stone-800 text-sm leading-tight mb-1">{item.name}</h4>
              <p className="text-amber-600 text-xs font-bold">{item.standardHours} ч / шт.</p>
            </div>
            <div className="w-24">
              <input 
                type="number" 
                min="0"
                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-center font-bold text-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="0"
                value={quantities[item.id] || ''}
                onChange={(e) => handleQtyChange(item.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-stone-800 mb-3">Дополнительные операции</h3>
        <div className="space-y-3">
          {expenses.map((expense, index) => (
            <div key={expense.id} className="flex gap-2 items-start">
              <input 
                type="text" 
                placeholder="Название (например, уборка)" 
                className="flex-1 bg-white border border-stone-200 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                value={expense.name}
                onChange={(e) => {
                  const newExpenses = [...expenses];
                  newExpenses[index].name = e.target.value;
                  setExpenses(newExpenses);
                }}
              />
              <input 
                type="number" 
                min="0"
                placeholder="Сумма" 
                className="w-24 bg-white border border-stone-200 rounded-lg py-2.5 px-3 text-sm text-center focus:ring-2 focus:ring-amber-500 outline-none"
                value={expense.amount || ''}
                onChange={(e) => {
                  const newExpenses = [...expenses];
                  newExpenses[index].amount = parseInt(e.target.value) || 0;
                  setExpenses(newExpenses);
                }}
              />
              <button 
                onClick={() => setExpenses(expenses.filter((_, i) => i !== index))}
                className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setExpenses([...expenses, { id: Math.random().toString(), name: '', amount: 0 }])}
            className="w-full py-3 border-2 border-dashed border-stone-300 text-stone-500 rounded-xl font-medium hover:border-amber-500 hover:text-amber-600 transition flex items-center justify-center bg-white"
          >
            <Plus size={18} className="mr-1" /> Добавить операцию
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
        <span className="text-amber-900 font-medium">Итого заработано:</span>
        <span className="text-2xl font-bold text-amber-700">{total} ₽</span>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={total === 0}
        className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-amber-700 active:scale-95 transition flex items-center justify-center text-lg disabled:opacity-50 disabled:active:scale-100 mt-4"
      >
        <CheckCircle size={24} className="mr-2" /> {initialLog ? 'Сохранить изменения' : 'Отправить отчет'}
      </button>
    </div>
  );
};
