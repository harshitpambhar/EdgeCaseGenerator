import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineBeaker, HiOutlineCode, HiOutlineChartBar, HiOutlineLightningBolt, HiOutlineClock, HiOutlineArrowRight, HiOutlineCloudUpload, HiOutlineDocumentReport } from 'react-icons/hi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import AnalyticsCard from '../../components/dashboard/AnalyticsCard';
import RepoCard from '../../components/dashboard/RepoCard';
import CoverageChart from '../../components/dashboard/CoverageChart';

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
  { time: '5 hrs ago', text: 'New edge cases found in auth-gateway', type: 'success' },
];

const dotColor = { success: 'bg-emerald-400', warning: 'bg-amber-400', error: 'bg-rose-500', info: 'bg-indigo-400' };

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg bg-[#111] border border-white/10 shadow-xl text-xs">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Overview</h2>
          <p className="text-sm text-white/40 mt-0.5">Here's what's happening with your repositories.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent">
            Export
          </button>
          <button className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors cursor-pointer border-none">
            New analysis
          </button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/upload" className="no-underline block">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="group rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 hover:border-indigo-500/40 p-5 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white">Upload Project</p>
                <p className="text-xs text-white/40 mt-1">Start a new analysis</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                <HiOutlineCloudUpload className="text-indigo-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-indigo-400 text-xs font-medium">
              <span>Get started</span>
              <HiOutlineArrowRight className="text-xs" />
            </div>
          </motion.div>
        </Link>

        <Link to="/coverage" className="no-underline block">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="group rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 p-5 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white">Coverage Analysis</p>
                <p className="text-xs text-white/40 mt-1">View coverage metrics</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <HiOutlineChartBar className="text-emerald-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <span>View details</span>
              <HiOutlineArrowRight className="text-xs" />
            </div>
          </motion.div>
        </Link>

        <Link to="/reports" className="no-underline block">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="group rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 hover:border-rose-500/40 p-5 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white">Test Reports</p>
                <p className="text-xs text-white/40 mt-1">Download & export</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/30 transition-colors">
                <HiOutlineDocumentReport className="text-rose-400 text-lg" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs font-medium">
              <span>View reports</span>
              <HiOutlineArrowRight className="text-xs" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Tests generated" value="1,247" change="+12.5%" icon={HiOutlineBeaker} color="indigo" delay={0} />
        <AnalyticsCard title="Repositories" value="24" change="+3" icon={HiOutlineCode} color="blue" delay={0.05} />
        <AnalyticsCard title="Avg coverage" value="78%" change="+5.2%" icon={HiOutlineChartBar} color="emerald" delay={0.1} />
        <AnalyticsCard title="Risk alerts" value="7" change="-2" icon={HiOutlineLightningBolt} color="rose" delay={0.15} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-white">Test generation trend</p>
              <p className="text-xs text-white/30 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />Tests</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Coverage</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gTests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCov" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="tests" stroke="#6366f1" strokeWidth={2} fill="url(#gTests)" />
              <Area type="monotone" dataKey="coverage" stroke="#10b981" strokeWidth={2} fill="url(#gCov)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col"
        >
          <p className="text-sm font-medium text-white mb-1">Coverage breakdown</p>
          <p className="text-xs text-white/30 mb-4">Across all repositories</p>
          <div className="flex-1 flex items-center justify-center">
            <CoverageChart />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[{ l: 'Covered', c: '#6366f1' }, { l: 'Partial', c: '#10b981' }, { l: 'Uncovered', c: '#8b5cf6' }, { l: 'Failed', c: '#f43f5e' }].map(item => (
              <div key={item.l} className="flex items-center gap-2 text-xs text-white/40">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.c }} />
                {item.l}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Repos + Activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Recent repositories</p>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1">
              View all <HiOutlineArrowRight className="text-xs" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {repos.map((r, i) => <RepoCard key={r.name} {...r} delay={i * 0.05} />)}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5"
        >
          <p className="text-sm font-medium text-white mb-4">Recent activity</p>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor[a.type]}`} />
                <div>
                  <p className="text-xs text-white/60 leading-relaxed">{a.text}</p>
                  <p className="text-[11px] text-white/25 mt-1 flex items-center gap-1">
                    <HiOutlineClock className="text-xs" />{a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
