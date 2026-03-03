import { useQuery } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import api from '../api/client';
import { 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { Brain, Target, Zap, AlertTriangle, Loader2 } from 'lucide-react';

export default function Insights() {
  // 1. FETCH INSIGHTS FROM BACKEND
  const { data: insights, isLoading } = useQuery({
    queryKey: ['insights-weekly'],
    queryFn: async () => {
      const res = await api.get('/insights/weekly');
      return res.data; // PlanningInsightsResponse DTO
    }
  });

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full text-neon-blue font-mono">
        <Loader2 className="animate-spin mr-2" /> ANALYZING PERFORMANCE TRENDS...
      </div>
    </AppLayout>
  );

  // Map backend data to chart formats
  const completionData = [
    { name: 'Completed', value: insights?.completedTasks || 0, color: '#0AFF60' },
    { name: 'Slipped', value: insights?.slippageCount || 0, color: '#FF003C' },
    { name: 'Remaining', value: (insights?.totalTasks || 0) - (insights?.completedTasks || 0) - (insights?.slippageCount || 0), color: '#333' }
  ];

  return (
    <AppLayout>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary uppercase tracking-tighter">Strategic Intelligence</h2>
        <p className="text-text-secondary font-mono text-sm">7-Day Operations Review</p>
      </header>

      {/* AI FEEDBACK PANEL */}
      <div className="bg-neon-blue/5 border border-neon-blue/20 p-6 rounded-lg mb-10 flex items-start gap-4">
        <Brain className="text-neon-blue shrink-0" size={32} />
        <div>
          <h4 className="text-neon-blue font-mono font-bold text-xs uppercase mb-1">Command Analysis</h4>
          <p className="text-text-primary text-lg italic leading-relaxed">
            "{insights?.feedback || "Insufficient data for analysis. Deploy more objectives."}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* KPI GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface border border-border p-6 rounded-lg">
            <Target className="text-neon-green mb-4" size={20} />
            <p className="text-text-secondary text-[10px] font-mono uppercase">Completion Rate</p>
            <p className="text-3xl font-bold text-text-primary">{insights?.completionRate}%</p>
          </div>
          <div className="bg-surface border border-border p-6 rounded-lg">
            <Zap className="text-neon-purple mb-4" size={20} />
            <p className="text-text-secondary text-[10px] font-mono uppercase">Efficiency Gap</p>
            <p className="text-3xl font-bold text-text-primary">{insights?.avgErrorMinutes}m</p>
          </div>
          <div className="bg-surface border border-border p-6 rounded-lg">
            <AlertTriangle className="text-neon-red mb-4" size={20} />
            <p className="text-text-secondary text-[10px] font-mono uppercase">Slippage Rate</p>
            <p className="text-3xl font-bold text-text-primary">{insights?.slippageRate}%</p>
          </div>
          <div className="bg-surface border border-border p-6 rounded-lg">
            <div className="h-5 w-5 rounded-full border-2 border-text-muted mb-4" />
            <p className="text-text-secondary text-[10px] font-mono uppercase">Total Volume</p>
            <p className="text-3xl font-bold text-text-primary">{insights?.totalTasks}</p>
          </div>
        </div>

        {/* DISTRIBUTION CHART */}
        <div className="bg-surface border border-border p-8 rounded-lg min-h-[300px]">
          <h4 className="text-text-primary font-bold mb-6 font-mono text-xs uppercase">Tactical Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={completionData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A' }}
                itemStyle={{ color: '#EDEDED', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
             {completionData.map(d => (
               <div key={d.name} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                 <span className="text-[10px] font-mono text-text-secondary uppercase">{d.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}