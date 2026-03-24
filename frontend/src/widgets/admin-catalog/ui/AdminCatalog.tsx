import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { useCatalog, useAddCatalogItem, useUpdateCatalogItem } from '@/src/entities/catalog/model/queries';
import { useRoles, useAddRole, useUpdateRole } from '@/src/entities/role/model/queries';
import { CatalogItemModal } from '@/src/features/catalog/ui/CatalogItemModal';
import { CatalogItem } from '@/src/shared/types';

export const AdminCatalog = () => {
  const { data: catalog = [] } = useCatalog();
  const { data: roles = [] } = useRoles();
  const { mutateAsync: addCatalogItem } = useAddCatalogItem();
  const { mutateAsync: updateCatalogItem } = useUpdateCatalogItem();
  const { mutateAsync: addRole } = useAddRole();
  const { mutateAsync: updateRole } = useUpdateRole();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  const openAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <section className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-bold text-stone-800">Рабочие позиции</h2>
        <button 
          onClick={openAdd} 
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 active:scale-95 transition flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" /> Добавить
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 font-semibold text-stone-600">Название</th>
                <th className="p-4 font-semibold text-stone-600">Должность</th>
                <th className="p-4 font-semibold text-stone-600 text-right">Нормочасы</th>
                <th className="p-4 font-semibold text-stone-600 text-center w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {catalog.map(item => (
                <tr key={item.id} className="hover:bg-stone-50 transition">
                  <td className="p-4 font-medium text-stone-800">{item.name}</td>
                  <td className="p-4 text-stone-600">
                    <span className="bg-stone-100 border border-stone-200 px-2 py-1 rounded-md text-xs font-medium">
                      {item.role}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-amber-700 whitespace-nowrap">{item.standardHours} ч</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => openEdit(item)} 
                      className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" 
                      title="Редактировать"
                    >
                      <Pencil size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {catalog.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-500">Справочник пуст</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CatalogItemModal 
          initialItem={editingItem} 
          roles={roles}
          onClose={() => setIsModalOpen(false)} 
          onSave={async (data) => {
            if (editingItem) await updateCatalogItem({ id: editingItem.id, item: data });
            else await addCatalogItem(data);
            setIsModalOpen(false);
          }} 
          onAddRole={addRole}
          onEditRole={(oldRole, newRole) => updateRole({ oldRole, newRole })}
        />
      )}
    </section>
  );
};
