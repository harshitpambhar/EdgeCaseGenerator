import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineCode, HiOutlinePlay, HiOutlineLightningBolt,
  HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineArrowRight,
  HiOutlineClock, HiOutlineRefresh
} from 'react-icons/hi';
import { RiLoader4Line } from 'react-icons/ri';
import { Globe, GitBranch, Layers, Shield, FileText, Activity, AlertCircle } from 'lucide-react';
import { useJobPolling } from '../../hooks/useJobPolling';
import { jobService } from '../../services/api';
import { COLOR_BY_STATUS } from '../../constants/status_values';

function extractRepoName(url) {
  if (!url) return 'Unknown Project';
  try {
    const parts = url.replace(/\.git$/, '').split('/');
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
}

const riskStyle = {
  High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const normalizeStatus = (s) => {
  const map = { QUEUED: 'Queued', RUNNING: 'Running', COMPLETED: 'Completed', FAILED: 'Failed' };
  return map[s] ?? s;
};

export default function ProjectOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { job, loading, error, refresh } = useJobPolling(id, 3000);

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-white/30">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RiLoader4Line className="text-xl" />
        </motion.div>
        <span className="text-sm">Loading project analysis...</span>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error}</p>
        <button onClick={refresh} className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer bg-transparent border-none">Retry</button>
      </div>
    );
  }

  if (!job) return null;

  let parsedResult = null;
  if (job.resultJson) {
    try { parsedResult = JSON.parse(job.resultJson); } catch { /* raw string */ }
  }

  const projName = extractRepoName(job.repoUrl);
  const isCompleted = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';
  const isRunning = job.status === 'RUNNING';
  const isQueued = job.status === 'QUEUED';

  // Dynamic values
  const totalFiles = parsedResult?.files?.length || 0;
  const languagesDetected = parsedResult?.languages_detected || [];
  const primaryLang = languagesDetected[0] || 'Unknown';
  const functionsCount = parsedResult?.functions_detected || 0;
  const testCases = parsedResult?.generated_tests || [];
  const testCasesCount = testCases.length;
  const coveragePercent = parsedResult?.coverage?.coverage_percent ? Math.round(parsedResult.coverage.coverage_percent) : 0;
  const risks = parsedResult?.risk_analysis || [];
  const recommendations = parsedResult?.recommendations || [];

  // Stages of pipeline
  const workflowSteps = [
    { label: 'Upload', done: true, active: false },
    { label: 'AI Analysis', done: isCompleted || isFailed, active: isRunning },
    { label: 'Workflow Detection', done: isCompleted || isFailed, active: isRunning },
    { label: 'Test Generation', done: isCompleted, active: isRunning && testCasesCount > 0 },
    { label: 'Script Generation', done: isCompleted, active: isRunning && testCasesCount > 0 },
    { label: 'Execution', done: isCompleted, active: isRunning },
    { label: 'Report', done: isCompleted, active: false },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/projects" className="text-xs text-white/30 hover:text-white/60 transition-colors no-underline">Projects</Link>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs text-white/60">{projName}</span>
          </div>
          <h2 className="text-xl font-semibold text-white">{projName}</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {primaryLang} project · {languagesDetected.join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Link to={`/reports?jobId=${job.id}`} className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors no-underline flex items-center gap-2">
              <FileText className="w-4 h-4" /> View Report
            </Link>
          )}
          <Link to="/upload" className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-2">
            <HiOutlinePlay className="text-sm" /> Run New Job
          </Link>
        </div>
      </div>

      {/* Main Status & Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Files', value: totalFiles },
          { label: 'Languages', value: languagesDetected.length },
          { label: 'Functions', value: functionsCount },
          { label: 'Test Cases', value: testCasesCount },
          { label: 'Risks Mapped', value: risks.length },
          { label: 'Recs', value: recommendations.length },
          { label: 'Coverage', value: `${coveragePercent}%` },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-semibold text-white">{s.value}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Pipeline visualization */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white">Pipeline status</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${COLOR_BY_STATUS[normalizeStatus(job.status)] || 'text-white/40 bg-white/5 border-white/10'}`}>
            {normalizeStatus(job.status)}
          </span>
        </div>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {workflowSteps.map((step, i) => {
            const isDone = step.done;
            const isActive = step.active;
            const failed = isFailed && i === 1;

            return (
              <div key={i} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                    failed ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : isDone ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : isActive ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 animate-pulse'
                    : 'bg-white/5 border-white/10 text-white/20'
                  }`}>
                    {failed ? <HiOutlineExclamationCircle className="text-sm" />
                     : isDone ? <HiOutlineCheckCircle className="text-sm" />
                     : isActive ? <RiLoader4Line className="text-sm animate-spin" />
                     : <span className="text-[10px] font-bold">{i + 1}</span>
                    }
                  </div>
                  <span className={`text-[10px] whitespace-nowrap ${failed ? 'text-rose-400' : isDone ? 'text-white/70' : isActive ? 'text-indigo-300' : 'text-white/30'}`}>
                    {step.label}
                  </span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className={`w-8 h-px mx-1 flex-shrink-0 mb-4 transition-colors ${
                    isDone ? 'bg-emerald-500/20' : isActive ? 'bg-indigo-500/20' : 'bg-white/[0.04]'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Body */}
      {isCompleted ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Detected structure */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-4">
            <p className="text-sm font-medium text-white">Detected structure</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Languages</p>
                  <p className="text-xs text-white/40 mt-0.5">{languagesDetected.join(', ') || 'Auto-detected'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Functions Scanned</p>
                  <p className="text-xs text-white/40 mt-0.5">{functionsCount} functions parsed successfully</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <GitBranch className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Test Cases Generated</p>
                  <p className="text-xs text-white/40 mt-0.5">{testCasesCount} total test cases generated across {languagesDetected.length} components</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI risks */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineLightningBolt className="text-amber-400 text-sm" />
              <p className="text-sm font-medium text-white">AI-detected risks</p>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {risks.length > 0 ? (
                risks.map((risk, i) => {
                  const severity = risk.risk_level ? risk.risk_level.charAt(0).toUpperCase() + risk.risk_level.slice(1).toLowerCase() : 'Low';
                  const style = riskStyle[severity] || 'text-white/40 bg-white/5 border-white/10';

                  return (
                    <div key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-xs text-white/60 flex-1 truncate" title={risk.name}>{risk.name}: {risk.recommendation}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${style}`}>{severity}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-white/20 text-xs">No significant risks detected in this project.</div>
              )}
            </div>
          </motion.div>
        </div>
      ) : isFailed ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-5 space-y-2">
          <h3 className="text-sm font-medium text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Analysis Execution Failed
          </h3>
          <p className="text-xs text-rose-300/80 font-mono whitespace-pre-wrap">{job.errorMessage || 'Unknown error occurred during analysis.'}</p>
        </motion.div>
      ) : (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
            <RiLoader4Line className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Project analysis in progress</h3>
            <p className="text-xs text-white/30 mt-1 max-w-sm mx-auto">
              Our AI pipeline is currently cloning and analyzing your repository. You can watch live logs on the execution details page.
            </p>
          </div>
          <Link to={`/executions/${job.id}`} className="inline-flex h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline items-center gap-2">
            View Live Execution <HiOutlineArrowRight />
          </Link>
        </div>
      )}

      {/* Coverage bar */}
      {isCompleted && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Coverage summary</p>
            <Link to={`/reports?jobId=${job.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors no-underline flex items-center gap-1">
              Full report <HiOutlineArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Overall coverage', value: coveragePercent },
              { label: 'Covered functions', value: parsedResult?.coverage?.covered_functions_count || 0, isCount: true },
              { label: 'Uncovered functions', value: parsedResult?.coverage?.uncovered_functions_count || 0, isCount: true },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/40">{item.label}</span>
                  <span className="text-xs font-medium text-emerald-400">{item.isCount ? item.value : `${item.value}%`}</span>
                </div>
                {!item.isCount && (
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}