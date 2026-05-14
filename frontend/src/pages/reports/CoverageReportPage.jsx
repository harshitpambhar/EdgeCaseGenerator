import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Activity, Target, Globe, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';

const coverageMetrics = [
  { name: 'Routes', coverage: 89, tested: 45, total: 50, icon: Target },
  { name: 'Components', coverage: 84, tested: 42, total: 50, icon: Activity },
  { name: 'APIs', coverage: 76, tested: 38, total: 50, icon: Globe },
  { name: 'Workflows', coverage: 91, tested: 46, total: 50, icon: Zap },
];

const routeCoverage = [
  { path: '/dashboard', coverage: 95 },
  { path: '/upload', coverage: 88 },
  { path: '/projects', coverage: 82 },
  { path: '/testcases', coverage: 91 },
  { path: '/automation', coverage: 79 },
  { path: '/executions', coverage: 85 },
  { path: '/reports', coverage: 93 },
];

const untestedModules = [
  { module: 'Admin Settings Page', type: 'UI', risk: 'Low', suggestion: 'Add e2e tests for admin panel' },
  { module: 'Export to PDF', type: 'Feature', risk: 'Medium', suggestion: 'Create tests for PDF export functionality' },
  { module: 'Webhook Handlers', type: 'API', risk: 'High', suggestion: 'Write integration tests for webhook processing' },
  { module: 'Cache Layer', type: 'System', risk: 'High', suggestion: 'Add performance and cache invalidation tests' },
];

const pieData = [
  { name: 'Covered', value: 78, color: '#22c55e' },
  { name: 'Uncovered', value: 22, color: '#ef4444' },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg bg-[#111] border border-white/10 shadow-xl text-xs">
      <p className="text-white">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

export default function CoverageReportPage() {
  const { id } = useParams();

  return (
    <div className="max-w-5xl space-y-6 pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/30">
        <Link to="/reports" className="hover:text-white/60 transition-colors no-underline">
          Reports
        </Link>
        <span>/</span>
        <span className="text-white/60">Coverage Report</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Coverage Report</h1>
        <p className="text-white/40">Overall test coverage breakdown and untested module recommendations</p>
      </div>

      {/* Coverage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coverageMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="text-indigo-400 text-lg" />
                <span className="text-2xl font-bold text-white">{metric.coverage}%</span>
              </div>
              <p className="text-xs text-white/40 mb-2">{metric.name}</p>
              <p className="text-xs text-white/30">
                {metric.tested} / {metric.total} tested
              </p>
              <div className="h-1.5 rounded-full bg-white/[0.05] mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metric.coverage}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-rose-500"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08]"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Route Coverage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={routeCoverage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="path" tick={{ fill: '#fff', fontSize: 11, opacity: 0.5 }} />
              <YAxis tick={{ fill: '#fff', fontSize: 11, opacity: 0.5 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="coverage" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Overall Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08]"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Overall Coverage</h3>
          <div className="flex items-center justify-center h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-white/60">Covered: 78%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-white/60">Uncovered: 22%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Untested Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08]"
      >
        <h3 className="text-sm font-semibold text-white mb-4">Untested Modules & Recommendations</h3>
        <div className="space-y-3">
          {untestedModules.map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.module}</p>
                  <p className="text-xs text-white/40 mt-1">{item.type}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    item.risk === 'High'
                      ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      : item.risk === 'Medium'
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  }`}
                >
                  {item.risk} Risk
                </span>
              </div>
              <p className="text-xs text-indigo-300/80 mt-2">💡 {item.suggestion}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Export Button */}
      <motion.button
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-sm font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all"
      >
        Export Coverage Report
      </motion.button>
    </div>
  );
}
