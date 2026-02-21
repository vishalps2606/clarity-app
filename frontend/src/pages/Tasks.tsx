import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import TaskCard from '../components/TaskCard';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import CreateTaskForm from '../components/CreateTaskForm';
import api from '../api/client';
import { Plus, Search } from 'lucide-react';
import { clsx } from 'clsx';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'DONE'>('ALL');

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

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = 
        filterStatus === 'ALL' ? true :
        filterStatus === 'DONE' ? task.status === 'DONE' :
        task.status !== 'DONE'; // ACTIVE includes READY and IN_PROGRESS
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Task Archive</h2>
          <p className="text-text-secondary">Master list of all objectives.</p>
        </div>
        <Button 
            className="flex items-center gap-2" 
            onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          New Objective
        </Button>
      </header>

      {/* FILTER BAR */}
      <div className="bg-surface border border-border p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-text-muted" size={18} />
            <input 
                type="text" 
                placeholder="Search protocols..." 
                className="w-full bg-void border border-border rounded pl-10 pr-4 py-2 text-text-primary focus:border-neon-blue focus:outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            {['ALL', 'ACTIVE', 'DONE'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={clsx(
                        "px-4 py-2 rounded text-xs font-mono font-bold border transition-all",
                        filterStatus === status 
                            ? "bg-neon-blue/10 text-neon-blue border-neon-blue" 
                            : "bg-void border-border text-text-muted hover:text-text-primary"
                    )}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-neon-blue font-mono animate-pulse">Scanning database...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-text-muted italic border border-dashed border-border p-12 rounded text-center">
          No objectives found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onRefresh={fetchTasks} />
          ))}
        </div>
      )}

      {/* Create Modal */}
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