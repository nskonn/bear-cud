import React, { useState } from 'react';
import { Settings, ChevronLeft, Plus, CheckCircle, Pencil } from 'lucide-react';
import { CatalogItem } from '@/src/shared/types';

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

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editRoleValue, setEditRoleValue] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [addRoleValue, setAddRoleValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingRole || editingRole) return; 
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
            <div 
              className="w-full px-4 py-2 border border-stone-300 rounded-xl bg-white flex justify-between items-center cursor-pointer hover:border-amber-500 transition"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            >
              <span className="truncate pr-2">{role || 'Выберите специальность'}</span>
              <ChevronLeft className={`transform transition-transform text-stone-400 shrink-0 ${isRoleDropdownOpen ? '-rotate-90' : 'rotate-180'}`} size={16} />
            </div>

            {isRoleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => {
                  setIsRoleDropdownOpen(false);
                  setIsAddingRole(false);
                  setEditingRole(null);
                }}></div>
                <div className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-64">
                  <div className="overflow-y-auto flex-1 p-1">
                    {roles.map(r => (
                      <div key={r} className="flex items-center justify-between px-3 py-2 hover:bg-stone-50 rounded-lg group transition-colors">
                        {editingRole === r ? (
                          <div className="flex w-full gap-2 items-center" onClick={e => e.stopPropagation()}>
                            <input 
                              autoFocus
                              className="flex-1 px-2 py-1 border border-amber-300 rounded-md focus:outline-none focus:border-amber-500 text-sm"
                              value={editRoleValue}
                              onChange={e => setEditRoleValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  onEditRole(r, editRoleValue);
                                  if(role === r) setRole(editRoleValue.trim() || role);
                                  setEditingRole(null);
                                }
                              }}
                            />
                            <button type="button" onClick={(e) => {
                              e.stopPropagation();
                              onEditRole(r, editRoleValue);
                              if(role === r) setRole(editRoleValue.trim() || role);
                              setEditingRole(null);
                            }} className="text-emerald-600 p-1 hover:bg-emerald-100 rounded-md transition"><CheckCircle size={18}/></button>
                          </div>
                        ) : (
                          <>
                            <span 
                              className="flex-1 cursor-pointer truncate text-sm font-medium text-stone-700" 
                              onClick={() => { setRole(r); setIsRoleDropdownOpen(false); }}
                            >
                              {r}
                            </span>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRole(r);
                                setEditRoleValue(r);
                                setIsAddingRole(false);
                              }}
                              className="text-stone-400 hover:text-amber-600 p-1 md:opacity-0 group-hover:opacity-100 transition"
                            >
                              <Pencil size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-stone-100 p-2 bg-stone-50">
                    {isAddingRole ? (
                      <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                        <input 
                          autoFocus
                          placeholder="Название..."
                          className="flex-1 px-2 py-1.5 border border-amber-300 rounded-md focus:outline-none focus:border-amber-500 text-sm"
                          value={addRoleValue}
                          onChange={e => setAddRoleValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if(addRoleValue.trim()) {
                                onAddRole(addRoleValue);
                                setRole(addRoleValue.trim());
                                setIsAddingRole(false);
                                setAddRoleValue('');
                                setIsRoleDropdownOpen(false);
                              }
                            }
                          }}
                        />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if(addRoleValue.trim()) {
                              onAddRole(addRoleValue);
                              setRole(addRoleValue.trim());
                              setIsAddingRole(false);
                              setAddRoleValue('');
                              setIsRoleDropdownOpen(false);
                            }
                          }} 
                          className="text-emerald-600 p-1 hover:bg-emerald-100 rounded-md transition"
                        >
                          <CheckCircle size={18}/>
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingRole(true);
                          setEditingRole(null);
                          setAddRoleValue('');
                        }}
                        className="w-full py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-100 rounded-lg transition flex items-center justify-center"
                      >
                        <Plus size={16} className="mr-1" /> Создать специальность
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
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
