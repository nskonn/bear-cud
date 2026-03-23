import React, { useMemo } from 'react';
import { DollarSign, Calendar, Plus, Pencil } from 'lucide-react';
import { useAuth } from '@/src/app/providers/AuthProvider';
import { useWorkLogs } from '@/src/entities/work-log/model/queries';
import { usePayouts } from '@/src/entities/payout/model/queries';
import { isToday, isThisWeek, isThisMonth } from '@/src/shared/lib/date';
import { WorkLog } from '@/src/shared/types';

interface WorkerDashboardProps {
  onAddClick: () => void;
  onEditClick: (log: WorkLog) => void;
}

export const WorkerDashboard = ({ onAddClick, onEditClick }: WorkerDashboardProps) => {
  const { currentUser } = useAuth();
  const { data: allWorkLogs = [] } = useWorkLogs();
  const { data: allPayouts = [] } = usePayouts();

  const workLogs = useMemo(() => allWorkLogs.filter(l => l.userId === currentUser?.id), [allWorkLogs, currentUser]);
  const payouts = useMemo(() => allPayouts.filter(p => p.userId === currentUser?.id), [allPayouts, currentUser]);

  const stats = useMemo(() => {
    let today = 0, week = 0, month = 0, totalEarned = 0;
    
    workLogs.forEach(log => {
      totalEarned += log.totalEarned;
      if (isToday(log.date)) today += log.totalEarned;
      if (isThisWeek(log.date)) week += log.totalEarned;
      if (isThisMonth(log.date)) month += log.totalEarned;
    });

    const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalEarned - totalPaid;

    return { today, week, month, balance };
  }, [workLogs, payouts]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-amber-200 text-sm font-medium mb-1">Доступно к выплате</p>
          <h2 className="text-4xl font-bold">{stats.balance} ₽</h2>
        </div>
        <DollarSign className="absolute -right-4 -bottom-4 text-amber-500 opacity-30 w-32 h-32" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard title="За день" value={stats.today} icon={<Calendar size={16}/>} />
        <StatCard title="За неделю" value={stats.week} icon={<Calendar size={16}/>} />
        <StatCard title="За месяц" value={stats.month} icon={<Calendar size={16}/>} />
      </div>

      <button 
        onClick={onAddClick}
        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-emerald-700 active:scale-95 transition flex items-center justify-center text-lg"
      >
        <Plus size={24} className="mr-2" /> Добавить выработку
      </button>

      <div>
        <h3 className="text-lg font-bold text-stone-800 mb-3">Недавние записи</h3>
        {workLogs.length === 0 ? (
          <p className="text-stone-500 text-center py-4 bg-white rounded-xl">Вы еще не добавляли работу.</p>
        ) : (
          <div className="space-y-3">
            {workLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(log => (
              <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-stone-800">
                    {new Date(log.date).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})}
                  </p>
                  <p className="text-xs text-stone-500">{log.items.length} позиций</p>
                </div>
                <div className="text-emerald-600 font-bold text-lg mr-3">
                  +{log.totalEarned} ₽
                </div>
                {isToday(log.date) && (
                  <button 
                    onClick={() => onEditClick(log)}
                    className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Редактировать запись"
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 text-center">
      <div className="text-stone-400 flex justify-center mb-1">{icon}</div>
      <p className="text-xs text-stone-500 font-medium mb-1">{title}</p>
      <p className="text-lg font-bold text-stone-800">{value} ₽</p>
    </div>
  );
}
