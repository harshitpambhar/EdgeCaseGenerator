import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlinePlay, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineClock, HiOutlineRefresh, HiOutlineArrowRight,
  HiOutlineTrash,
} from 'react-icons/hi';
import { RiLoader4Line } from 'react-icons/ri';
import { AlertCircle } from 'lucide-react';
import { jobService, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime, formatDateTime } from '../../utils/formatting';
import { COLOR_BY_STATUS } from '../../constants/status_values';

// Map backend status strings to the keys used in COLOR_BY_STATUS
const normalizeStatus = (s) => {
  const map = { QUEUED: 'Queued', RUNNING: 'Running', COMPLETED: 'Completed', FAILED: 'Failed' };
  return map[s] ?? s;
};

const POLL_INTERVAL = 4000; // ms

function StatusBadge({ status }) {
  const display = normalizeStatus(status);
  const cls = COLOR_BY_STATUS[display] ?? 'text-white/40 bg-white/[0.04] border-white/[0.08]';
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${cls}`}>
      {status === 'RUNNING' && (
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
      )}
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
    <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

export default function ExecutionPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // The job ID stored by UploadPage after creation
  const lastJobId = sessionStorage.getItem('lastJobId');

  const fetchAll = useCallback(async () => {
    if (!user?.email) return;
    try {
      const { data } = await jobService.getByUser(user.email);
      setJobs(Array.isArray(data) ? data : []);
      setListError(null);
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setLoadingList(false);
    }
  }, [user?.email]);

  // Initial load
  useEffect(() => {
    if (user?.email) {
      fetchAll();
    }
  }, [fetchAll, user?.email]);

  // Poll while any job is still active
  useEffect(() => {
    if (!user?.email) return;
    const hasActive = jobs.some(j => j.status === 'QUEUED' || j.status === 'RUNNING');
    if (!hasActive) return;
    const timer = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [jobs, fetchAll, user?.email]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await jobService.remove(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      if (lastJobId === id) sessionStorage.removeItem('lastJobId');
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Stats derived from real data
  const total = jobs.length;
  const completed = jobs.filter(j => j.status === 'COMPLETED').length;
  const failed = jobs.filter(j => j.status === 'FAILED').length;
  const running = jobs.filter(j => j.status === 'RUNNING' || j.status === 'QUEUED').length;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Executions</h2>
          <p className="text-sm text-white/40 mt-0.5">Repository analysis jobs — live status tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <HiOutlineRefresh className="text-sm" />
          </button>
          <Link
            to="/upload"
            className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-2"
          >
            <HiOutlinePlay className="text-sm" /> New job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total jobs', value: total, color: 'text-white' },
          { label: 'Completed', value: completed, color: 'text-emerald-400' },
          { label: 'Failed', value: failed, color: 'text-rose-400' },
          { label: 'Active', value: running, color: 'text-indigo-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <p className={`text-2xl font-semibold ${s.color}`}>{loadingList ? '—' : s.value}</p>
            <p className="text-xs text-white/30 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Error banner */}
      {listError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {listError}
          <button onClick={fetchAll} className="ml-auto text-xs underline cursor-pointer bg-transparent border-none text-rose-400">Retry</button>
        </div>
      )}

      {/* Job list */}
      {loadingList ? (
        <div className="flex items-center justify-center py-20 gap-3 text-white/30">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <RiLoader4Line className="text-xl" />
          </motion.div>
          <span className="text-sm">Loading jobs…</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-white/30 text-sm">No jobs yet.</p>
          <Link to="/upload" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm no-underline transition-colors">
            Analyze a repository <HiOutlineArrowRight />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Job queue</p>
          <AnimatePresence initial={false}>
            {jobs.map((job, i) => {
              const isNew = job.id === lastJobId;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/executions/${job.id}`)}
                  className={`rounded-xl border p-4 cursor-pointer transition-colors hover:border-white/[0.12] ${
                    isNew
                      ? 'bg-indigo-500/5 border-indigo-500/25'
                      : 'bg-white/[0.03] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white font-mono truncate">{job.repoUrl}</p>
                      <p className="text-[11px] text-white/30 mt-0.5 font-mono">{job.id}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={job.status} />
                      <button
                        onClick={(e) => handleDelete(job.id, e)}
                        disabled={deletingId === job.id}
                        className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-rose-500/10 hover:text-rose-400 flex items-center justify-center text-white/20 transition-colors border-none cursor-pointer disabled:opacity-40"
                        title="Delete job"
                      >
                        {deletingId === job.id
                          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><RiLoader4Line className="text-xs" /></motion.div>
                          : <HiOutlineTrash className="text-xs" />
                        }
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="text-xs" />
                      {formatRelativeTime(job.createdAt)}
                    </span>
                    {job.completedAt && (
                      <span className="text-white/20">Completed {formatRelativeTime(job.completedAt)}</span>
                    )}
                    {job.status === 'COMPLETED' && (
                      <span
                        onClick={(e) => { e.stopPropagation(); navigate(`/reports?jobId=${job.id}`); }}
                        className="ml-auto flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        View report <HiOutlineArrowRight className="text-xs" />
                      </span>
                    )}
                  </div>

                  <ProgressBar status={job.status} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
