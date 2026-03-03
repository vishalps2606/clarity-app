import { useQuery } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import TaskCard from '../components/TaskCard';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import CreateTaskForm from '../components/CreateTaskForm';
import api from '../api/client';
import { Plus, Sun, CalendarDays, Loader2 } from 'lucide-react';
import { isToday, isBefore, startOfDay, endOfDay } from 'date-fns';
import { useState } from 'react';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. USE QUERY: Handles fetching, caching, and loading state automatically
  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data;
    }
  });

  // 2. FILTER LOGIC: Today + Overdue (excluding DONE)
  const today = endOfDay(new Date());
  const todaysTasks = tasks.filter((task: any) => {
    if (task.status === 'DONE') return false;
    if (!task.dueDatetime) return false;
    
    const taskDate = new Date(task.dueDatetime);
    // Include if it's today OR if it's overdue (before today)
    return isToday(taskDate) || isBefore(taskDate, today);
  });

  // 3. STATS CALCULATION
  const activeCount = tasks.filter((t: any) => t.status !== 'DONE').length;
  const completedCount = tasks.filter((t: any) => t.status === 'DONE').length;

  return (
    <AppLayout>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Command Center</h2>
          <div className="flex items-center gap-2 text-text-secondary mt-1">
             <Sun size={16} className="text-neon-blue" />
             <p>Focus for {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <Button 
            className="flex items-center gap-2" 
            onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          New Objective
        </Button>
      </header>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border p-6 rounded-lg">
           <h4 className="text-text-secondary text-sm font-mono mb-2">ACTIONS REQUIRED</h4>
           <p className="text-4xl font-bold text-neon-blue">{todaysTasks.length}</p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-lg">
           <h4 className="text-text-secondary text-sm font-mono mb-2">FUTURE LOG</h4>
           <p className="text-4xl font-bold text-text-muted">
             {activeCount - todaysTasks.length}
           </p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-lg">
           <h4 className="text-text-secondary text-sm font-mono mb-2">COMPLETED</h4>
           <p className="text-4xl font-bold text-neon-green">{completedCount}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <CalendarDays size={20} className="text-neon-purple" />
        Priority Queue (Today)
      </h3>
      
      {isLoading ? (
        <div className="flex items-center gap-3 text-neon-blue font-mono">
            <Loader2 className="animate-spin" size={20} />
            Scanning database...
        </div>
      ) : todaysTasks.length === 0 ? (
        <div className="text-text-muted italic border border-dashed border-border p-8 rounded text-center flex flex-col items-center gap-2">
          <Sun size={32} className="opacity-20" />
          <span>No active objectives for today.</span>
          <span className="text-xs">Check "Tasks" tab for future items.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysTasks.map((task: any) => (
            <TaskCard 
                key={task.id} 
                task={task} 
                onRefresh={refetch}
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="INITIATE NEW OBJECTIVE"
      >
        <CreateTaskForm onSuccess={() => {
            setIsModalOpen(false);
            refetch(); 
        }} />
      </Modal>
    </AppLayout>
  );
}