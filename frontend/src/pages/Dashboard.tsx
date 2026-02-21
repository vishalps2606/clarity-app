import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import TaskCard from '../components/TaskCard';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import CreateTaskForm from '../components/CreateTaskForm';
import api from '../api/client';
import { Plus, Sun, CalendarDays } from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Reusable Fetch Function
  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. THE FILTER LOGIC (Today + Overdue Only)
  const todaysTasks = tasks.filter(task => {
    // A. Filter out completed tasks (User wants "What I need to do")
    if (task.status === 'DONE') return false;

    // B. Check Date
    const taskDate = new Date(task.dueDatetime);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    // Return true if due date is before or equal to the end of today
    return taskDate <= today;
  });

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
             {tasks.filter(t => t.status !== 'DONE').length - todaysTasks.length}
           </p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-lg">
           <h4 className="text-text-secondary text-sm font-mono mb-2">COMPLETED</h4>
           <p className="text-4xl font-bold text-neon-green">
             {tasks.filter(t => t.status === 'DONE').length}
           </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <CalendarDays size={20} className="text-neon-purple" />
        Priority Queue (Today)
      </h3>
      
      {loading ? (
        <div className="text-neon-blue font-mono animate-pulse">Scanning database...</div>
      ) : todaysTasks.length === 0 ? (
        <div className="text-text-muted italic border border-dashed border-border p-8 rounded text-center flex flex-col items-center gap-2">
          <Sun size={32} className="opacity-20" />
          <span>No active objectives for today.</span>
          <span className="text-xs">Check "Tasks" tab for future items.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysTasks.map((task) => (
            <TaskCard 
                key={task.id} 
                task={task} 
                onRefresh={fetchTasks} // <--- FIX: This enables auto-refresh on delete!
            />
          ))}
        </div>
      )}

      {/* THE MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="INITIATE NEW OBJECTIVE"
      >
        <CreateTaskForm onSuccess={() => {
            setIsModalOpen(false);
            fetchTasks(); 
        }} />
      </Modal>

    </AppLayout>
  );
}