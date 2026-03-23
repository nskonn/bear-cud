import { useState, useMemo, useRef, useEffect } from 'react';
import { HandCoins } from 'lucide-react';
import { useUsers } from '@/src/entities/user/model/queries';
import { useWorkLogs } from '@/src/entities/work-log/model/queries';
import { usePayouts, useAddPayout } from '@/src/entities/payout/model/queries';
import { isToday, isThisWeek, isThisMonth, getLocalYYYYMMDD, getWeekStart, getWeekRangeStr, MONTH_NAMES, SHORT_MONTH_NAMES } from '@/src/shared/lib/date';
import { PayoutModal } from '@/src/features/payout/ui/PayoutModal';
import { WorkLogDetailsModal } from './WorkLogDetailsModal';

const getGroupedColumns = (filter: 'days' | 'weeks' | 'months', cols: string[]) => {
  const groups: { label: string; colSpan: number; cols: string[] }[] = [];
  
  cols.forEach(col => {
    let label = '';
    if (filter === 'months') {
      label = col.split('-')[0]; // Year
    } else {
      const monthIdx = parseInt(col.split('-')[1], 10) - 1;
      const year = col.split('-')[0];
      label = `${MONTH_NAMES[monthIdx]} ${year}`;
    }
    
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.colSpan += 1;
      lastGroup.cols.push(col);
    } else {
      groups.push({ label, colSpan: 1, cols: [col] });
    }
  });
  
  return groups;
};

export const AdminStats = () => {
  const { data: users = [] } = useUsers();
  const { data: workLogs = [] } = useWorkLogs();
  const { data: payouts = [] } = usePayouts();
  const { mutateAsync: addPayout } = useAddPayout();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedWorkLogDetails, setSelectedWorkLogDetails] = useState<{ user: any, filter: 'days' | 'weeks' | 'months', colKey: string } | null>(null);
  const [tableFilter, setTableFilter] = useState<'days' | 'weeks' | 'months'>('days');
  const [payoutTableFilter, setPayoutTableFilter] = useState<'days' | 'weeks' | 'months'>('days');

  const workScrollRef = useRef<HTMLDivElement>(null);
  const payoutScrollRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const dArr: string[] = [];
    for(let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dArr.push(getLocalYYYYMMDD(d));
    }
    
    const wArr: string[] = [];
    dArr.forEach(d => {
      const w = getWeekStart(d);
      if(!wArr.includes(w)) wArr.push(w);
    });
    
    const mArr: string[] = [];
    dArr.forEach(d => {
      const m = d.substring(0, 7);
      if(!mArr.includes(m)) mArr.push(m);
    });
    
    return { days: dArr, weeks: wArr, months: mArr };
  }, []);

  const workGroupedCols = useMemo(() => getGroupedColumns(tableFilter, columns[tableFilter]), [tableFilter, columns]);
  const payoutGroupedCols = useMemo(() => getGroupedColumns(payoutTableFilter, columns[payoutTableFilter]), [payoutTableFilter, columns]);

  useEffect(() => {
    if (workScrollRef.current) {
      workScrollRef.current.scrollLeft = workScrollRef.current.scrollWidth;
    }
  }, [tableFilter, columns]);

  useEffect(() => {
    if (payoutScrollRef.current) {
      payoutScrollRef.current.scrollLeft = payoutScrollRef.current.scrollWidth;
    }
  }, [payoutTableFilter, columns]);

  const companyStats = useMemo(() => {
    let today = 0, week = 0, month = 0;
    workLogs.forEach(log => {
      if (isToday(log.date)) today += log.totalEarned;
      if (isThisWeek(log.date)) week += log.totalEarned;
      if (isThisMonth(log.date)) month += log.totalEarned;
    });
    return { today, week, month };
  }, [workLogs]);

  const usersStats = useMemo(() => {
    return users.map(user => {
      let totalEarned = 0;
      let totalPaid = 0;
      let periodStats: Record<string, Record<string, number>> = { days: {}, weeks: {}, months: {} };
      let periodPayouts: Record<string, Record<string, number>> = { days: {}, weeks: {}, months: {} };
      
      columns.days.forEach(d => { periodStats.days[d] = 0; periodPayouts.days[d] = 0; });
      columns.weeks.forEach(w => { periodStats.weeks[w] = 0; periodPayouts.weeks[w] = 0; });
      columns.months.forEach(m => { periodStats.months[m] = 0; periodPayouts.months[m] = 0; });
      
      const userLogs = workLogs.filter(l => l.userId === user.id);
      userLogs.forEach(log => {
        totalEarned += log.totalEarned;
        
        const dStr = getLocalYYYYMMDD(log.date);
        const wStr = getWeekStart(log.date);
        const mStr = dStr.substring(0, 7);

        if (periodStats.days[dStr] !== undefined) periodStats.days[dStr] += log.totalEarned;
        if (periodStats.weeks[wStr] !== undefined) periodStats.weeks[wStr] += log.totalEarned;
        if (periodStats.months[mStr] !== undefined) periodStats.months[mStr] += log.totalEarned;
      });

      const userPayouts = payouts.filter(p => p.userId === user.id);
      userPayouts.forEach(payout => {
        totalPaid += payout.amount;

        const dStr = getLocalYYYYMMDD(payout.date);
        const wStr = getWeekStart(payout.date);
        const mStr = dStr.substring(0, 7);

        if (periodPayouts.days[dStr] !== undefined) periodPayouts.days[dStr] += payout.amount;
        if (periodPayouts.weeks[wStr] !== undefined) periodPayouts.weeks[wStr] += payout.amount;
        if (periodPayouts.months[mStr] !== undefined) periodPayouts.months[mStr] += payout.amount;
      });

      const balance = totalEarned - totalPaid;

      return { ...user, stats: { balance, periodStats, periodPayouts } };
    }).sort((a, b) => b.stats.balance - a.stats.balance);
  }, [users, workLogs, payouts, columns]);

  const handlePayout = async (amount: number) => {
    if (selectedUser) {
      await addPayout({ userId: selectedUser.id, amount, date: new Date().toISOString() });
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <section>
        <h2 className="text-xl font-bold text-stone-800 mb-4 px-1">Общая выработка (текущие периоды)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <p className="text-stone-500 text-sm font-medium mb-1">За сегодня</p>
            <p className="text-3xl font-bold text-stone-800">{companyStats.today} ₽</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <p className="text-stone-500 text-sm font-medium mb-1">За эту неделю</p>
            <p className="text-3xl font-bold text-stone-800">{companyStats.week} ₽</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 border-b-4 border-b-amber-500">
            <p className="text-stone-500 text-sm font-medium mb-1">За этот месяц</p>
            <p className="text-3xl font-bold text-stone-800">{companyStats.month} ₽</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1 gap-3">
          <h2 className="text-xl font-bold text-stone-800">История выработки</h2>
          <div className="flex bg-stone-200 p-1 rounded-lg">
            <button onClick={() => setTableFilter('days')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${tableFilter === 'days' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>По дням</button>
            <button onClick={() => setTableFilter('weeks')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${tableFilter === 'weeks' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>По неделям</button>
            <button onClick={() => setTableFilter('months')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${tableFilter === 'months' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>По месяцам</button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto pb-4" ref={workScrollRef} style={{ scrollBehavior: 'smooth' }}>
            <div className="inline-block min-w-full">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th rowSpan={2} className="p-4 font-semibold text-stone-600 sticky left-0 bg-stone-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-bottom">Сотрудник</th>
                    
                    {workGroupedCols.map(group => (
                      <th key={group.label} colSpan={group.colSpan} className="py-2 px-1 font-bold text-stone-700 text-center text-sm border-l border-stone-200 bg-stone-100/50">
                        {group.label}
                      </th>
                    ))}
                    
                    <th rowSpan={2} className="p-4 font-semibold text-stone-600 text-right bg-amber-50 sticky right-[120px] md:static z-10 align-bottom">К выплате</th>
                    <th rowSpan={2} className="p-4 font-semibold text-stone-600 text-center sticky right-0 bg-stone-50 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] md:static md:shadow-none md:z-auto align-bottom">Действие</th>
                  </tr>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    {columns[tableFilter].map(colKey => (
                      <th key={colKey} className={`py-2 px-1 font-semibold text-stone-500 text-center text-xs border-l border-stone-200 ${
                        tableFilter === 'days' ? 'min-w-[45px]' : 
                        tableFilter === 'weeks' ? 'min-w-[90px]' : 'min-w-[100px]'
                      }`}>
                        <div className="flex flex-col items-center justify-center leading-tight">
                          {tableFilter === 'days' && (
                            <span className="text-sm">{colKey.split('-')[2]}</span>
                          )}
                          {tableFilter === 'weeks' && (
                            <span className="text-xs whitespace-nowrap px-1">{getWeekRangeStr(colKey)}</span>
                          )}
                          {tableFilter === 'months' && (
                            <span className="text-sm">{MONTH_NAMES[parseInt(colKey.split('-')[1]) - 1]}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {usersStats.map(u => (
                    <tr key={u.id} className="hover:bg-stone-50 transition group relative">
                      <td className="p-4 sticky left-0 bg-white group-hover:bg-stone-50 z-10 border-r border-stone-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <p className="font-bold text-stone-800 whitespace-nowrap">{u.name}</p>
                        <p className="text-xs text-stone-500">{u.role}</p>
                      </td>
                      
                      {columns[tableFilter].map(colKey => (
                        <td 
                          key={colKey} 
                          className={`text-center text-stone-600 font-medium text-xs border-l border-stone-100 hover:bg-amber-50 transition-colors ${tableFilter === 'days' ? 'p-1' : 'p-2'} ${u.stats.periodStats[tableFilter][colKey] > 0 ? 'cursor-pointer hover:text-amber-700' : ''}`}
                          onClick={() => {
                            if (u.stats.periodStats[tableFilter][colKey] > 0) {
                              setSelectedWorkLogDetails({ user: u, filter: tableFilter, colKey });
                            }
                          }}
                        >
                          {u.stats.periodStats[tableFilter][colKey] > 0 
                            ? <span className="text-stone-800">{u.stats.periodStats[tableFilter][colKey]}</span> 
                            : <span className="text-stone-200">-</span>}
                        </td>
                      ))}

                      <td className="p-4 text-right font-bold text-amber-700 bg-amber-50/30 sticky right-[120px] md:static group-hover:bg-amber-100/50 transition-colors z-10">
                        {u.stats.balance} ₽
                      </td>
                      <td className="p-4 text-center sticky right-0 bg-white group-hover:bg-stone-50 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] md:static md:shadow-none md:bg-transparent md:z-auto">
                        <button 
                          onClick={() => setSelectedUser(u)}
                          disabled={u.stats.balance <= 0}
                          className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-stone-900 transition inline-flex items-center whitespace-nowrap"
                        >
                          <HandCoins size={16} className="mr-1" /> Выплатить
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersStats.length === 0 && (
                    <tr>
                      <td colSpan={columns[tableFilter].length + 3} className="p-8 text-center text-stone-500">Нет зарегистрированных сотрудников</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1 gap-3">
          <h2 className="text-xl font-bold text-stone-800">История выплат</h2>
          <div className="flex bg-stone-200 p-1 rounded-lg">
            <button onClick={() => setPayoutTableFilter('days')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${payoutTableFilter === 'days' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>По дням</button>
            <button onClick={() => setPayoutTableFilter('weeks')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${payoutTableFilter === 'weeks' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>По неделям</button>
            <button onClick={() => setPayoutTableFilter('months')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${payoutTableFilter === 'months' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>По месяцам</button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto pb-4" ref={payoutScrollRef} style={{ scrollBehavior: 'smooth' }}>
            <div className="inline-block min-w-full">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th rowSpan={2} className="p-4 font-semibold text-stone-600 sticky left-0 bg-stone-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-bottom">Сотрудник</th>
                    
                    {payoutGroupedCols.map(group => (
                      <th key={group.label} colSpan={group.colSpan} className="py-2 px-1 font-bold text-stone-700 text-center text-sm border-l border-stone-200 bg-stone-100/50">
                        {group.label}
                      </th>
                    ))}
                    
                    <th rowSpan={2} className="p-4 font-semibold text-stone-600 text-right bg-amber-50 sticky right-0 md:static z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] md:shadow-none md:z-auto align-bottom">Текущий остаток</th>
                  </tr>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    {columns[payoutTableFilter].map(colKey => (
                      <th key={colKey} className={`py-2 px-1 font-semibold text-stone-500 text-center text-xs border-l border-stone-200 ${
                        payoutTableFilter === 'days' ? 'min-w-[45px]' : 
                        payoutTableFilter === 'weeks' ? 'min-w-[90px]' : 'min-w-[100px]'
                      }`}>
                        <div className="flex flex-col items-center justify-center leading-tight">
                          {payoutTableFilter === 'days' && (
                            <span className="text-sm">{colKey.split('-')[2]}</span>
                          )}
                          {payoutTableFilter === 'weeks' && (
                            <span className="text-xs whitespace-nowrap px-1">{getWeekRangeStr(colKey)}</span>
                          )}
                          {payoutTableFilter === 'months' && (
                            <span className="text-sm">{MONTH_NAMES[parseInt(colKey.split('-')[1]) - 1]}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {usersStats.map(u => (
                    <tr key={u.id} className="hover:bg-stone-50 transition group relative">
                      <td className="p-4 sticky left-0 bg-white group-hover:bg-stone-50 z-10 border-r border-stone-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <p className="font-bold text-stone-800 whitespace-nowrap">{u.name}</p>
                        <p className="text-xs text-stone-500">{u.role}</p>
                      </td>
                      
                      {columns[payoutTableFilter].map(colKey => (
                        <td key={colKey} className={`text-center text-stone-600 font-medium text-xs border-l border-stone-100 hover:bg-emerald-50 transition-colors ${payoutTableFilter === 'days' ? 'p-1' : 'p-2'}`}>
                          {u.stats.periodPayouts[payoutTableFilter][colKey] > 0 
                            ? <span className="text-emerald-600 font-bold">{u.stats.periodPayouts[payoutTableFilter][colKey]}</span> 
                            : <span className="text-stone-200">-</span>}
                        </td>
                      ))}

                      <td className="p-4 text-right font-bold text-amber-700 bg-amber-50/30 sticky right-0 md:static group-hover:bg-amber-100/50 transition-colors z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] md:shadow-none">
                        {u.stats.balance} ₽
                      </td>
                    </tr>
                  ))}
                  {usersStats.length === 0 && (
                    <tr>
                      <td colSpan={columns[payoutTableFilter].length + 2} className="p-8 text-center text-stone-500">Нет зарегистрированных сотрудников</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {selectedUser && (
        <PayoutModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onPayout={handlePayout} 
        />
      )}

      {selectedWorkLogDetails && (
        <WorkLogDetailsModal
          user={selectedWorkLogDetails.user}
          filter={selectedWorkLogDetails.filter}
          colKey={selectedWorkLogDetails.colKey}
          workLogs={workLogs}
          onClose={() => setSelectedWorkLogDetails(null)}
        />
      )}
    </div>
  );
};
