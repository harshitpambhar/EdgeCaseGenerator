import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#22d3ee', '#3b82f6', '#8b5cf6', '#10B981'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-2 rounded-xl glass-panel border-white/10 shadow-2xl">
        <p className="text-xs font-black font-heading text-white uppercase tracking-widest">{payload[0].name}</p>
        <p className="text-sm font-black text-cyan-400">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function CoverageChart({ data, centerLabel, centerValue }) {
  const chartData = data || [
    { name: 'Fully Covered', value: 78 },
    { name: 'Partial', value: 12 },
    { name: 'Uncovered', value: 10 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={100}
            paddingAngle={8}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black font-heading text-white tracking-tighter"
        >
          {centerValue || '78%'}
        </motion.span>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
        >
          {centerLabel || 'Overall Coverage'}
        </motion.span>
      </div>
    </motion.div>
  );
}
