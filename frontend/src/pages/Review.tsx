import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import api from '../api/client';
import { ReviewCard } from '../components/ReviewCard';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

export default function Review() {
  const queryClient = useQueryClient();

  // 1. FETCH TASKS REQUIRING REVIEW
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-review'],
    queryFn: async () => {
      const res = await api.get('/tasks/review');
      return res.data;
    }
  });

  // 2. MUTATION FOR REVIEW DECISION
  const reviewMutation = useMutation({
    mutationFn: async ({ taskId, decision, note, nextDate }: any) => {
      return api.post(`/tasks/${taskId}/review`, { 
        decision, 
        note, 
        newDueDatetime: nextDate 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-review'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh dashboard too
    }
  });

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full text-neon-blue font-mono">
        <Loader2 className="animate-spin mr-2" /> SCANNING STALE DIRECTIVES...
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <RefreshCw className="text-neon-purple" size={24} />
          <h2 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">Tactical Review</h2>
        </div>
        <p className="text-text-secondary font-mono text-sm uppercase">Decision point for overdue & interrupted objectives</p>
      </header>

      {tasks.length === 0 ? (
        <div className="bg-surface/30 border border-dashed border-border p-20 rounded-lg text-center">
          <AlertCircle className="mx-auto text-neon-green mb-4 opacity-30" size={48} />
          <p className="text-text-muted font-mono italic">All tactical operations are currently aligned with the timeline.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {tasks.map((task: any) => (
            <ReviewCard 
              key={task.id} 
              task={task} 
              onDecision={(decision: string, note: string, nextDate?: string) => 
                reviewMutation.mutate({ taskId: task.id, decision, note, nextDate })
              }
              isProcessing={reviewMutation.isPending}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}