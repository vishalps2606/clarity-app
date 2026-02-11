import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { TaskCard } from '../components/TaskCard';
import { Button } from '../components/Button';
import api from '../api/client';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import CreateTaskForm from '../components/CreateTaskForm';

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal State

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

  return (
    <AppLayout>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Dashboard</h2>
          <p className="text-text-secondary">Overview of current tasks.</p>
        </div>
        <Button 
            className="flex items-center gap-2" 
            onClick={() => setIsModalOpen(true)} // Open Modal
        >
          <Plus size={18} />
          New Task
        </Button>
      </header>

      {/* STATS ROW (Placeholder for Day 23) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border p-6 rounded-lg">
           <h4 className="text-text-secondary text-sm font-mono mb-2">ACTIVE TASKS</h4>
           <p className="text-4xl font-bold text-neon-blue">{tasks.length}</p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-lg">
           <h4 className="text-text-secondary text-sm font-mono mb-2">FOCUS TIME</h4>
           <p className="text-4xl font-bold text-neon-purple">0h</p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-lg">
           <h4 className="text-text-secondary text-sm font-mono mb-2">SLIPPAGE</h4>
           <p className="text-4xl font-bold text-neon-green">0%</p>
        </div>
      </div>

      {/* TASKS GRID */}
      <h3 className="text-xl font-bold text-text-primary mb-4">My Tasks</h3>
      
      {loading ? (
        <div className="text-neon-blue font-mono animate-pulse">Scanning database...</div>
      ) : tasks.length === 0 ? (
        <div className="text-text-muted italic border border-dashed border-border p-8 rounded text-center">
          No active objectives. System idle.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
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