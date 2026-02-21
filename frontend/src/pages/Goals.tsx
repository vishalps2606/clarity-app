import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { GoalCard } from "../components/GoalCard";
import { Button } from "../components/Button";
import Modal from "../components/Modal";
import CreateGoalForm from "../components/CreateGoalForm";
import api from "../api/client";
import { Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [goalsRes, tasksRes] = await Promise.all([
        api.get('/goals'),
        api.get('/tasks')
      ]);
      setGoals(goalsRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error("Failed to sync strategy data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppLayout>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Strategy Map</h2>
          <p className="text-text-secondary">
            High-level objectives and progress.
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          New Goal
        </Button>
      </header>

      {loading ? (
        <div className="text-neon-blue font-mono animate-pulse">
          Aligning satellites...
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-lg text-center">
          <Target className="w-12 h-12 text-text-muted mb-4" />
          <h3 className="text-xl font-bold text-text-primary">
            No Strategy Defined
          </h3>
          <p className="text-text-secondary mb-6 max-w-md">
            You are operating tactically without a strategic layer. Define a
            Goal to group your tasks.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const goalTasks = tasks.filter((t: any) => t.goal?.id === goal.id);
            const completed = goalTasks.filter(
              (t: any) => t.status === "DONE",
            ).length;

            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                totalTasks={goalTasks.length}
                completedTasks={completed}
                onClick={() => navigate(`/goals/${goal.id}`)}
              />
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="DEFINE NEW STRATEGY"
      >
        <CreateGoalForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      </Modal>
    </AppLayout>
  );
}
