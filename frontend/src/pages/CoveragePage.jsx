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
      <div className="px-4 py-2 rounded-xl glass-panel border-white/10 shadow-2xl">
        <p className="text-[10px] font-black font-heading text-white uppercase tracking-widest mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-[10px] font-black uppercase tracking-tighter" style={{ color: p.color }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CoveragePage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Line Coverage', value: '78%', icon: HiOutlineChartBar, color: '#22d3ee' },
          { label: 'Branch Coverage', value: '65%', icon: HiOutlineTrendingUp, color: '#10B981' },
          { label: 'Function Coverage', value: '86%', icon: HiOutlineShieldCheck, color: '#f59e0b' },
          { label: 'Risk Score', value: '32', icon: HiOutlineExclamation, color: '#f43f5e' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-[2rem] glass-panel border-white/5 p-6 bg-[#07111f]/40 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5" style={{ color: card.color }}>
                <card.icon className="text-xl" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.label}</span>
            </div>
            <p className="text-3xl font-black font-heading text-white tracking-tighter">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#050816]/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-cyber opacity-5 pointer-events-none" />
          <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest mb-10">Neural Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-8">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} /> 
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.name} <span className="text-white ml-1">{d.value}%</span></span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#050816]/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-3xl" />
          <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest mb-10">Historical Velocity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} domain={[40, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="coverage" stroke="#22d3ee" strokeWidth={4} fill="url(#covGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Branch coverage bar chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#050816]/60 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-cyan-400/5 to-transparent pointer-events-none" />
        <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest mb-10">Archive Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={coverageByFile} barGap={8}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="line" name="Line" fill="#22d3ee" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="branch" name="Branch" fill="#10B981" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="func" name="Function" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Heatmap cards */}
      <div>
        <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest mb-8 px-2">Matrix Heatmap</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {heatmapData.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className={`rounded-[2rem] p-6 text-center border transition-all hover:scale-105 cursor-pointer relative overflow-hidden group ${
                m.risk === 'high' ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 
                m.risk === 'medium' ? 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 
                'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
              }`}>
              <div className="absolute top-0 left-0 w-full h-full bg-grid-cyber opacity-0 group-hover:opacity-10 transition-opacity" />
              <p className="text-3xl font-black font-heading text-white tracking-tighter relative z-10">{m.coverage}%</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 relative z-10">{m.module}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
