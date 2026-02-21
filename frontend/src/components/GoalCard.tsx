import { Target, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

interface Goal {
  id: number;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'ACTIVE' | 'PAUSED' | 'DONE';
}

interface GoalCardProps {
  goal: Goal;
  totalTasks: number;
  completedTasks: number;
  onClick?: () => void; // <--- NEW PROP
}

export function GoalCard({ goal, totalTasks, completedTasks, onClick }: GoalCardProps) {
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div 
      onClick={onClick} // <--- ADD ONCLICK
      className={clsx(
        "bg-surface border border-border p-6 rounded-lg transition-all duration-300 relative overflow-hidden group",
        onClick ? "cursor-pointer hover:border-neon-blue hover:shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "hover:border-neon-blue/50"
      )}
    >
      {/* Background Gradient for Priority */}
      <div className={clsx(
        "absolute top-0 right-0 p-2 rounded-bl-lg text-xs font-mono font-bold border-l border-b",
        goal.priority === 'P0' ? "bg-neon-red/20 text-neon-red border-neon-red/20" :
        goal.priority === 'P1' ? "bg-neon-purple/20 text-neon-purple border-neon-purple/20" :
        "bg-neon-blue/20 text-neon-blue border-neon-blue/20"
      )}>
        {goal.priority}
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className={clsx(
            "p-3 rounded-full border",
            goal.status === 'DONE' ? "bg-neon-green/10 border-neon-green text-neon-green" :
            "bg-void border-border text-text-secondary"
        )}>
            {goal.status === 'DONE' ? <Trophy size={20} /> : <Target size={20} />}
        </div>
        <div>
            <h3 className="text-lg font-bold text-text-primary">{goal.title}</h3>
            <p className="text-xs text-text-secondary font-mono mt-1">
                {completedTasks} / {totalTasks} Tasks Completed
            </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-void rounded-full h-2 border border-border overflow-hidden">
        <div 
            className={clsx(
                "h-full transition-all duration-1000 ease-out",
                progress === 100 ? "bg-neon-green shadow-[0_0_10px_#0AFF60]" : "bg-neon-blue shadow-[0_0_10px_#00F0FF]"
            )}
            style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] font-mono text-text-muted">
        <span>PROGRESS</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
}