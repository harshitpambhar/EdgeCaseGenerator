import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineCode, HiOutlinePlay, HiOutlineDocumentReport,
  HiOutlineLightningBolt, HiOutlineClock, HiOutlineArrowRight,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineCollection,
} from 'react-icons/hi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import AnalyticsCard from '../../components/dashboard/AnalyticsCard';
import CoverageChart from '../../components/dashboard/CoverageChart';

const trendData = [
  { name: 'Mon', testcases: 84, executions: 12 },
  { name: 'Tue', testcases: 130, executions: 18 },
  { name: 'Wed', testcases: 210, executions: 24 },
  { name: 'Thu', testcases: 290, executions: 31 },
  { name: 'Fri', testcases: 260, executions: 28 },
  { name: 'Sat', testcases: 340, executions: 35 },
  { name: 'Sun', testcases: 410, executions: 42 },
];

const recentProjects = [
  { name: 'ecommerce-frontend', framework: 'React + Playwright', coverage: 84, status: 'Completed', lastRun: '1 hr ago' },
  { name: 'payment-api', framework: 'Express + Jest', coverage: 71, status: 'Running', lastRun: '10 min ago' },
  { name: 'auth-service', framework: 'Spring Boot', coverage: 58, status: 'Failed', lastRun: '3 hrs ago' },
  { name: 'admin-dashboard', framework: 'Next.js + Playwright', coverage: 92, status: 'Completed', lastRun: '5 hrs ago' },
];

const activity = [
  { time: '3 min ago', text: 'Playwright scripts generated for ecommerce-frontend', type: 'success' },
  { time: '18 min ago', text: 'Execution failed: auth-service — 3 assertions failed', type: 'error' },
  { time: '1 hr ago', text: 'AI detected 12 edge cases in payment-api', type: 'info' },
  { time: '2 hrs ago', text: 'Coverage report exported for admin-dashboard', type: 'success' },
  { time: '4 hrs ago', text: 'Risk alert: high cyclomatic complexity in auth-service', type: 'warning' },
];

const quickActions = [
  { label: 'Upload Repository', to: '/upload', icon: HiOutlineCollection, color: 'indigo' },
  { label: 'View Test Cases', to: '/testcases', icon: HiOutlineCode, color: 'blue' },
  { label: 'Run Executions', to: '/executions', icon: HiOutlinePlay, color: 'emerald' },
  { label: 'View Reports', to: '/reports', icon: HiOutlineDocumentReport, color: 'rose' },
];

const statusStyle = {
  Completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Running: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  Failed: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">QA Dashboard</h2>
          <p className="text-sm text-white/40 mt-0.5">Overview of your automation pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/reports"
            className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors no-underline flex items-center">
            Reports
          </Link>
          <Link to="/upload"
            className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center">
            New project
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total projects" value="18" change="+3" icon={HiOutlineCollection} color="indigo" delay={0} />
        <AnalyticsCard title="Test cases generated" value="4,821" change="+340" icon={HiOutlineCode} color="blue" delay={0.05} />
        <AnalyticsCard title="Executions run" value="312" change="+28" icon={HiOutlinePlay} color="emerald" delay={0.1} />
        <AnalyticsCard title="Failures detected" value="47" change="-12" icon={HiOutlineLightningBolt} color="rose" delay={0.15} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-white">Test generation & execution trend</p>
              <p className="text-xs text-white/30 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />Test Cases</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Executions</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gTC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gEx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="testcases" name="Test Cases" stroke="#6366f1" strokeWidth={2} fill="url(#gTC)" />
              <Area type="monotone" dataKey="executions" name="Executions" stroke="#10b981" strokeWidth={2} fill="url(#gEx)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col">
          <p className="text-sm font-medium text-white mb-1">Pass / Fail ratio</p>
          <p className="text-xs text-white/30 mb-4">Across all executions</p>
          <div className="flex-1 flex items-center justify-center">
            <CoverageChart />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[{ l: 'Passed', c: '#6366f1' }, { l: 'Failed', c: '#f43f5e' }, { l: 'Skipped', c: '#10b981' }, { l: 'Pending', c: '#8b5cf6' }].map(item => (
              <div key={item.l} className="flex items-center gap-2 text-xs text-white/40">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.c }} />
                {item.l}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-sm font-medium text-white mb-3">Quick actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={action.to} className="no-underline block rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-white/[0.1] transition-colors group">
                <action.icon className="text-lg text-white/40 group-hover:text-indigo-300 transition-colors mb-3" />
                <p className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">{action.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Projects + Activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Recent projects</p>
            <Link to="/projects" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors no-underline flex items-center gap-1">
              View all <HiOutlineArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Project', 'Framework', 'Coverage', 'Status', 'Last Run'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-xs font-medium text-white/30 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentProjects.map((p, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link to="/projects" className="text-sm text-white/70 hover:text-white transition-colors no-underline font-mono">{p.name}</Link>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-white/40">{p.framework}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-emerald-400">{p.coverage}%</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusStyle[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-white/30 flex items-center gap-1"><HiOutlineClock className="text-xs" />{p.lastRun}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
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
