import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, ChevronRight } from 'lucide-react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';
import { formatRelativeTime, formatDuration } from '../../utils/formatting';

export default function ExecutionHistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const executions = [
    { id: 1, project: 'ecommerce-frontend', script: 'checkout-flow.spec.ts', status: 'Passed', passed: 8, failed: 0, total: 8, duration: 48000, started: '2024-05-15T10:30:00Z', report: true },
    { id: 2, project: 'payment-api', script: 'orders-api.spec.ts', status: 'Failed', passed: 5, failed: 2, total: 7, duration: 32000, started: '2024-05-15T09:45:00Z', report: true },
    { id: 3, project: 'auth-service', script: 'auth-login.spec.ts', status: 'Passed', passed: 6, failed: 0, total: 6, duration: 42000, started: '2024-05-14T16:20:00Z', report: true },
    { id: 4, project: 'notification-service', script: 'email-service.spec.ts', status: 'Failed', passed: 3, failed: 4, total: 7, duration: 55000, started: '2024-05-14T14:10:00Z', report: true },
    { id: 5, project: 'inventory-api', script: 'stock-api.spec.ts', status: 'Passed', passed: 12, failed: 0, total: 12, duration: 67000, started: '2024-05-14T10:55:00Z', report: true },
  ];

  const statusIcons = {
    Passed: <HiOutlineCheckCircle className="text-emerald-400 text-lg" />,
    Failed: <HiOutlineXCircle className="text-rose-400 text-lg" />,
    Running: <HiOutlineClock className="text-indigo-400 text-lg animate-spin" />,
  };

  const statusColors = {
    Passed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Failed: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Running: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };

  const filtered = executions.filter((e) => {
    const matchSearch = e.project.toLowerCase().includes(search.toLowerCase()) ||
      e.script.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Execution History</h1>
        <p className="text-white/60">View and manage past test executions</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-60 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
          <input
            type="text"
            placeholder="Search executions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Passed', 'Failed', 'Running'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Executions List */}
      <div className="space-y-3">
        {filtered.map((exec, i) => (
          <motion.div
            key={exec.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/50 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                {statusIcons[exec.status]}
                <div>
                  <p className="font-semibold text-white">{exec.script}</p>
                  <p className="text-sm text-white/40">{exec.project}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[exec.status]}`}>
                  {exec.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <HiOutlineCheckCircle className="text-emerald-400 text-sm" />
                  <span className="text-white/60">Passed: <span className="text-emerald-400 font-semibold">{exec.passed}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineXCircle className="text-rose-400 text-sm" />
                  <span className="text-white/60">Failed: <span className="text-rose-400 font-semibold">{exec.failed}</span></span>
                </div>
                <span className="text-white/40">Total: {exec.total}</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-white/40 text-xs">{formatRelativeTime(exec.started)}</span>
                <span className="text-white/60 font-mono text-sm">{formatDuration(exec.duration)}</span>
                {exec.report && (
                  <button className="p-1.5 rounded-lg bg-white/10 hover:bg-indigo-500/20 text-white/60 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <HiOutlineClock className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No executions found</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
        {[
          { label: 'Total Executions', value: executions.length },
          { label: 'Success Rate', value: `${Math.round((executions.filter((e) => e.status === 'Passed').length / executions.length) * 100)}%` },
          { label: 'Avg Duration', value: formatDuration(executions.reduce((a, b) => a + b.duration, 0) / executions.length) },
          { label: 'Total Tests', value: executions.reduce((a, b) => a + b.total, 0) },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <p className="text-2xl font-bold text-indigo-400">{stat.value}</p>
            <p className="text-sm text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
