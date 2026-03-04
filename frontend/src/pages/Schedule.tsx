import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, subDays, isToday } from "date-fns";
import AppLayout from "../layouts/AppLayout";
import api from "../api/client";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  Loader2,
  Clock,
} from "lucide-react";

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["time-blocks", dateKey],
    queryFn: async () => {
      const res = await api.get(`/time-blocks?date=${dateKey}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/time-blocks/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["time-blocks"] }),
  });

  return (
    <AppLayout>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-border gap-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">
            Timeline
          </h2>
          <p className="text-text-secondary font-mono text-sm uppercase mt-1">
            Chronological Execution Log
          </p>
        </div>

        <div className="flex items-center gap-4 bg-surface border border-border rounded-lg p-2">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors rounded text-text-muted"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-3 min-w-[180px] justify-center">
            <Calendar
              size={16}
              className={
                isToday(selectedDate) ? "text-neon-green" : "text-neon-blue"
              }
            />
            <span className="font-mono font-bold text-text-primary tracking-widest text-sm uppercase">
              {format(selectedDate, "MMM dd, yyyy")}
            </span>
          </div>

          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors rounded text-text-muted"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-neon-blue font-mono text-sm uppercase">
            <Loader2 className="animate-spin mr-3" size={20} />
            Retrieving chronological records...
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-surface/20">
            <Clock
              className="mx-auto mb-4 text-text-muted opacity-30"
              size={48}
            />
            <p className="text-text-muted font-mono italic text-sm">
              No time blocks recorded for this cycle.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {blocks.map((block: any) => (
              <div key={block.id} className="flex items-stretch gap-6 group">
                <div className="flex flex-col items-end min-w-[80px]">
                  <span className="font-mono text-xl font-bold text-text-primary tabular-nums">
                    {format(new Date(block.startTime), "HH:mm")}
                  </span>
                  <span className="font-mono text-[10px] text-text-secondary mt-1">
                    {format(new Date(block.endTime), "HH:mm")}
                  </span>
                </div>

                <div className="relative flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-neon-blue mt-2 ring-4 ring-void z-10" />
                  <div className="w-px h-full bg-border -mt-1 group-last:hidden" />
                </div>

                {/* CONTENT CARD */}
                <div className="flex-1 bg-surface border border-border rounded-lg p-5 hover:border-neon-blue/50 transition-colors mb-6 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-neon-purple uppercase tracking-widest mb-2 block">
                      {block.goalTitle || "UNALIGNED OPERATION"}
                    </span>
                    <h4 className="text-lg font-bold text-text-primary">
                      {block.taskTitle}
                    </h4>
                    <p className="text-xs text-text-secondary font-mono mt-3">
                      DURATION: {block.durationMinutes}m
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm("Eradicate this time record?")) {
                        deleteMutation.mutate(block.id);
                      }
                    }}
                    className="text-text-muted hover:text-neon-red p-2 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
