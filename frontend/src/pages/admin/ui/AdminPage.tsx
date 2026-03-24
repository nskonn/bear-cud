import { useState } from 'react';
import { Header } from '@/src/widgets/header';
import { AdminStats } from '@/src/widgets/admin-stats';
import { AdminCatalog } from '@/src/widgets/admin-catalog';
import { AdminWorkers } from '@/src/widgets/admin-workers';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'catalog' | 'workers'>('stats');

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans pb-10">
      <Header />

      <div className="bg-white border-b border-stone-200 px-4 flex gap-4 shadow-sm relative z-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`py-4 px-2 font-medium border-b-2 transition ${activeTab === 'stats' ? 'border-amber-500 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Статистика и расчеты
        </button>
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`py-4 px-2 font-medium border-b-2 transition ${activeTab === 'catalog' ? 'border-amber-500 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Справочник позиций
        </button>
        <button 
          onClick={() => setActiveTab('workers')}
          className={`py-4 px-2 font-medium border-b-2 transition ${activeTab === 'workers' ? 'border-amber-500 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
        >
          Работники
        </button>
      </div>

      <main className="max-w-[1400px] mx-auto p-4 space-y-8 mt-2">
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'catalog' && <AdminCatalog />}
        {activeTab === 'workers' && <AdminWorkers />}
      </main>
    </div>
  );
};
