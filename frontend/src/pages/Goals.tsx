import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import { GoalCard } from '../components/GoalCard';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import CreateGoalForm from '../components/CreateGoalForm';
import api from '../api/client';
import { Plus, Target, Loader2 } from 'lucide-react';

export default function Goals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await api.get('/goals');
      return res.data;
    }
  });

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full text-neon-blue font-mono">
        <Loader2 className="animate-spin mr-2" /> ALIGNING SATELLITES...
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <header className="flex justify-between items-center mb-8 pb-8 border-b border-border">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Strategy Map</h2>
          <p className="text-text-secondary mt-1 font-mono text-sm uppercase">Strategic Objectives</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Goal
        </Button>
      </header>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-border rounded-lg text-center bg-surface/20">
          <Target className="w-12 h-12 text-text-muted mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No Strategy Defined</h3>
          <p className="text-text-secondary mb-6 max-w-md">You are operating tactically. Define a Goal to align your efforts.</p>
          <Button onClick={() => setIsModalOpen(true)}>Create First Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal: any) => (
            <GoalCard 
                key={goal.id} 
                goal={goal} 
                totalTasks={goal.totalTasks} 
                completedTasks={goal.completedTasks} 
                onClick={() => navigate(`/goals/${goal.id}`)} 
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="DEFINE NEW STRATEGY">
        <CreateGoalForm onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['goals'] });
        }} />
      </Modal>
    </AppLayout>
  );
}