import React, { useMemo } from 'react';
import { X, Calendar, User as UserIcon } from 'lucide-react';
import { WorkLog, User } from '@/src/shared/types';
import { getLocalYYYYMMDD, getWeekStart, MONTH_NAMES, getWeekRangeStr } from '@/src/shared/lib/date';

interface WorkLogDetailsModalProps {
  user: User;
  filter: 'days' | 'weeks' | 'months';
  colKey: string;
  workLogs: WorkLog[];
  onClose: () => void;
}

export const WorkLogDetailsModal = ({ user, filter, colKey, workLogs, onClose }: WorkLogDetailsModalProps) => {
  const filteredLogs = useMemo(() => {
    return workLogs.filter(log => {
      if (log.userId !== user.id) return false;
      
      const dStr = getLocalYYYYMMDD(log.date);
      if (filter === 'days') return dStr === colKey;
      
      if (filter === 'weeks') {
        const wStr = getWeekStart(log.date);
        return wStr === colKey;
      }
      
      if (filter === 'months') {
        const mStr = dStr.substring(0, 7);
        return mStr === colKey;
      }
      
      return false;
    });
  }, [workLogs, user.id, filter, colKey]);

  const aggregatedItems = useMemo(() => {
    const itemsMap = new Map<string, { name: string; qty: number; standardHours: number; total: number }>();
    
    filteredLogs.forEach(log => {
      log.items.forEach(item => {
        const key = `${item.itemId}-${item.standardHours}`;
        if (itemsMap.has(key)) {
          const existing = itemsMap.get(key)!;
          existing.qty += item.qty;
          existing.total += item.total;
        } else {
          itemsMap.set(key, { ...item });
        }
      });
    });
    
    return Array.from(itemsMap.values()).sort((a, b) => b.total - a.total);
  }, [filteredLogs]);

  const aggregatedExpenses = useMemo(() => {
    const expensesMap = new Map<string, { name: string; amount: number }>();
    
    filteredLogs.forEach(log => {
      log.expenses?.forEach(expense => {
        const key = expense.name.toLowerCase().trim();
        if (expensesMap.has(key)) {
          const existing = expensesMap.get(key)!;
          existing.amount += expense.amount;
        } else {
          expensesMap.set(key, { ...expense });
        }
      });
    });
    
    return Array.from(expensesMap.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredLogs]);

  const totalItemsEarned = aggregatedItems.reduce((sum, item) => sum + item.total, 0);
  const totalExpenses = aggregatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalEarned = totalItemsEarned + totalExpenses;

  const periodLabel = useMemo(() => {
    if (filter === 'days') {
      const parts = colKey.split('-');
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    if (filter === 'weeks') {
      return getWeekRangeStr(colKey);
    }
    if (filter === 'months') {
      const parts = colKey.split('-');
      return `${MONTH_NAMES[parseInt(parts[1]) - 1]} ${parts[0]}`;
    }
    return colKey;
  }, [filter, colKey]);

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="bg-stone-100 p-4 border-b border-stone-200 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-stone-800 flex items-center">
            <Calendar className="mr-2 text-stone-500" size={20} />
            Детализация выработки
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition p-1 rounded-lg hover:bg-stone-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
            <div>
              <p className="text-sm text-stone-500 mb-1 flex items-center"><UserIcon size={14} className="mr-1"/> Сотрудник</p>
              <p className="font-bold text-stone-800 text-lg">
                {user.name}{' '}
                <span className="text-sm font-normal text-stone-500">
                  ({user.role === 'admin' ? 'Администратор' : user.position || 'Сотрудник'})
                </span>
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-stone-500 mb-1">Период</p>
              <p className="font-bold text-stone-800 text-lg">{periodLabel}</p>
            </div>
          </div>

          {aggregatedItems.length === 0 && aggregatedExpenses.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              Нет данных о выработке за этот период
            </div>
          ) : (
            <div className="space-y-6">
              {aggregatedItems.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-stone-700">Выполненные операции</h4>
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                          <th className="p-3 font-semibold text-stone-600">Операция</th>
                          <th className="p-3 font-semibold text-stone-600 text-right">Кол-во</th>
                          <th className="p-3 font-semibold text-stone-600 text-right">Нормочасы</th>
                          <th className="p-3 font-semibold text-stone-600 text-right">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {aggregatedItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-stone-50 transition">
                            <td className="p-3 font-medium text-stone-800">{item.name}</td>
                            <td className="p-3 text-right text-stone-600">{item.qty} шт</td>
                            <td className="p-3 text-right text-stone-600">{item.standardHours} ч</td>
                            <td className="p-3 text-right font-bold text-stone-800">{item.total} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {aggregatedExpenses.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-stone-700">Дополнительные операции</h4>
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                          <th className="p-3 font-semibold text-stone-600">Название операции</th>
                          <th className="p-3 font-semibold text-stone-600 text-right">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {aggregatedExpenses.map((exp, idx) => (
                          <tr key={idx} className="hover:bg-red-50 transition">
                            <td className="p-3 font-medium text-stone-800">{exp.name}</td>
                            <td className="p-3 text-right font-bold text-red-500">+{exp.amount} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <tfoot className="bg-stone-50">
                    <tr className="border-b border-stone-200">
                      <td className="p-3 text-right font-bold text-stone-600">Сумма за операции:</td>
                      <td className="p-3 text-right font-bold text-stone-800 w-32">{totalItemsEarned} ₽</td>
                    </tr>
                    <tr className="border-b border-stone-200">
                      <td className="p-3 text-right font-bold text-red-500">Доп. операции:</td>
                      <td className="p-3 text-right font-bold text-red-500 text-lg w-32">+{totalExpenses} ₽</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-right font-bold text-stone-600">Итого к выплате:</td>
                      <td className="p-3 text-right font-bold text-emerald-600 text-lg w-32">{totalEarned} ₽</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
