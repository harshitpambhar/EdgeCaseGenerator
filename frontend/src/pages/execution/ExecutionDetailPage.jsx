import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft, HiOutlineClock, HiOutlineRefresh,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowRight,
} from 'react-icons/hi';
import { RiLoader4Line } from 'react-icons/ri';
import { useJobPolling } from '../../hooks/useJobPolling';
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
      {status === 'COMPLETED' && <HiOutlineCheckCircle className="text-sm" />}
      {status === 'FAILED' && <HiOutlineXCircle className="text-sm" />}
      {display}
    </span>
  );
}

function ProgressBar({ status }) {
  const pct = { QUEUED: 5, RUNNING: 55, COMPLETED: 100, FAILED: 100 }[status] ?? 0;
  const color = status === 'FAILED'
    ? 'bg-gradient-to-r from-rose-500 to-rose-400'
    : status === 'COMPLETED'
      ? 'bg-gradient-to-r from-indigo-500 to-emerald-500'
      : 'bg-gradient-to-r from-indigo-500 to-indigo-400';
  return (
    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

const STAGES = [
  { key: 'QUEUED',    label: 'Job queued',          desc: 'Waiting for a worker container' },
  { key: 'RUNNING',   label: 'Container running',   desc: 'Cloning repo and scanning files' },
  { key: 'COMPLETED', label: 'Analysis complete',   desc: 'Results ready' },
];

function PipelineStages({ status }) {
  const order = ['QUEUED', 'RUNNING', 'COMPLETED'];
  const currentIdx = order.indexOf(status === 'FAILED' ? 'RUNNING' : status);
  return (
    <div className="space-y-2">
      {STAGES.map((stage, idx) => {
        const done = idx < currentIdx || status === 'COMPLETED';
        const active = idx === currentIdx && status !== 'FAILED';
        const failed = status === 'FAILED' && idx === 1;
        return (
          <motion.div
            key={stage.key}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: done || active || failed ? 1 : 0.4 }}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              failed ? 'bg-rose-500/5 border-rose-500/20'
              : active ? 'bg-indigo-500/10 border-indigo-500/20'
              : done ? 'bg-emerald-500/5 border-emerald-500/15'
              : 'bg-white/[0.02] border-white/[0.05]'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
              failed ? 'bg-rose-500 text-white'
              : done ? 'bg-emerald-500 text-white'
              : active ? 'bg-indigo-400/50 text-indigo-100'
              : 'bg-white/[0.08] text-white/40'
            }`}>
              {failed ? '✕' : done ? '✓' : idx + 1}
            </div>
            <div>
              <p className={`text-xs font-medium ${done || active ? 'text-white' : 'text-white/50'}`}>{stage.label}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{stage.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ExecutionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { job, loading, error, refresh } = useJobPolling(id, 3000);

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-white/30">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RiLoader4Line className="text-xl" />
        </motion.div>
        <span className="text-sm">Loading job…</span>
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
  let parsedResultWithoutLogs = null;
  if (job.resultJson) {
    try { 
      parsedResult = JSON.parse(job.resultJson); 
      if (parsedResult && typeof parsedResult === 'object') {
        const { logs, ...rest } = parsedResult;
        parsedResultWithoutLogs = rest;
      }
    } catch { /* raw string */ }
  }

  const logLines = parsedResult?.logs
    ? parsedResult.logs.split('\n').filter(Boolean)
    : [];
  const rawResultJson = parsedResultWithoutLogs ?? parsedResult ?? job.resultJson;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8">
      {/* Back */}
      <button
        onClick={() => navigate('/executions')}
        className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
      >
        <HiOutlineArrowLeft /> Back to executions
      </button>

      {/* Header card */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-white truncate">{job.repoUrl}</p>
            <p className="text-xs text-white/30 mt-1 font-mono">{job.id}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={job.status} />
            <button
              onClick={refresh}
              className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors border-none cursor-pointer"
              title="Refresh"
            >
              <HiOutlineRefresh className="text-sm" />
            </button>
          </div>
        </div>

        <ProgressBar status={job.status} />

        <div className="flex flex-wrap gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1">
            <HiOutlineClock className="text-xs" /> Created {formatRelativeTime(job.createdAt)}
          </span>
          <span className="text-white/15">{formatDateTime(job.createdAt)}</span>
          {job.completedAt && (
            <span className="flex items-center gap-1">
              Completed {formatRelativeTime(job.completedAt)}
            </span>
          )}
          {job.containerId && (
            <span className="font-mono text-white/20 truncate max-w-[200px]" title={job.containerId}>
              Container: {job.containerId.slice(0, 12)}
            </span>
          )}
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-3">
        <p className="text-sm font-medium text-white">Execution pipeline</p>
        <PipelineStages status={job.status} />
      </div>

      {/* Error message */}
      {job.status === 'FAILED' && job.errorMessage && (
        <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-4 space-y-1">
          <p className="text-xs font-medium text-rose-400">Error details</p>
          <pre className="text-xs text-rose-300/70 whitespace-pre-wrap font-mono leading-relaxed">{job.errorMessage}</pre>
        </div>
      )}

      {/* Result logs */}
      {job.status === 'COMPLETED' && logLines.length > 0 && (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.06] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            <span className="text-xs text-white/25 ml-2 font-mono">scan-output.log</span>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto font-mono text-xs space-y-1">
            {logLines.map((line, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                className={`${line.startsWith('===') ? 'text-indigo-400 font-semibold' : 'text-white/50'}`}>
                {line}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Raw result JSON (collapsed) */}
      {job.resultJson && (
        <details className="rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
          <summary className="px-4 py-3 text-xs text-white/40 cursor-pointer hover:text-white/60 transition-colors select-none">
            Raw result JSON
          </summary>
          <pre className="px-4 pb-4 text-[11px] text-white/30 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {JSON.stringify(rawResultJson, null, 2)}
          </pre>
        </details>
      )}

      {/* CTA to reports */}
      {job.status === 'COMPLETED' && (
        <Link
          to={`/reports?jobId=${job.id}`}
          className="no-underline flex items-center justify-between p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 hover:border-indigo-500/35 transition-colors group"
        >
          <div>
            <p className="text-sm font-medium text-indigo-300">View full report</p>
            <p className="text-xs text-white/30 mt-0.5">See scan results and analysis</p>
          </div>
          <HiOutlineArrowRight className="text-indigo-400/60 group-hover:text-indigo-400 transition-colors" />
        </Link>
      )}
    </div>
  );
}
