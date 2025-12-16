import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { JudgeEvaluation } from '../types';

interface ScoreChartProps {
  evaluations: JudgeEvaluation[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ evaluations }) => {
  const data = evaluations.map((ev, index) => ({
    round: index + 1,
    pro: ev.proScore,
    con: ev.conScore,
    diff: ev.proScore - ev.conScore // Visualizing the gap
  }));

  if (evaluations.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm italic border-2 border-dashed border-slate-700 rounded-lg">
        Waiting for debate data...
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="round" stroke="#64748b" fontSize={10} tickFormatter={(val) => `R${val}`} />
          <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <ReferenceLine y={50} stroke="#475569" strokeDasharray="3 3" />
          <Area 
            type="monotone" 
            dataKey="pro" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPro)" 
            name="Pro Score"
            animationDuration={500}
          />
          <Area 
            type="monotone" 
            dataKey="con" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCon)" 
            name="Con Score"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;