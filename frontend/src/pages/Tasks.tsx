import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import TaskCard from "../components/TaskCard";
import { Button } from "../components/Button";
import Modal from "../components/Modal";
import CreateTaskForm from "../components/CreateTaskForm";
import api from "../api/client";
import { Plus, Search, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export default function Tasks() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "DONE">(
    "ALL",
  );

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get("/tasks");
      return res.data;
    },
  });

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL"
        ? true
        : filterStatus === "DONE"
          ? task.status === "DONE"
          : task.status !== "DONE";

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">
            Task Archive
          </h2>
          <p className="text-text-secondary font-mono text-sm uppercase mt-1">
            Master list of all directives
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          New Objective
        </Button>
      </header>

      {/* FILTER BAR */}
      <div className="bg-surface border border-border p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search protocols..."
            className="w-full bg-void border border-border rounded pl-10 pr-4 py-2 text-text-primary focus:border-neon-blue focus:outline-none font-mono text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "DONE"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={clsx(
                "px-4 py-2 rounded text-xs font-mono font-bold border transition-all",
                filterStatus === status
                  ? "bg-neon-blue/10 text-neon-blue border-neon-blue"
                  : "bg-void border-border text-text-muted hover:text-text-primary",
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="flex items-center gap-3 text-neon-blue font-mono p-8">
          <Loader2 className="animate-spin" size={20} />
          DECRYPTING ARCHIVES...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-text-muted italic border border-dashed border-border p-12 rounded-lg text-center font-mono text-sm bg-surface/20">
          No objectives found matching current parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task: any) => (
            <TaskCard key={task.id} task={task} onRefresh={refetch} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="INITIATE NEW OBJECTIVE"
      >
        <CreateTaskForm
          onSuccess={() => {
            setIsModalOpen(false);
            // Invalidate to fetch fresh data and update all screens
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["goals"] });
          }}
        />
      </Modal>
    </AppLayout>
  );
}
