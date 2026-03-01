import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  // 1. USE QUERY: Fetch goals with caching
  const { data: goals = [], isLoading, refetch } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await api.get('/goals');
      return res.data; // Server now sends GoalResponse objects
    }
  });

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full text-neon-blue font-mono">
        DECRYPTING STRATEGIC MAP...
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <header className="flex justify-between items-center mb-8 pb-8 border-b border-border">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Strategy Map</h2>
          <p className="text-text-secondary mt-1 font-mono text-sm">Long-term alignment & objectives</p>
        </div>
        <Button 
            className="flex items-center gap-2" 
            onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          Establish Strategy
        </Button>
      </header>

      {goals.length === 0 ? (
        <div className="text-center p-20 border border-dashed border-border rounded-lg bg-surface/30">
          <Target className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
          <p className="text-text-muted font-mono italic">No active strategies defined for this sector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal: any) => (
            <GoalCard 
                key={goal.id} 
                goal={goal} 
                totalTasks={goal.totalTasks} // Directly from DTO
                completedTasks={goal.completedTasks} // Directly from DTO
                onClick={() => navigate(`/goals/${goal.id}`)} 
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="NEW STRATEGIC DIRECTIVE"
      >
        <CreateGoalForm onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['goals'] }); // Refetch list
        }} />
      </Modal>
    </AppLayout>
  );
}