import React, { useState } from 'react';
import { HandCoins } from 'lucide-react';

interface PayoutModalProps {
  user: any;
  onClose: () => void;
  onPayout: (amount: number) => void;
}

export const PayoutModal = ({ user, onClose, onPayout }: PayoutModalProps) => {
  const [amount, setAmount] = useState(user.stats.balance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0 && amount <= user.stats.balance) {
      onPayout(amount);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-amber-100 p-4 border-b border-amber-200">
          <h3 className="text-lg font-bold text-amber-900 flex items-center">
            <HandCoins className="mr-2" /> Выплата зарплаты
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-stone-500 mb-1">Сотрудник</p>
            <p className="font-bold text-stone-800 text-lg">{user.name} <span className="text-sm font-normal text-stone-500">({user.role})</span></p>
          </div>
          
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex justify-between items-center">
            <span className="text-stone-600">Текущий долг:</span>
            <span className="font-bold text-xl text-stone-800">{user.stats.balance} ₽</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">Сумма к выплате (₽)</label>
            <input 
              type="number" 
              max={user.stats.balance}
              min="1"
              required
              className="w-full text-2xl font-bold p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-stone-100 text-stone-700 font-medium rounded-xl hover:bg-stone-200 transition"
            >
              Отмена
            </button>
            <button 
              type="submit"
              disabled={amount <= 0 || amount > user.stats.balance}
              className="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 disabled:opacity-50 transition"
            >
              Подтвердить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
