import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import api from '../api/client';
import TaskCard from '../components/TaskCard';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import CreateTaskForm from '../components/CreateTaskForm';
import { ArrowLeft, Plus, Target, Loader2 } from 'lucide-react';

export default function GoalDetail() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Tasks
  const { data: tasks = [], isLoading: tasksLoading, refetch } = useQuery({
    queryKey: ['goal-tasks', goalId],
    queryFn: async () => {
      const res = await api.get(`/goals/${goalId}/tasks`);
      return res.data;
    }
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await api.get('/goals');
      return res.data;
    }
  });

  const goal = goals.find((g: any) => g.id === Number(goalId));

  if (tasksLoading || goalsLoading) return (
    <AppLayout>
      <div className="flex items-center gap-3 text-neon-blue font-mono p-8 animate-pulse">
        <Loader2 className="animate-spin" size={20} /> SYNCHRONIZING TACTICAL DATA...
      </div>
    </AppLayout>
  );

  if (!goal) return <AppLayout><div className="text-neon-red font-mono p-8 uppercase">Error: Strategic Target Not Found.</div></AppLayout>;

  return (
    <AppLayout>
      <button onClick={() => navigate('/goals')} className="flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors font-mono text-xs uppercase tracking-widest">
          <ArrowLeft size={14} /> Strategy Map
      </button>

      <header className="flex justify-between items-start mb-8 pb-8 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-neon-purple" size={24} />
            <h2 className="text-3xl font-bold text-text-primary uppercase tracking-tight">{goal.title}</h2>
          </div>
          <div className="flex gap-4 text-[10px] font-mono mt-2">
            <span className="text-neon-purple border border-neon-purple/30 bg-neon-purple/10 px-2 py-1 rounded">PRIORITY: {goal.priority}</span>
            <span className="text-text-secondary border border-border bg-surface px-2 py-1 rounded">STATUS: {goal.status}</span>
          </div>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Objective
        </Button>
      </header>

      <div>
        <h3 className="text-lg font-bold text-text-primary mb-6">Linked Tactical Objectives</h3>
        {tasks.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-border rounded-lg text-text-muted bg-surface/10 italic font-mono text-sm">
             No tactical objectives assigned to this sector.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task: any) => (
              <TaskCard key={task.id} task={task} onRefresh={refetch} />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="DEPLOY NEW OBJECTIVE">
        <CreateTaskForm defaultGoalId={Number(goalId)} onSuccess={() => {
            setIsModalOpen(false);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['goals'] });
        }} />
      </Modal>
    </AppLayout>
  );
}