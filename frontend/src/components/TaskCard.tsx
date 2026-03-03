import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TaskCard({ task }: { task: any }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const completeMutation = useMutation({
    mutationFn: () => api.post(`/tasks/${task.id}/complete`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: any[]) => 
        old?.map(t => t.id === task.id ? { ...t, status: 'DONE' } : t)
      );

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] }); 
    }
  });

  return (
    <div className="bg-surface border border-border p-5 rounded-lg group hover:border-neon-blue transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest bg-neon-blue/5 px-2 py-1 rounded">
          {task.goalTitle}
        </span>
        <button 
          onClick={() => completeMutation.mutate()}
          className="text-text-muted hover:text-neon-green transition-colors"
        >
          <CheckCircle size={20} />
        </button>
      </div>

      <h4 className="font-bold text-text-primary mb-1">{task.title}</h4>
      <p className="text-xs text-text-secondary font-mono flex items-center gap-1.5 mb-4">
        <Clock size={12} /> {task.estimatedMinutes}M ALLOCATED
      </p>

      <div className="flex gap-2">
        <button 
          onClick={() => navigate(`/focus/${task.id}`)}
          className="flex-1 bg-void border border-neon-blue/30 text-neon-blue text-[10px] font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-neon-blue/10 transition-all"
        >
          <Zap size={12} fill="currentColor" /> ENTER FOCUS
        </button>
      </div>
    </div>
  );
}