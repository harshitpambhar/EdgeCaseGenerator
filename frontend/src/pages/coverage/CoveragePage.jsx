import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineShieldCheck, HiOutlineExclamation } from 'react-icons/hi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

const coverageByFile = [
  { name: 'handler.py', line: 87, branch: 72, func: 95 },
  { name: 'service.js', line: 72, branch: 58, func: 80 },
  { name: 'parser.ts',  line: 65, branch: 45, func: 70 },
  { name: 'models.py',  line: 94, branch: 88, func: 100 },
  { name: 'utils.ts',   line: 78, branch: 62, func: 85 },
];

const trendData = [
  { day: 'W1', coverage: 52 }, { day: 'W2', coverage: 58 }, { day: 'W3', coverage: 63 },
  { day: 'W4', coverage: 68 }, { day: 'W5', coverage: 72 }, { day: 'W6', coverage: 78 },
];

const pieData = [
  { name: 'Covered', value: 78 },
  { name: 'Partial', value: 12 },
  { name: 'Uncovered', value: 10 },
];

const heatmapData = [
  { module: 'Payment', coverage: 87, risk: 'low' },
  { module: 'Auth', coverage: 72, risk: 'medium' },
  { module: 'Parser', coverage: 45, risk: 'high' },
  { module: 'Models', coverage: 94, risk: 'low' },
  { module: 'Upload', coverage: 56, risk: 'medium' },
  { module: 'Validation', coverage: 82, risk: 'low' },
];

const stats = [
  { label: 'Line coverage', value: '78%', icon: HiOutlineChartBar, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Branch coverage', value: '65%', icon: HiOutlineTrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Function coverage', value: '86%', icon: HiOutlineShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Risk score', value: '32', icon: HiOutlineExclamation, color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg bg-[#111] border border-white/10 text-xs shadow-xl">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}%</p>)}
    </div>
  );
};

export default function CoveragePage() {
  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Coverage</h2>
        <p className="text-sm text-white/40 mt-0.5">Test coverage metrics across your codebase.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`text-sm ${s.color}`} />
              </div>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
            <p className="text-2xl font-semibold text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <p className="text-sm font-medium text-white mb-1">Distribution</p>
          <p className="text-xs text-white/30 mb-4">Coverage breakdown by status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {d.name} <span className="text-white/60">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <p className="text-sm font-medium text-white mb-1">Coverage over time</p>
          <p className="text-xs text-white/30 mb-4">6-week trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} domain={[40, 100]} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="coverage" stroke="#6366f1" strokeWidth={2} fill="url(#covGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bar chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <p className="text-sm font-medium text-white mb-1">Per-file breakdown</p>
        <p className="text-xs text-white/30 mb-5">Line, branch, and function coverage by file</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={coverageByFile} barGap={4}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="line" name="Line" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="branch" name="Branch" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="func" name="Function" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Module grid */}
      <div>
        <p className="text-sm font-medium text-white mb-3">Module coverage</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {heatmapData.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className={`rounded-xl p-4 text-center border cursor-pointer hover:scale-105 transition-transform ${
                m.risk === 'high'   ? 'bg-rose-500/10 border-rose-500/20' :
                m.risk === 'medium' ? 'bg-amber-500/10 border-amber-500/20' :
                                     'bg-emerald-500/10 border-emerald-500/20'
              }`}>
              <p className="text-xl font-semibold text-white">{m.coverage}%</p>
              <p className="text-xs text-white/40 mt-1">{m.module}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
