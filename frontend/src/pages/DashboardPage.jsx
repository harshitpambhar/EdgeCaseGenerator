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
      <div className="px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] shadow-xl">
        <p className="text-xs font-medium text-[#F8FAFC] mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs text-[#94A3B8]">{p.name}: <span className="font-semibold" style={{ color: p.color }}>{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Tests" value="1,247" change="+12.5%" icon={HiOutlineBeaker} color="accent" delay={0} />
        <AnalyticsCard title="Repositories" value="24" change="+3" icon={HiOutlineCode} color="success" delay={0.1} />
        <AnalyticsCard title="Avg Coverage" value="78%" change="+5.2%" icon={HiOutlineChartBar} color="warning" delay={0.2} />
        <AnalyticsCard title="Risk Alerts" value="7" change="-2" icon={HiOutlineLightningBolt} color="error" delay={0.3} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Test Generation Trend</h3>
            <div className="flex gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#6366F1]" /> Tests</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Coverage</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCov" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="tests" stroke="#6366F1" strokeWidth={2} fill="url(#colorTests)" />
              <Area type="monotone" dataKey="coverage" stroke="#10B981" strokeWidth={2} fill="url(#colorCov)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Coverage Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">Overall Coverage</h3>
          <CoverageChart />
          <div className="flex justify-center gap-4 mt-2">
            {[{ l: 'Covered', c: '#6366F1' }, { l: 'Partial', c: '#10B981' }, { l: 'Uncovered', c: '#F59E0B' }].map(i => (
              <span key={i.l} className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: i.c }} /> {i.l}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Repos + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Repos */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Recent Repositories</h3>
            <span className="text-xs text-[#818CF8] cursor-pointer hover:text-[#6366F1]">View all →</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {repos.map((r, i) => <RepoCard key={r.name} {...r} delay={i * 0.08} />)}
          </div>
        </div>

        {/* Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Activity Timeline</h3>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                    a.type === 'success' ? 'bg-[#10B981]' : a.type === 'warning' ? 'bg-[#F59E0B]' : a.type === 'error' ? 'bg-[#EF4444]' : 'bg-[#6366F1]'
                  }`} />
                  {i < activity.length - 1 && <div className="w-px flex-1 bg-[#334155] mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-[#E2E8F0] leading-snug">{a.text}</p>
                  <span className="text-xs text-[#64748B] flex items-center gap-1 mt-1"><HiOutlineClock className="text-[10px]" />{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
