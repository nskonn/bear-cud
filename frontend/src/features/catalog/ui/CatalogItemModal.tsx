import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { CatalogItem } from '@/shared/types';
import {RoleSelect} from "@/src/shared/ui/RoleSelect.tsx";

interface CatalogItemModalProps {
  initialItem: CatalogItem | null;
  roles: string[];
  onClose: () => void;
  onSave: (data: Omit<CatalogItem, 'id'>) => void;
  onAddRole: (role: string) => void;
  onEditRole: (oldRole: string, newRole: string) => void;
}

export const CatalogItemModal = ({ initialItem, roles, onClose, onSave, onAddRole, onEditRole }: CatalogItemModalProps) => {
  const [name, setName] = useState(initialItem ? initialItem.name : '');
  const [role, setRole] = useState(initialItem ? initialItem.role : roles[0] || '');
  const [standardHours, setStandardHours] = useState(initialItem ? initialItem.standardHours.toString() : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && Number(standardHours) > 0 && role) {
      onSave({ name: name.trim(), role, standardHours: parseFloat(standardHours) });
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-stone-100 p-4 border-b border-stone-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-stone-800 flex items-center">
            <Settings className="mr-2 text-stone-500" size={20} />
            {initialItem ? 'Редактировать позицию' : 'Новая позиция'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Название позиции</label>
            <input 
              type="text" 
              required 
              className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Например: Сборка стула" 
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-stone-600 mb-1">Кому доступно (Специальность)</label>
            <RoleSelect
                value={role}
                onChange={setRole}
                roles={roles}
                onAddRole={onAddRole}
                onEditRole={onEditRole}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Нормочасы за 1 шт.</label>
            <input 
              type="number" 
              min="0" 
              step="0.1"
              required 
              className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" 
              value={standardHours} 
              onChange={(e) => setStandardHours(e.target.value)} 
              placeholder="0.5" 
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
              disabled={!name.trim() || Number(standardHours) <= 0} 
              className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
