import { motion } from 'framer-motion';
import { HiOutlineBeaker, HiOutlineCode, HiOutlineChartBar, HiOutlineLightningBolt, HiOutlineClock } from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AnalyticsCard from '../components/AnalyticsCard';
import RepoCard from '../components/RepoCard';
import CoverageChart from '../components/CoverageChart';

const chartData = [
  { name: 'Mon', tests: 120, coverage: 65 },
  { name: 'Tue', tests: 180, coverage: 68 },
  { name: 'Wed', tests: 240, coverage: 72 },
  { name: 'Thu', tests: 310, coverage: 74 },
  { name: 'Fri', tests: 280, coverage: 78 },
  { name: 'Sat', tests: 350, coverage: 81 },
  { name: 'Sun', tests: 420, coverage: 85 },
];

const repos = [
  { name: 'payment-service', language: 'Python', stars: 142, coverage: 87, risk: 'Low', lastAnalyzed: '2 hours ago' },
  { name: 'auth-gateway', language: 'TypeScript', stars: 89, coverage: 72, risk: 'Medium', lastAnalyzed: '5 hours ago' },
  { name: 'data-pipeline', language: 'Go', stars: 234, coverage: 45, risk: 'High', lastAnalyzed: '1 day ago' },
  { name: 'ml-inference', language: 'Python', stars: 67, coverage: 91, risk: 'Low', lastAnalyzed: '3 hours ago' },
];

const activity = [
  { time: '2 min ago', text: 'Test suite generated for payment-service', type: 'success' },
  { time: '15 min ago', text: 'High-risk function detected in auth-gateway', type: 'warning' },
  { time: '1 hr ago', text: 'Coverage report exported for ml-inference', type: 'info' },
  { time: '3 hrs ago', text: 'Repository data-pipeline analysis failed', type: 'error' },
  { time: '5 hrs ago', text: 'New edge cases discovered in auth-gateway', type: 'success' },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="px-4 py-2 rounded-xl glass-panel border-white/10 shadow-2xl">
        <p className="text-xs font-black font-heading text-white uppercase tracking-widest mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-[10px] font-black uppercase tracking-tighter" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black font-heading text-white tracking-tighter">Command Center</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status: ELITE OPERATIONAL</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-11 px-5 rounded-xl glass-panel border-white/10 text-[9px] font-black text-white uppercase tracking-widest hover:border-cyan-400/50 hover:bg-white/5 transition-all border-none cursor-pointer">
            Export Intel
          </button>
          <button className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-[9px] font-black text-white uppercase tracking-widest hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all border-none cursor-pointer">
            Deploy New Agent
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard title="Tests Synthesized" value="1,247" change="+12.5%" icon={HiOutlineBeaker} color="cyan" delay={0} />
        <AnalyticsCard title="Active Nodes" value="24" change="+3" icon={HiOutlineCode} color="blue" delay={0.1} />
        <AnalyticsCard title="Neural Coverage" value="78%" change="+5.2%" icon={HiOutlineChartBar} color="purple" delay={0.2} />
        <AnalyticsCard title="Risk Anomalies" value="7" change="-2" icon={HiOutlineLightningBolt} color="rose" delay={0.3} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-[2.5rem] glass-panel border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-cyber opacity-5 pointer-events-none" />
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-base font-black font-heading text-white uppercase tracking-widest">Generation Velocity</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">7-Day Analysis cycle</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Coverage</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCov" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="tests" stroke="#22d3ee" strokeWidth={3} fill="url(#colorTests)" />
              <Area type="monotone" dataKey="coverage" stroke="#10B981" strokeWidth={3} fill="url(#colorCov)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Coverage Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-[2.5rem] glass-panel border-white/5 p-8 flex flex-col items-center justify-center">
          <h3 className="text-base font-black font-heading text-white uppercase tracking-widest mb-8">System Integrity</h3>
          <CoverageChart />
          <div className="grid grid-cols-2 gap-4 w-full mt-10">
            {[{ l: 'SYNTHESIZED', c: '#22d3ee' }, { l: 'PENDING', c: '#10B981' }, { l: 'UNTOUCHED', c: '#8b5cf6' }, { l: 'FAILED', c: '#rose-500' }].map(i => (
              <div key={i.l} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i.c }} />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{i.l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Repos + Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Repos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest">Active Repositories</h3>
            <button className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-[0.2em] bg-transparent border-none cursor-pointer">
              Access Full Archive →
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {repos.map((r, i) => <RepoCard key={r.name} {...r} delay={i * 0.08} />)}
          </div>
        </div>

        {/* Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-[2.5rem] glass-panel border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl" />
          <h3 className="text-base font-black font-heading text-white uppercase tracking-widest mb-10">Neural Feed</h3>
          <div className="space-y-8 relative">
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/5" />
            {activity.map((a, i) => (
              <div key={i} className="flex gap-6 relative">
                <div className={`w-2 h-2 rounded-full z-10 mt-1.5 shadow-[0_0_10px_rgba(255,255,255,0.1)] ${
                  a.type === 'success' ? 'bg-cyan-400' : a.type === 'warning' ? 'bg-amber-400' : a.type === 'error' ? 'bg-rose-500' : 'bg-purple-500'
                }`} />
                <div>
                  <p className="text-[13px] font-bold text-slate-300 leading-snug">{a.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <HiOutlineClock className="text-[9px] text-slate-600" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{a.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
