import { useState } from 'react';
import { useUsers, useAddUser, useUpdateUser, useDeleteUser } from '@/src/entities/user/model/queries';
import { useRoles } from '@/src/entities/role/model/queries';
import { User } from '@/src/shared/types';
import { Plus, Edit2, Trash2, Lock, Unlock, Save, X } from 'lucide-react';

export const AdminWorkers = () => {
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const { mutateAsync: addUser } = useAddUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm(user);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.role) return;

    const payload = {
      ...editForm,
      login: editForm.login?.trim() || null,
      password: editForm.password?.trim() || null,
      hourlyRate: editForm.hourlyRate ? Number(editForm.hourlyRate) : null,
    };

    try {
      if (isAdding) {
        await addUser(payload as Omit<User, 'id'>);
        setIsAdding(false);
      } else if (editingId) {
        await updateUser({ id: editingId, ...payload });
        setEditingId(null);
      }
      setEditForm({});
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка сохранения');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteUser(deletingId);
      setDeletingId(null);
    }
  };

  const handleToggleBlock = async (user: User) => {
    await updateUser({ id: user.id, isBlocked: !user.isBlocked });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-stone-500">Загрузка...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50/50">
        <h2 className="text-xl font-bold text-stone-800">Работники</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setEditForm({ name: '', role: roles[0] || '', login: '', password: '', isBlocked: false, hourlyRate: 0 });
          }}
          disabled={isAdding}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition disabled:opacity-50"
        >
          <Plus size={18} className="mr-2" /> Добавить работника
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm">
              <th className="p-4 font-medium">ФИО</th>
              <th className="p-4 font-medium">Должность</th>
              <th className="p-4 font-medium">Логин</th>
              <th className="p-4 font-medium">Пароль</th>
              <th className="p-4 font-medium">Стоимость нормочаса</th>
              <th className="p-4 font-medium">Статус</th>
              <th className="p-4 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isAdding && (
              <tr className="bg-amber-50/30">
                <td className="p-4">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Иванов Иван"
                  />
                </td>
                <td className="p-4">
                  <select
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={editForm.login || ''}
                    onChange={(e) => setEditForm({ ...editForm, login: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Логин"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={editForm.password || ''}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Пароль"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    value={editForm.hourlyRate || ''}
                    onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="0"
                    min="0"
                  />
                </td>
                <td className="p-4 text-stone-500 text-sm">Новый</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Сохранить">
                    <Save size={18} />
                  </button>
                  <button onClick={handleCancel} className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg transition" title="Отмена">
                    <X size={18} />
                  </button>
                </td>
              </tr>
            )}

            {users.map((user) => (
              <tr key={user.id} className={`hover:bg-stone-50 transition ${user.isBlocked ? 'opacity-60 bg-stone-100' : ''}`}>
                {editingId === user.id ? (
                  <>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                          <span className="px-2.5 py-1 bg-stone-800 text-white rounded-md text-sm border border-stone-700">
                          Администратор
                        </span>
                      ) : (
                      <select
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                      >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      )}
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editForm.login || ''}
                        onChange={(e) => setEditForm({ ...editForm, login: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editForm.password || ''}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={editForm.hourlyRate || ''}
                        onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) })}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        min="0"
                      />
                    </td>
                    <td className="p-4 text-stone-500 text-sm">{user.isBlocked ? 'Заблокирован' : 'Активен'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Сохранить">
                        <Save size={18} />
                      </button>
                      <button onClick={handleCancel} className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg transition" title="Отмена">
                        <X size={18} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-medium text-stone-800">{user.name}</td>
                    <td className="p-4 text-stone-600">
                      {user.role === 'admin' ? (
                          <span className="px-2.5 py-1 bg-stone-800 text-white rounded-md text-sm border border-stone-700">
                          Администратор
                        </span>
                      ) : (
                      <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md text-sm border border-stone-200">
                        {user.role}
                      </span>
                      )}
                    </td>
                    <td className="p-4 text-stone-600">{user.login || <span className="text-stone-400 italic">Нет</span>}</td>
                    <td className="p-4 text-stone-600">{user.password || <span className="text-stone-400 italic">Нет</span>}</td>
                    <td className="p-4 text-stone-600 font-medium">{user.hourlyRate || 0} ₽</td>
                    <td className="p-4">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Заблокирован
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Активен
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => handleToggleBlock(user)}
                        className={`p-2 rounded-lg transition ${user.isBlocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}
                        title={user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                      >
                        {user.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Редактировать"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {users.length === 0 && !isAdding && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-500">
                  Нет добавленных работников
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-stone-800 mb-2">Удаление работника</h3>
            <p className="text-stone-600 mb-6">
              Вы уверены, что хотите удалить этого работника? Это действие нельзя отменить.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
