import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import FocusTimer from '../components/FocusTimer';
import api from '../api/client';
import { ArrowLeft, CheckCircle, PauseCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { Button } from '../components/Button';

export default function FocusMode() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [lastSessionMinutes, setLastSessionMinutes] = useState(0);

  useEffect(() => {
    api.get('/tasks').then(res => {
      const found = res.data.find((t: any) => t.id === Number(taskId));
      if (found) setTask(found);
      setLoading(false);
    });
  }, [taskId]);

  const handleTimerStop = async (minutesSpent: number) => {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - minutesSpent * 60000);

    try {
      await api.post(`/time-blocks`, {
        taskId: task.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });
      
      setLastSessionMinutes(minutesSpent);
      setShowCompleteModal(true); 
    } catch (err) {
      alert("Failed to sync session.");
    }
  };

  const handleMarkComplete = async () => {
    try {
        await api.put(`/tasks/${taskId}/complete`);
        navigate('/dashboard');
    } catch (err) {
        alert("Error completing task");
    }
  };

  if (loading) return <div className="p-10 text-neon-blue">Initializing Neural Link...</div>;
  if (!task) return <div className="p-10 text-neon-red">Objective Not Found.</div>;

  const remainingMinutes = (task.estimatedMinutes || 60) - (task.actualMinutes || 0);
  const startMinutes = remainingMinutes > 0 ? remainingMinutes : 0; 

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto text-center pt-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-secondary hover:text-white mb-8 mx-auto"
        >
          <ArrowLeft size={16} /> Return to Base
        </button>

        <div className="mb-10">
          <h2 className="text-sm font-mono text-neon-purple uppercase tracking-widest mb-2">Current Objective</h2>
          <h1 className="text-3xl font-bold text-text-primary">{task.title}</h1>
          <p className="text-text-muted mt-2 font-mono text-sm">
             Progress: {task.actualMinutes || 0} / {task.estimatedMinutes} min
          </p>
        </div>

        <div className="bg-surface/50 border border-border rounded-xl p-8 shadow-2xl backdrop-blur-sm">
          <FocusTimer 
            durationMinutes={startMinutes === 0 ? 30 : startMinutes} // Default 30 if done
            onComplete={handleTimerStop}
          />
        </div>
        
        {/* COMPLETION MODAL */}
        <Modal 
            isOpen={showCompleteModal} 
            onClose={() => navigate('/dashboard')} 
            title="SESSION REPORT"
        >
            <div className="text-center">
                <p className="text-text-secondary mb-6">
                    Session of <span className="text-neon-blue font-bold">{lastSessionMinutes}m</span> recorded. 
                    <br/>What is the status of this objective?
                </p>
                
                <div className="flex gap-4 justify-center">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2"
                    >
                        <PauseCircle size={18} />
                        Pause (Come back later)
                    </Button>
                    
                    <Button 
                        className="flex items-center gap-2 bg-neon-green text-black hover:bg-neon-green/80"
                        onClick={handleMarkComplete}
                    >
                        <CheckCircle size={18} />
                        Mission Complete
                    </Button>
                </div>
            </div>
        </Modal>

      </div>
    </AppLayout>
  );
}