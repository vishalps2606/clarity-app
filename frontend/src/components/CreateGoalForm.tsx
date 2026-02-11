import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import api from '../api/client';

interface CreateGoalFormProps {
  onSuccess: () => void;
}

export default function CreateGoalForm({ onSuccess }: CreateGoalFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('P1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/goals', {
        title,
        priority
      });
      onSuccess();
    } catch (err) {
      alert("Failed to create strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Input
        label="Strategy Title"
        placeholder="e.g. Launch SaaS MVP"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        autoFocus
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-neon-blue/80 uppercase tracking-wider">
            Priority Level
        </label>
        <div className="grid grid-cols-3 gap-3">
            {['P0', 'P1', 'P2'].map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={clsx(
                        "py-3 rounded border font-mono text-sm transition-all",
                        priority === p 
                            ? "border-neon-blue bg-neon-blue/10 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.2)]" 
                            : "border-border bg-surface text-text-muted hover:border-text-secondary"
                    )}
                >
                    {p}
                </button>
            ))}
        </div>
        <p className="text-[10px] text-text-muted">
            {priority === 'P0' ? "Critical. Must be done immediately." : 
             priority === 'P1' ? "High Value. Focus here." : "Nice to have."}
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Establish Goal'}
        </Button>
      </div>
    </form>
  );
}

// Helper for class names (if not already imported)
import { clsx } from 'clsx';