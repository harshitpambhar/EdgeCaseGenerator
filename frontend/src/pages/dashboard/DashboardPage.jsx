import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineBeaker, HiOutlineCode, HiOutlineChartBar, HiOutlineLightningBolt, HiOutlineClock, HiOutlineArrowRight, HiOutlineCloudUpload, HiOutlineDocumentReport } from 'react-icons/hi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import AnalyticsCard from '../../components/dashboard/AnalyticsCard';
import RepoCard from '../../components/dashboard/RepoCard';
import CoverageChart from '../../components/dashboard/CoverageChart';
import { useAuth } from '../../context/AuthContext';
import { jobService, getErrorMessage } from '../../services/api';
import { formatRelativeTime } from '../../utils/formatting';

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
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.email) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    jobService.getByUser(user.email)
      .then(({ data }) => setJobs(Array.isArray(data) ? data : []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const parsedJobs = useMemo(() => jobs.map((job) => {
    let parsed = null;
    if (job.resultJson) {
      try { parsed = JSON.parse(job.resultJson); } catch { parsed = null; }
    }
    return { ...job, parsedResult: parsed };
  }), [jobs]);

  const stats = useMemo(() => {
    const totalRepos = parsedJobs.length;
    let totalTests = 0;
    let coverageSum = 0;
    let coverageCount = 0;
    let riskAlerts = 0;

    parsedJobs.forEach((job) => {
      const result = job.parsedResult;
      const tests = Array.isArray(result?.generated_tests) ? result.generated_tests.length : 0;
      totalTests += tests;
      const coverage = result?.coverage?.coverage_percent;
      if (typeof coverage === 'number') {
        coverageSum += coverage;
        coverageCount += 1;
      }
      const risks = Array.isArray(result?.risk_analysis) ? result.risk_analysis : [];
      riskAlerts += risks.filter((r) => r?.risk_level && r.risk_level !== 'LOW').length;
    });

    const avgCoverage = coverageCount > 0 ? Math.round(coverageSum / coverageCount) : 0;
    return { totalRepos, totalTests, avgCoverage, riskAlerts };
  }, [parsedJobs]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return days.map((d) => {
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayKey = d.toDateString();
      const dayJobs = parsedJobs.filter((job) => job.createdAt && new Date(job.createdAt).toDateString() === dayKey);
      const tests = dayJobs.reduce((sum, job) => {
        const count = Array.isArray(job.parsedResult?.generated_tests) ? job.parsedResult.generated_tests.length : 0;
        return sum + count;
      }, 0);
      const dayCoverage = dayJobs.reduce((sum, job) => {
        const cov = job.parsedResult?.coverage?.coverage_percent;
        return typeof cov === 'number' ? sum + cov : sum;
      }, 0);
      const coverageCount = dayJobs.reduce((sum, job) => {
        const cov = job.parsedResult?.coverage?.coverage_percent;
        return typeof cov === 'number' ? sum + 1 : sum;
      }, 0);
      const coverage = coverageCount ? Math.round(dayCoverage / coverageCount) : 0;

      return { name: label, tests, coverage };
    });
  }, [parsedJobs]);

  const coverageBreakdown = useMemo(() => {
    const completed = parsedJobs.filter((job) => job.status === 'COMPLETED');
    if (completed.length === 0) return [
      { name: 'Fully Covered', value: 0 },
      { name: 'Partial', value: 0 },
      { name: 'Uncovered', value: 0 },
    ];
    let full = 0;
    let partial = 0;
    let low = 0;
    completed.forEach((job) => {
      const cov = job.parsedResult?.coverage?.coverage_percent;
      if (typeof cov !== 'number') return;
      if (cov >= 80) full += 1;
      else if (cov >= 50) partial += 1;
      else low += 1;
    });
    const total = full + partial + low || 1;
    return [
      { name: 'Fully Covered', value: Math.round((full / total) * 100) },
      { name: 'Partial', value: Math.round((partial / total) * 100) },
      { name: 'Uncovered', value: Math.round((low / total) * 100) },
    ];
  }, [parsedJobs]);

  const recentRepos = useMemo(() => {
    return [...parsedJobs]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4)
      .map((job) => {
        const repoName = (job.repoUrl || '').replace(/\.git$/, '').split('/').pop() || job.repoUrl || 'Unknown';
        const languages = job.parsedResult?.languages_detected || [];
        const coverage = job.parsedResult?.coverage?.coverage_percent;
        const riskList = Array.isArray(job.parsedResult?.risk_analysis) ? job.parsedResult.risk_analysis : [];
        const riskLevel = riskList.some((r) => r?.risk_level === 'HIGH')
          ? 'High'
          : riskList.some((r) => r?.risk_level === 'MEDIUM')
            ? 'Medium'
            : 'Low';
        return {
          name: repoName,
          language: languages[0] || 'Unknown',
          coverage: typeof coverage === 'number' ? Math.round(coverage) : 0,
          risk: riskLevel,
          lastAnalyzed: job.createdAt ? formatRelativeTime(job.createdAt) : 'Unknown',
        };
      });
  }, [parsedJobs]);

  const activity = useMemo(() => {
    const entries = [...parsedJobs]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
      .slice(0, 5)
      .map((job) => {
        const repoName = (job.repoUrl || '').replace(/\.git$/, '').split('/').pop() || job.repoUrl || 'Repository';
        const time = job.updatedAt || job.createdAt;
        if (job.status === 'COMPLETED') {
          return { time: formatRelativeTime(time), text: `Analysis completed for ${repoName}`, type: 'success' };
        }
        if (job.status === 'FAILED') {
          return { time: formatRelativeTime(time), text: `Analysis failed for ${repoName}`, type: 'error' };
        }
        if (job.status === 'RUNNING') {
          return { time: formatRelativeTime(time), text: `Analysis running for ${repoName}`, type: 'info' };
        }
        return { time: formatRelativeTime(time), text: `Job queued for ${repoName}`, type: 'warning' };
      });
    return entries;
  }, [parsedJobs]);

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

      {loading && (
        <div className="text-xs text-white/40">Loading your dashboard...</div>
      )}
      {!loading && error && (
        <div className="text-xs text-rose-400">{error}</div>
      )}

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
        <AnalyticsCard title="Tests generated" value={stats.totalTests.toLocaleString()} icon={HiOutlineBeaker} color="indigo" delay={0} />
        <AnalyticsCard title="Repositories" value={stats.totalRepos.toLocaleString()} icon={HiOutlineCode} color="blue" delay={0.05} />
        <AnalyticsCard title="Avg coverage" value={`${stats.avgCoverage}%`} icon={HiOutlineChartBar} color="emerald" delay={0.1} />
        <AnalyticsCard title="Risk alerts" value={stats.riskAlerts.toLocaleString()} icon={HiOutlineLightningBolt} color="rose" delay={0.15} />
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
            <CoverageChart data={coverageBreakdown} centerValue={`${stats.avgCoverage}%`} />
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
            {recentRepos.map((r, i) => <RepoCard key={`${r.name}-${i}`} {...r} delay={i * 0.05} />)}
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
            {!loading && activity.length === 0 && (
              <p className="text-xs text-white/40">No activity yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
