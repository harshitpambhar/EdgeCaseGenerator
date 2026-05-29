import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Terminal, Copy, Check, Clock, RefreshCw, AlertCircle,
  PlayCircle, FileText, Activity, Server, Box, ExternalLink
} from 'lucide-react';
import { useJobPolling } from '../../hooks/useJobPolling';
import { jobService, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime, formatDateTime } from '../../utils/formatting';
import { COLOR_BY_STATUS } from '../../constants/status_values';

const normalizeStatus = (s) => {
  const map = { QUEUED: 'Queued', RUNNING: 'Running', COMPLETED: 'Completed', FAILED: 'Failed' };
  return map[s] ?? s;
};

function StatusBadge({ status }) {
  const display = normalizeStatus(status);
  const cls = COLOR_BY_STATUS[display] ?? 'text-white/40 bg-white/[0.04] border-white/[0.08]';
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${cls}`}>
      {status === 'RUNNING' && (
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
      )}
      {display}
    </span>
  );
}

// Vertical Timeline Component
function VerticalTimeline({ job }) {
  const isFailed = job.status === 'FAILED';
  const isRunning = job.status === 'RUNNING';
  const isCompleted = job.status === 'COMPLETED';

  // Determine stage active/completion status
  const stages = [
    {
      key: 'queued',
      title: 'Job Queued',
      description: 'Waiting for worker allocation',
      icon: Clock,
      time: job.createdAt,
      isActive: job.status === 'QUEUED',
      isDone: job.status !== 'QUEUED',
      isError: false,
    },
    {
      key: 'container',
      title: 'Worker Container Started',
      description: job.containerId ? `Container ID: ${job.containerId.substring(0, 12)}` : 'Initializing environment',
      icon: Box,
      time: job.startedAt,
      isActive: isRunning && job.containerStatus !== 'EXITED',
      isDone: !!job.startedAt && job.containerStatus === 'EXITED',
      isError: false,
    },
    {
      key: 'execution',
      title: 'Repository Analysis',
      description: 'Cloning repo and extracting edge cases',
      icon: Terminal,
      time: job.startedAt,
      isActive: isRunning,
      isDone: isCompleted || isFailed,
      isError: false,
    },
    {
      key: 'result',
      title: isFailed ? 'Analysis Failed' : 'Analysis Completed',
      description: isFailed ? job.errorMessage : 'Results successfully generated',
      icon: isFailed ? AlertCircle : Check,
      time: job.completedAt,
      isActive: false,
      isDone: isCompleted || isFailed,
      isError: isFailed,
    }
  ];

  return (
    <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/[0.08] before:to-transparent">
      {stages.map((stage, idx) => {
        // Only show stages that have been reached
        if (!stage.isDone && !stage.isActive && stage.key === 'result') return null;

        const Icon = stage.icon;
        const colorClass = stage.isError 
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
          : stage.isActive 
            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
            : stage.isDone 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-white/[0.02] text-white/30 border-white/[0.05]';

        return (
          <motion.div 
            key={stage.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex items-start gap-4"
          >
            {/* Timeline Node */}
            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border ${colorClass} bg-[#0a0a0a] shadow-sm shrink-0`}>
              {stage.isActive && !stage.isError ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.div>
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pt-1.5 ${!stage.isDone && !stage.isActive ? 'opacity-50' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <h4 className={`text-sm font-medium ${stage.isError ? 'text-rose-400' : 'text-white'}`}>
                  {stage.title}
                </h4>
                {stage.time && (
                  <span className="text-[11px] text-white/30 whitespace-nowrap">
                    {formatDateTime(stage.time)}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 leading-relaxed max-w-md">
                {stage.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Main Report Component
export default function ReportsDashboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');

  const { job, loading, error, refresh } = useJobPolling(jobId, 3000);
  
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const logsEndRef = useRef(null);

  // For the empty state (no jobId selected)
  const [recentJobs, setRecentJobs] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [testPage, setTestCasePage] = useState(1);
  const TEST_PAGE_SIZE = 10;

  useEffect(() => {
    setTestCasePage(1);
  }, [jobId]);

  useEffect(() => {
    if (!jobId && user?.email) {
      setLoadingRecent(true);
      jobService.getByUser(user.email)
        .then(({ data }) => setRecentJobs(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoadingRecent(false));
    }
  }, [jobId, user?.email]);

  // Auto-scroll logs to bottom if running
  useEffect(() => {
    if (job?.status === 'RUNNING' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [job?.logs, job?.status]);

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------------------------------------------------------------------------
  // Empty State View (No Job Selected)
  // ---------------------------------------------------------------------------
  if (!jobId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div>
          <h2 className="text-xl font-semibold text-white">Execution Reports</h2>
          <p className="text-sm text-white/40 mt-0.5">Select an execution job to view its detailed report and logs.</p>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-sm font-medium text-white">Recent Executions</h3>
          </div>
          
          {loadingRecent ? (
            <div className="p-8 text-center text-white/40 text-sm">Loading recent jobs...</div>
          ) : recentJobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-white/30 text-sm">No analysis jobs found.</p>
              <button 
                onClick={() => navigate('/upload')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-transparent border-none"
              >
                Start a new analysis →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentJobs.slice(0, 10).map(j => (
                <div key={j.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-sm text-white font-medium">{j.repoUrl}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40">
                      <span>{formatRelativeTime(j.createdAt)}</span>
                      <span className="font-mono text-[10px]">{j.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={j.status} />
                    <button 
                      onClick={() => setSearchParams({ jobId: j.id })}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium transition-colors cursor-pointer border-none"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Loading & Error States
  // ---------------------------------------------------------------------------
  if (loading && !job) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-white/40">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw className="w-6 h-6" />
        </motion.div>
        <span className="text-sm">Loading execution report...</span>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-2">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-rose-400 text-sm">{error}</p>
        <button 
          onClick={refresh} 
          className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-sm transition-colors border-none cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!job) return null;

  // ---------------------------------------------------------------------------
  // Derived Data
  // ---------------------------------------------------------------------------
  let parsedResult = null;
  let parsedResultWithoutLogs = null;
  if (job.resultJson) {
    try { 
      parsedResult = JSON.parse(job.resultJson); 
      if (parsedResult && typeof parsedResult === 'object') {
        const { logs, ...rest } = parsedResult;
        parsedResultWithoutLogs = rest;
      }
    } catch { /* ignore */ }
  }

  const logLines = job.logs ? job.logs.split('\n') : [];
  
  let durationStr = '—';
  if (job.startedAt && job.completedAt) {
    const ms = new Date(job.completedAt) - new Date(job.startedAt);
    durationStr = ms < 1000 ? '< 1s' : `${(ms / 1000).toFixed(1)}s`;
  } else if (job.startedAt && job.status === 'RUNNING') {
    durationStr = 'Running...';
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/executions')}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              title="Back to executions"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-400" />
              {job.repoUrl.replace('https://github.com/', '')}
            </h2>
            <StatusBadge status={job.status} />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 pl-10 text-xs text-white/40">
            <div className="flex items-center gap-1.5 font-mono">
              ID: {job.id.substring(0, 8)}...
              <button 
                onClick={() => copyToClipboard(job.id, setCopiedId)}
                className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(job.createdAt)}
            </span>
            {durationStr !== '—' && (
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Duration: {durationStr}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.status === 'FAILED' && (
            <button 
              onClick={() => navigate('/upload')}
              className="h-9 px-4 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors border-none cursor-pointer flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Retry Analysis
            </button>
          )}
          <button
            onClick={refresh}
            className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Timeline & Metadata */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Vertical Execution Timeline */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
            <h3 className="text-sm font-medium text-white mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-white/40" />
              Execution Pipeline
            </h3>
            <VerticalTimeline job={job} />
          </div>

          {/* Metadata Card */}
          {job.containerId && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-white/40" />
                Environment Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Container ID</p>
                  <p className="text-xs font-mono text-white/70 break-all">{job.containerId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Status</p>
                  <p className="text-xs text-white/70">{job.containerStatus || 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Terminal Logs & Results */}
        <div className="space-y-6 lg:col-span-2">

          {/* Terminal Style Logs Viewer */}
          <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden flex flex-col h-[400px]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-[#111]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-white/40 ml-2 font-mono flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  execution.log
                </span>
              </div>
              <button 
                onClick={() => copyToClipboard(job.logs || '', setCopiedLogs)}
                className="text-white/30 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1"
                title="Copy Logs"
              >
                {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-white/60 custom-scrollbar">
              {job.logs ? (
                logLines.map((line, i) => (
                  <div key={i} className={`min-h-[1.25rem] ${line.includes('ERROR') ? 'text-rose-400' : line.includes('STEP') ? 'text-indigo-300 font-semibold' : ''}`}>
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-white/20 italic">Waiting for logs...</div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Scan Results / Error Section */}
          {job.status === 'FAILED' && job.errorMessage && (
            <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-5">
              <h3 className="text-sm font-medium text-rose-400 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                Execution Failed
              </h3>
              <p className="text-sm text-rose-300/80 font-mono whitespace-pre-wrap">{job.errorMessage}</p>
            </div>
          )}

          {job.status === 'COMPLETED' && (
            <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 p-5 space-y-6">
              
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
                <h3 className="text-sm font-medium text-indigo-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  End-to-End Execution Report
                </h3>
                <span className="text-[10px] font-mono text-indigo-400/50 uppercase tracking-wider">
                  Finalizing Status: 100% Complete
                </span>
              </div>

              {/* Comprehensive Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col justify-between">
                  <p className="text-xs text-white/40 mb-2">Total Logs</p>
                  <p className="text-lg font-semibold text-white">{logLines.length}</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col justify-between">
                  <p className="text-xs text-white/40 mb-2">Duration</p>
                  <p className="text-lg font-semibold text-white">{durationStr}</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col justify-between">
                  <p className="text-xs text-white/40 mb-2">Target Repo</p>
                  <p className="text-xs font-mono text-white/80 truncate" title={job.repoUrl}>
                    {job.repoUrl.split('/').slice(-2).join('/')}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col justify-between">
                  <p className="text-xs text-white/40 mb-2">Pipeline Status</p>
                  <p className="text-lg font-semibold text-emerald-400">Success</p>
                </div>
              </div>

              {/* Dynamic Result Data Parsing */}
              {parsedResult ? (
                <div className="space-y-6">
                  {parsedResult.generated_tests && parsedResult.generated_tests.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        Generated Test Cases ({parsedResult.generated_tests.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {(() => {
                          const allTests = parsedResult.generated_tests || [];
                          const totalTests = allTests.length;
                          const totalTestPages = Math.ceil(totalTests / TEST_PAGE_SIZE);
                          const paginatedTests = allTests.slice((testPage - 1) * TEST_PAGE_SIZE, testPage * TEST_PAGE_SIZE);

                          return (
                            <>
                              {paginatedTests.map((test, idx) => {
                                const realIdx = (testPage - 1) * TEST_PAGE_SIZE + idx;
                                return (
                                  <div key={realIdx} className="rounded-lg bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
                                      <div>
                                        <p className="text-xs font-medium text-emerald-400 font-mono mb-1">{test.test_name}</p>
                                        <p className="text-[10px] text-white/40 font-mono">
                                          Target: {test.function} | Framework: {test.framework}
                                        </p>
                                      </div>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                        {test.language}
                                      </span>
                                    </div>
                                    <div className="p-4 bg-[#0a0a0a]">
                                      {test.condition && (
                                        <p className="text-xs text-white/50 mb-3 pb-3 border-b border-white/[0.05]">
                                          <span className="text-white/30 uppercase tracking-wider text-[10px] mr-2">Condition:</span>
                                          <code className="px-1.5 py-0.5 rounded bg-white/[0.04] text-amber-200/70">{test.condition}</code>
                                        </p>
                                      )}
                                      <pre className="text-[11px] text-white/70 font-mono overflow-x-auto custom-scrollbar">
                                        {test.code}
                                      </pre>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Pagination Controls */}
                              {totalTestPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
                                  <p className="text-xs text-white/30">
                                    Showing {(testPage - 1) * TEST_PAGE_SIZE + 1}–{Math.min(testPage * TEST_PAGE_SIZE, totalTests)} of {totalTests} test cases
                                  </p>
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => setTestCasePage(p => Math.max(1, p - 1))}
                                        disabled={testPage === 1}
                                        className="w-14 h-8 rounded-lg text-xs font-medium transition-all border-none cursor-pointer disabled:opacity-30 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center"
                                      >
                                        Prev
                                      </button>
                                      <button
                                        onClick={() => setTestCasePage(p => Math.min(totalTestPages, p + 1))}
                                        disabled={testPage === totalTestPages}
                                        className="w-14 h-8 rounded-lg text-xs font-medium transition-all border-none cursor-pointer disabled:opacity-30 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center"
                                      >
                                        Next
                                      </button>
                                    </div>
                                    <p className="text-[10px] text-white/30">Page {testPage} of {totalTestPages}</p>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-white/60">Structured Output Data</p>
                      <div className="rounded-lg bg-[#0a0a0a] border border-white/[0.05] overflow-hidden">
                        <div className="px-4 py-2 border-b border-white/[0.05] bg-white/[0.02]">
                          <p className="text-[10px] font-mono text-white/40">JSON Payload</p>
                        </div>
                        <pre className="p-4 text-[11px] text-white/60 font-mono overflow-x-auto leading-relaxed custom-scrollbar">
                          {JSON.stringify(parsedResultWithoutLogs || parsedResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-white/50">No structured JSON result data was captured for this execution.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
