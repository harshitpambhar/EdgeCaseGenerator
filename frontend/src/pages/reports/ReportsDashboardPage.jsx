import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, ArrowRight, ExternalLink } from 'lucide-react';
import { HiOutlineDocumentText, HiOutlineCode, HiOutlineDownload, HiOutlineEye, HiOutlineClock } from 'react-icons/hi';
import { jobService, getErrorMessage } from '../../services/api';
import { formatRelativeTime, formatDateTime } from '../../utils/formatting';
import { COLOR_BY_STATUS } from '../../constants/status_values';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const executionTrend = [
  { name: 'Mon', passed: 42, failed: 8 },
  { name: 'Tue', passed: 58, failed: 5 },
  { name: 'Wed', passed: 71, failed: 12 },
  { name: 'Thu', passed: 84, failed: 6 },
  { name: 'Fri', passed: 76, failed: 9 },
  { name: 'Sat', passed: 91, failed: 4 },
  { name: 'Sun', passed: 98, failed: 3 },
];

const coverageData = [
  { name: 'Routes', coverage: 89 },
  { name: 'Components', coverage: 84 },
  { name: 'APIs', coverage: 76 },
  { name: 'Workflows', coverage: 91 },
];

const riskInsights = [
  { project: 'auth-service', risk: 'High', issue: 'Unhandled JWT expiry edge case' },
  { project: 'payment-api', risk: 'High', issue: 'Missing retry logic on payment timeout' },
  { project: 'ecommerce-frontend', risk: 'Medium', issue: 'Cart state race condition on rapid clicks' },
  { project: 'notification-service', risk: 'Low', issue: 'Email template missing fallback content' },
];

const reportHistory = [
  { name: 'ecommerce-frontend-report', date: '2026-05-14', format: 'PDF', coverage: '84%', status: 'Ready' },
  { name: 'payment-api-analysis', date: '2026-05-13', format: 'HTML', coverage: '71%', status: 'Ready' },
  { name: 'auth-service-failures', date: '2026-05-12', format: 'JSON', coverage: '58%', status: 'Ready' },
  { name: 'admin-dashboard-full', date: '2026-05-11', format: 'PDF', coverage: '92%', status: 'Ready' },
];

const riskStyle = {
  High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const normalizeStatus = (s) => {
  const map = { QUEUED: 'Queued', RUNNING: 'Running', COMPLETED: 'Completed', FAILED: 'Failed' };
  return map[s] ?? s;
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg bg-[#111] border border-white/10 shadow-xl text-xs">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function ReportsDashboardPage() {
  const [searchParams] = useSearchParams();
  const highlightJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  useEffect(() => {
    jobService.getAll()
      .then(({ data }) => setJobs(Array.isArray(data) ? data.filter(j => j.status === 'COMPLETED' || j.status === 'FAILED') : []))
      .catch(err => setJobsError(getErrorMessage(err)))
      .finally(() => setJobsLoading(false));
  }, []);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Reports</h2>
          <p className="text-sm text-white/40 mt-0.5">Execution analytics, coverage, and AI risk insights.</p>
        </div>
        <button className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent flex items-center gap-2">
          <Download className="w-4 h-4" /> Export all
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total executions', value: '312', sub: '+28 this week' },
          { label: 'Pass rate', value: '89%', sub: '+3.2%' },
          { label: 'Avg coverage', value: '76%', sub: '+5.1%' },
          { label: 'AI risks found', value: '47', sub: '12 critical' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className="text-2xl font-semibold text-white">{s.value}</p>
            <p className="text-xs text-emerald-400 mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <p className="text-sm font-medium text-white mb-1">Execution trend</p>
          <p className="text-xs text-white/30 mb-4">Pass vs fail — last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={executionTrend}>
              <defs>
                <linearGradient id="gPass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="passed" name="Passed" stroke="#10b981" strokeWidth={2} fill="url(#gPass)" />
              <Area type="monotone" dataKey="failed" name="Failed" stroke="#f43f5e" strokeWidth={2} fill="url(#gFail)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <p className="text-sm font-medium text-white mb-1">Coverage by category</p>
          <p className="text-xs text-white/30 mb-4">Across all projects</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={coverageData} barSize={28}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="coverage" name="Coverage %" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Job Service Results */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Repository analysis jobs</p>
            <p className="text-xs text-white/30 mt-0.5">Results from Job Service</p>
          </div>
          <Link to="/executions" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors no-underline flex items-center gap-1">
            All jobs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {jobsLoading ? (
          <div className="px-5 py-8 text-center text-white/30 text-sm">Loading…</div>
        ) : jobsError ? (
          <div className="px-5 py-6 text-center text-rose-400 text-sm">{jobsError}</div>
        ) : jobs.length === 0 ? (
          <div className="px-5 py-8 text-center space-y-2">
            <p className="text-white/30 text-sm">No completed jobs yet.</p>
            <Link to="/upload" className="text-xs text-indigo-400 hover:text-indigo-300 no-underline transition-colors">Analyze a repository →</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {jobs.map((job) => {
              const display = normalizeStatus(job.status);
              const cls = COLOR_BY_STATUS[display] ?? 'text-white/40 bg-white/[0.04] border-white/[0.08]';
              const isHighlighted = job.id === highlightJobId;
              let parsedResult = null;
              if (job.resultJson) { try { parsedResult = JSON.parse(job.resultJson); } catch { /* ignore */ } }
              const fileCount = parsedResult?.logs
                ? (parsedResult.logs.match(/\/workspace\/repo\//g) || []).length
                : null;

              return (
                <div key={job.id} className={`px-5 py-4 hover:bg-white/[0.02] transition-colors ${
                  isHighlighted ? 'bg-indigo-500/5' : ''
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 font-mono truncate">{job.repoUrl}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                        <span className="flex items-center gap-1"><HiOutlineClock className="text-xs" />{formatRelativeTime(job.createdAt)}</span>
                        {fileCount !== null && <span>{fileCount} files scanned</span>}
                        <span className="font-mono text-white/15 truncate max-w-[120px]">{job.id.slice(0, 8)}…</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>{display}</span>
                      <Link
                        to={`/executions/${job.id}`}
                        className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors no-underline"
                        title="View details"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* AI risk insights */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white">AI risk insights</p>
          <Link to="/projects" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors no-underline flex items-center gap-1">
            View projects <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {riskInsights.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-3 flex-1">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${riskStyle[r.risk]}`}>{r.risk}</span>
                <span className="text-xs text-white/50 font-mono flex-shrink-0">{r.project}</span>
                <span className="text-xs text-white/40">{r.issue}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Report history */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <p className="text-sm font-medium text-white">Report history</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Name', 'Date', 'Format', 'Coverage', 'Status', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-xs font-medium text-white/30 text-left ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {reportHistory.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5"><span className="text-sm text-white/70 font-mono group-hover:text-white transition-colors">{row.name}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-white/40">{row.date}</span></td>
                  <td className="px-5 py-3.5"><span className="text-[11px] px-2 py-0.5 rounded bg-white/[0.06] text-white/40 font-mono">{row.format}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs font-medium text-emerald-400">{row.coverage}</span></td>
                  <td className="px-5 py-3.5"><span className="text-[11px] px-2.5 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium">{row.status}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors border-none cursor-pointer">
                        <HiOutlineEye className="text-sm" />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors border-none cursor-pointer">
                        <HiOutlineDownload className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
