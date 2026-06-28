import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Target, Globe, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { jobService, getErrorMessage } from '../../services/api';

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

  const coverageSummary = useMemo(() => {
    let coverageSum = 0;
    let coverageCount = 0;
    let coveredFunctions = 0;
    let uncoveredFunctions = 0;
    parsedJobs.forEach((job) => {
      const coverage = job.parsedResult?.coverage;
      const percent = coverage?.coverage_percent;
      if (typeof percent === 'number') {
        coverageSum += percent;
        coverageCount += 1;
      }
      if (typeof coverage?.covered_functions_count === 'number') {
        coveredFunctions += coverage.covered_functions_count;
      } else if (Array.isArray(coverage?.covered_functions)) {
        coveredFunctions += coverage.covered_functions.length;
      }
      if (typeof coverage?.uncovered_functions_count === 'number') {
        uncoveredFunctions += coverage.uncovered_functions_count;
      } else if (Array.isArray(coverage?.uncovered_functions)) {
        uncoveredFunctions += coverage.uncovered_functions.length;
      }
    });

    const avgCoverage = coverageCount ? Math.round(coverageSum / coverageCount) : 0;
    return {
      avgCoverage,
      coveredFunctions,
      uncoveredFunctions,
      reposWithCoverage: coverageCount,
    };
  }, [parsedJobs]);

  const repoCoverage = useMemo(() => {
    return parsedJobs
      .map((job) => {
        const repoName = (job.repoUrl || '').replace(/\.git$/, '').split('/').pop() || job.repoUrl || 'Repository';
        const coverage = job.parsedResult?.coverage?.coverage_percent;
        return {
          name: repoName,
          coverage: typeof coverage === 'number' ? Math.round(coverage) : 0,
        };
      })
      .sort((a, b) => b.coverage - a.coverage)
      .slice(0, 7);
  }, [parsedJobs]);

  const pieData = useMemo(() => {
    const covered = coverageSummary.coveredFunctions;
    const uncovered = coverageSummary.uncoveredFunctions;
    const total = covered + uncovered || 1;
    return [
      { name: 'Covered', value: Math.round((covered / total) * 100), color: '#22c55e' },
      { name: 'Uncovered', value: Math.round((uncovered / total) * 100), color: '#ef4444' },
    ];
  }, [coverageSummary]);

  const untestedModules = useMemo(() => {
    const modules = [];
    parsedJobs.forEach((job) => {
      const list = job.parsedResult?.coverage?.uncovered_functions;
      if (Array.isArray(list)) {
        list.forEach((name) => modules.push(name));
      }
    });
    const unique = Array.from(new Set(modules));
    return unique.slice(0, 6).map((name) => {
      const lowered = name.toLowerCase();
      const risk = lowered.includes('auth') || lowered.includes('payment') || lowered.includes('security')
        ? 'High'
        : lowered.includes('user') || lowered.includes('account') || lowered.includes('order')
          ? 'Medium'
          : 'Low';
      return {
        module: name,
        type: 'Function',
        risk,
        suggestion: `Add tests for ${name}`,
      };
    });
  }, [parsedJobs]);

  const coverageMetrics = useMemo(() => ([
    { name: 'Avg Coverage', coverage: coverageSummary.avgCoverage, tested: coverageSummary.coveredFunctions, total: coverageSummary.coveredFunctions + coverageSummary.uncoveredFunctions, icon: Target },
    { name: 'Covered Functions', coverage: coverageSummary.coveredFunctions, tested: coverageSummary.coveredFunctions, total: coverageSummary.coveredFunctions + coverageSummary.uncoveredFunctions, icon: Activity },
    { name: 'Uncovered Functions', coverage: coverageSummary.uncoveredFunctions, tested: coverageSummary.uncoveredFunctions, total: coverageSummary.coveredFunctions + coverageSummary.uncoveredFunctions, icon: Globe },
    { name: 'Repos with Coverage', coverage: coverageSummary.reposWithCoverage, tested: coverageSummary.reposWithCoverage, total: parsedJobs.length, icon: Zap },
  ]), [coverageSummary, parsedJobs.length]);

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

      {loading && (
        <div className="text-xs text-white/40">Loading coverage data...</div>
      )}
      {!loading && error && (
        <div className="text-xs text-rose-400">{error}</div>
      )}

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
                <span className="text-2xl font-bold text-white">
                  {metric.name === 'Avg Coverage' ? `${metric.coverage}%` : metric.coverage}
                </span>
              </div>
              <p className="text-xs text-white/40 mb-2">{metric.name}</p>
              <p className="text-xs text-white/30">
                {metric.total ? `${metric.tested} / ${metric.total}` : 'No data'}
              </p>
              <div className="h-1.5 rounded-full bg-white/[0.05] mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metric.name === 'Avg Coverage' ? metric.coverage : metric.total ? (metric.tested / metric.total) * 100 : 0}%` }}
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
          <h3 className="text-sm font-semibold text-white mb-4">Repository Coverage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={repoCoverage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 11, opacity: 0.5 }} />
              <YAxis tick={{ fill: '#fff', fontSize: 11, opacity: 0.5 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="coverage" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {!loading && repoCoverage.length === 0 && (
            <p className="text-xs text-white/40 mt-3">No coverage data yet.</p>
          )}
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
              <span className="text-white/60">Covered: {pieData[0].value}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-white/60">Uncovered: {pieData[1].value}%</span>
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
          {!loading && untestedModules.length === 0 && (
            <p className="text-xs text-white/40">No uncovered functions reported yet.</p>
          )}
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
