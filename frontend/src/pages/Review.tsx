import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ReviewCard from '../components/ReviewCard';
import { Button } from '../components/Button';
import { AnimatePresence } from 'framer-motion';
import { Check, X, CalendarClock } from 'lucide-react';
import api from '../api/client';

export default function Review() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch Overdue Tasks
  useEffect(() => {
    const fetchReviewTasks = async () => {
      try {
        const res = await api.get('/tasks/review');
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to load review tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchReviewTasks();
  }, []);

  // 2. Handle Decision Logic
  const handleDecision = async (decision: 'RESUME' | 'DROP' | 'ACCEPT_DELAY') => {
    const task = tasks[currentIndex];
    
    // Prepare Request Body
    const body: any = {
      decision: decision,
      note: "Reviewed via Web UI"
    };

    // If Delay, push to tomorrow (For now, simple logic. Later we can add a date picker)
    if (decision === 'ACCEPT_DELAY') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        body.newDueDatetime = tomorrow.toISOString();
    } else if (decision === 'RESUME') {
        // If Resuming, set due date to NOW so it appears in today's list
        body.newDueDatetime = new Date().toISOString();
    }

    try {
      await api.post(`/tasks/${task.id}/review`, body);
      
      // Move to next card
      if (currentIndex < tasks.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // All done!
        navigate('/dashboard');
      }
    } catch (err) {
      alert("Failed to save decision.");
    }
  };

  const currentTask = tasks[currentIndex];

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        
        {loading ? (
          <div className="text-neon-blue font-mono animate-pulse">Scanning backlog...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neon-green mb-2">All Clear</h2>
            <p className="text-text-secondary mb-6">You have no overdue tasks to review.</p>
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-text-muted font-mono text-sm">
              Reviewing {currentIndex + 1} of {tasks.length}
            </div>

            {/* The Card with Animation */}
            <AnimatePresence mode='wait'>
                {currentTask && <ReviewCard key={currentTask.id} task={currentTask} />}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button 
                variant="danger" 
                className="flex items-center gap-2"
                onClick={() => handleDecision('DROP')}
              >
                <X size={18} />
                Drop
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleDecision('ACCEPT_DELAY')}
              >
                <CalendarClock size={18} />
                Delay (+1 Day)
              </Button>

              <Button 
                className="flex items-center gap-2 bg-neon-green text-black hover:bg-neon-green/80"
                onClick={() => handleDecision('RESUME')}
              >
                <Check size={18} />
                Keep
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}