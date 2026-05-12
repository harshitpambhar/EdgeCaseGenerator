import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] shadow-xl">
        <p className="text-sm font-medium text-[#F8FAFC]">{payload[0].name}</p>
        <p className="text-xs text-[#94A3B8]">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function CoverageChart({ data, centerLabel, centerValue }) {
  const chartData = data || [
    { name: 'Covered', value: 78 },
    { name: 'Partial', value: 12 },
    { name: 'Uncovered', value: 10 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={4}
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
        <span className="text-3xl font-bold text-[#F8FAFC]">{centerValue || '78%'}</span>
        <span className="text-xs text-[#64748B]">{centerLabel || 'Coverage'}</span>
      </div>
    </motion.div>
  );
}
