import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import api from '../api/client';
import TaskCard from '../components/TaskCard';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import CreateTaskForm from '../components/CreateTaskForm';
import { ArrowLeft, Plus, Target } from 'lucide-react';

export default function GoalDetail() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGoalData = async () => {
    try {
      // 1. Fetch Goal Info (From full list since we don't have a single goal endpoint)
      const goalsRes = await api.get('/goals');
      const foundGoal = goalsRes.data.find((g: any) => g.id === Number(goalId));
      if (foundGoal) setGoal(foundGoal);

      // 2. Fetch specific tasks for this goal
      const tasksRes = await api.get(`/goals/${goalId}/tasks`);
      setTasks(tasksRes.data);
      
    } catch (err) {
      console.error("Failed to load goal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalData();
  }, [goalId]);

  if (loading) return <AppLayout><div className="text-neon-blue font-mono p-8">Decrypting data...</div></AppLayout>;
  if (!goal) return <AppLayout><div className="text-neon-red font-mono p-8">Target Goal Not Found.</div></AppLayout>;

  return (
    <AppLayout>
      {/* Back Button */}
      <button 
          onClick={() => navigate('/goals')}
          className="flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors"
      >
          <ArrowLeft size={16} /> Strategy Map
      </button>

      <header className="flex justify-between items-start mb-8 pb-8 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-neon-purple" size={24} />
            <h2 className="text-3xl font-bold text-text-primary">{goal.title}</h2>
          </div>
          <div className="flex gap-4 text-xs font-mono mt-2">
            <span className="text-neon-purple border border-neon-purple/30 bg-neon-purple/10 px-2 py-1 rounded">PRIORITY: {goal.priority}</span>
            <span className="text-text-secondary border border-border bg-surface px-2 py-1 rounded">STATUS: {goal.status}</span>
          </div>
        </div>
        <Button 
            className="flex items-center gap-2" 
            onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          Add Objective
        </Button>
      </header>

      {/* Tasks List */}
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-6">Linked Objectives</h3>
        {tasks.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-border rounded-lg text-text-muted">
             No tactical objectives assigned to this strategy yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onRefresh={fetchGoalData} />
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="NEW TACTICAL OBJECTIVE"
      >
        <CreateTaskForm 
            defaultGoalId={Number(goalId)} 
            onSuccess={() => {
                setIsModalOpen(false);
                fetchGoalData(); // Refresh list after creation
            }} 
        />
      </Modal>
    </AppLayout>
  );
}