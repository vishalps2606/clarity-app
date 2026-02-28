import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import api from "../api/client";
import clsx from "clsx";

interface CreateTaskFormProps {
  onSuccess: () => void;
  defaultGoalId?: number;
}

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function CreateTaskForm({ onSuccess, defaultGoalId }: any) {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [goalId, setGoalId] = useState(defaultGoalId?.toString() || "");
  const [recurrence, setRecurrence] = useState("NONE");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/goals").then((res) => {
      setGoals(res.data);
      if (defaultGoalId) {
        setGoalId(defaultGoalId.toString());
      } else if (res.data.length > 0) {
        setGoalId(res.data[0].id);
      }
    });
  }, [defaultGoalId]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tasks", {
        title,
        estimatedMinutes: parseInt(minutes),
        goalId: parseInt(goalId),
        dueDatetime: new Date(dueDate).toISOString(),
        recurrenceType: recurrence,
        recurrencePattern:
          recurrence === "DAILY" ? selectedDays.join(",") : null,
      });
      onSuccess();
    } catch (err) {
      alert("Failed to initiate objective.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Objective Title"
        placeholder="e.g. Daily Gym Session"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Est. Duration (Min)"
          type="number"
          placeholder="60"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-neon-blue/80 uppercase tracking-wider">
            Target Goal
          </label>
          <select
            className="bg-surface border border-border rounded px-4 py-3 text-text-primary focus:outline-none focus:border-neon-blue"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
          >
            {goals.length === 0 && <option>No Goals Found</option>}
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-neon-blue/80 uppercase tracking-wider">
            Recurrence
          </label>
          <select
            className="bg-surface border border-border rounded px-4 py-3 text-text-primary"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            <option value="NONE">Once</option>
            <option value="DAILY">Daily / Custom Days</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>

        {recurrence === "DAILY" && (
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-mono text-neon-blue/80 uppercase tracking-wider">
              Repeat on
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={clsx(
                    "px-3 py-1 text-[10px] font-bold border rounded transition-all",
                    selectedDays.includes(day)
                      ? "bg-neon-blue/20 border-neon-blue text-neon-blue"
                      : "bg-void border-border text-text-muted",
                  )}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Initializing..." : "Confirm Objective"}
        </Button>
      </div>
    </form>
  );
}
