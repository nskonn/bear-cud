import { useState } from 'react';
import { WorkerDashboard } from '@/src/widgets/worker-dashboard';
import { WorkerAddWork } from '@/src/widgets/worker-add-work';
import { Header } from '@/src/widgets/header';
import { WorkLog } from '@/src/shared/types';

export const WorkerPage = () => {
  const [view, setView] = useState<'dashboard' | 'add_work'>('dashboard');
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans pb-20">
      <Header />
      <main className="max-w-md mx-auto p-4">
        {view === 'dashboard' && (
          <WorkerDashboard 
            onAddClick={() => {
              setEditingLog(null);
              setView('add_work');
            }} 
            onEditClick={(log) => {
              setEditingLog(log);
              setView('add_work');
            }}
          />
        )}
        {view === 'add_work' && (
          <WorkerAddWork 
            initialLog={editingLog}
            onCancel={() => {
              setEditingLog(null);
              setView('dashboard');
            }}
            onSubmit={() => {
              setEditingLog(null);
              setView('dashboard');
            }}
          />
        )}
      </main>
    </div>
  );
};
