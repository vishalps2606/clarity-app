import { Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
  id: number;
  title: string;
  dueDatetime: string;
  estimatedMinutes: number;
}

interface ReviewCardProps {
  task: Task;
}

export default function ReviewCard({ task }: ReviewCardProps) {
  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-surface border border-border p-8 rounded-xl shadow-2xl w-full max-w-md text-center"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">{task.title}</h2>
        <p className="text-neon-red font-mono text-sm uppercase tracking-widest">
          Overdue / Needs Review
        </p>
      </div>

      <div className="flex justify-center gap-6 text-text-secondary font-mono text-sm mb-8">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-neon-blue" />
          <span>{new Date(task.dueDatetime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-neon-purple" />
          <span>{task.estimatedMinutes} min</span>
        </div>
      </div>
      
      <div className="bg-void/50 p-4 rounded border border-border text-xs text-text-muted">
        This task was not completed on time. Decide its fate to clear your mind.
      </div>
    </motion.div>
  );
}