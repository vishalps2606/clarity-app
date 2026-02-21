import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import api from '../api/client';

interface CreateTaskFormProps {
  onSuccess: () => void;
  defaultGoalId?: number;
}

export default function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState('');
  
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/goals').then(res => {
        setGoals(res.data);
        // Auto-select based on default OR first available
        if (defaultGoalId) {
            setGoalId(defaultGoalId.toString());
        } else if (res.data.length > 0) {
            setGoalId(res.data[0].id);
        }
    });
  }, [defaultGoalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        title,
        estimatedMinutes: parseInt(minutes),
        dueDatetime: new Date(dueDate).toISOString()
      };

      if (goalId && !isNaN(parseInt(goalId))) {
        payload.goalId = parseInt(goalId);
      }

      await api.post('/tasks', payload);
      onSuccess(); 
    } catch (err) {
      console.error("Failed to create task", err);
      alert("Failed to initiate objective.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Objective Title"
        placeholder="e.g. Deploy Production Database"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        autoFocus
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Est. Duration (Min)"
          type="number"
          placeholder="60"
          value={minutes}
          onChange={e => setMinutes(e.target.value)}
          required
        />
        
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-neon-blue/80 uppercase tracking-wider">
                Target Goal
            </label>
            <select 
                className="bg-surface border border-border rounded px-4 py-3 text-text-primary focus:outline-none focus:border-neon-blue"
                value={goalId}
                onChange={e => setGoalId(e.target.value)}
            >
                {goals.length === 0 && <option>No Goals Found</option>}
                {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                ))}
            </select>
        </div>
      </div>

      <Input
        label="Deadline"
        type="datetime-local"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        required
      />

      <div className="flex justify-end gap-3 mt-4">
        <Button type="submit" disabled={loading}>
            {loading ? 'Initializing...' : 'Confirm Objective'}
        </Button>
      </div>
    </form>
  );
}