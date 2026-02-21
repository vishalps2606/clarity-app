import { Clock, AlertCircle, Play, Trash2, CheckSquare } from 'lucide-react'; // Add Trash2, CheckSquare
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import api from '../api/client'; // Import API

interface Task {
  id: number;
  title: string;
  status: 'READY' | 'IN_PROGRESS' | 'DONE';
  estimatedMinutes: number;
  dueDatetime: string;
  goal?: { id: number; title: string }; // Optional Goal info
}

interface TaskCardProps {
  task: Task;
  onRefresh?: () => void; // Callback to refresh list after action
}

export default function TaskCard({ task, onRefresh }: TaskCardProps) {
  const navigate = useNavigate();
  const isOverdue = new Date(task.dueDatetime) < new Date() && task.status !== 'DONE';

  // 1. Handle Delete
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking the card container
    if (confirm('Delete this objective?')) {
      try {
        await api.delete(`/tasks/${task.id}`); // Ensure you have DELETE endpoint in backend
        onRefresh?.();
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  // 2. Handle Quick Complete
  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/tasks/${task.id}/complete`); // Reusing your existing endpoint
      onRefresh?.();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="group relative bg-surface border border-border p-4 rounded-lg hover:border-neon-blue/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col justify-between h-full">
      {/* Hover Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 group-hover:opacity-20 blur transition duration-300 rounded-lg pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <span className={clsx(
            "text-[10px] font-mono px-2 py-0.5 rounded border uppercase",
            task.status === 'DONE' ? "border-neon-green text-neon-green bg-neon-green/10" :
            task.status === 'IN_PROGRESS' ? "border-neon-purple text-neon-purple bg-neon-purple/10" :
            "border-text-secondary text-text-secondary"
          )}>
            {task.status.replace('_', ' ')}
          </span>
          {isOverdue && <AlertCircle size={16} className="text-neon-red" />}
        </div>

        <h3 className="font-medium text-text-primary mb-1 line-clamp-2">{task.title}</h3>
        
        {/* Goal Label */}
        {task.goal && (
            <p className="text-[10px] text-text-muted font-mono mb-4 uppercase tracking-wider">
                Target: {task.goal.title}
            </p>
        )}

        <div className="flex items-center gap-4 text-xs text-text-muted font-mono mb-4">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{task.estimatedMinutes}m</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Due: {new Date(task.dueDatetime).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* ACTION BAR (Only visible on hover or if mobile) */}
      <div className="relative z-10 flex gap-2 mt-auto pt-2 border-t border-white/5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status !== 'DONE' && (
            <>
                <button 
                    onClick={() => navigate(`/focus/${task.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-neon-blue/10 text-neon-blue rounded hover:bg-neon-blue hover:text-black text-xs font-bold transition-colors"
                >
                    <Play size={14} /> FOCUS
                </button>
                
                <button 
                    onClick={handleComplete}
                    className="p-2 text-text-secondary hover:text-neon-green hover:bg-neon-green/10 rounded transition-colors"
                    title="Mark Done"
                >
                    <CheckSquare size={16} />
                </button>
            </>
        )}

        <button 
            onClick={handleDelete}
            className="p-2 text-text-secondary hover:text-neon-red hover:bg-neon-red/10 rounded transition-colors ml-auto"
            title="Delete"
        >
            <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}