import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, AreaChart, Area } from 'recharts';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineShieldCheck, HiOutlineExclamation } from 'react-icons/hi';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

const coverageByFile = [
  { name: 'handler.py', line: 87, branch: 72, func: 95 },
  { name: 'service.js', line: 72, branch: 58, func: 80 },
  { name: 'parser.ts', line: 65, branch: 45, func: 70 },
  { name: 'models.py', line: 94, branch: 88, func: 100 },
  { name: 'utils.ts', line: 78, branch: 62, func: 85 },
];

const trendData = [
  { day: 'W1', coverage: 52 }, { day: 'W2', coverage: 58 }, { day: 'W3', coverage: 63 },
  { day: 'W4', coverage: 68 }, { day: 'W5', coverage: 72 }, { day: 'W6', coverage: 78 },
];

const pieData = [
  { name: 'Covered', value: 78 }, { name: 'Partial', value: 12 }, { name: 'Uncovered', value: 10 },
];

const heatmapData = [
  { module: 'Payment', coverage: 87, risk: 'low' },
  { module: 'Auth', coverage: 72, risk: 'medium' },
  { module: 'Parser', coverage: 45, risk: 'high' },
  { module: 'Models', coverage: 94, risk: 'low' },
  { module: 'Upload', coverage: 56, risk: 'medium' },
  { module: 'Validation', coverage: 82, risk: 'low' },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] shadow-xl">
        <p className="text-xs font-medium text-[#F8FAFC] mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs text-[#94A3B8]">{p.name}: <span className="font-semibold" style={{ color: p.color }}>{p.value}%</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CoveragePage() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Line Coverage', value: '78%', icon: HiOutlineChartBar, color: '#6366F1' },
          { label: 'Branch Coverage', value: '65%', icon: HiOutlineTrendingUp, color: '#10B981' },
          { label: 'Function Coverage', value: '86%', icon: HiOutlineShieldCheck, color: '#F59E0B' },
          { label: 'Risk Score', value: '32', icon: HiOutlineExclamation, color: '#EF4444' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon style={{ color: card.color }} />
              </div>
              <span className="text-xs text-[#94A3B8]">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#F8FAFC]">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Coverage Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} /> {d.name} ({d.value}%)
              </span>
            ))}
          </div>
        </motion.div>

        {/* Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Coverage Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[40, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="coverage" stroke="#6366F1" strokeWidth={2} fill="url(#covGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Branch coverage bar chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5">
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Coverage by File</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={coverageByFile} barGap={4}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="line" name="Line" fill="#6366F1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="branch" name="Branch" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="func" name="Function" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Heatmap cards */}
      <div>
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Module Heatmap</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {heatmapData.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className={`rounded-xl p-4 text-center border transition-all hover:scale-105 cursor-pointer ${
                m.risk === 'high' ? 'bg-[#EF4444]/10 border-[#EF4444]/20' : m.risk === 'medium' ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20' : 'bg-[#10B981]/10 border-[#10B981]/20'
              }`}>
              <p className="text-xl font-bold text-[#F8FAFC]">{m.coverage}%</p>
              <p className="text-xs text-[#94A3B8] mt-1">{m.module}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
