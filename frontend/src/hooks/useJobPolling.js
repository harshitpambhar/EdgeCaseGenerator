import { useState, useEffect, useRef, useCallback } from 'react';
import { jobService } from '../services/api';

const TERMINAL = ['COMPLETED', 'FAILED'];

/**
 * Polls GET /api/jobs/:id every `intervalMs` milliseconds.
 * Stops automatically when status is COMPLETED or FAILED.
 *
 * @param {string|null} jobId  - UUID of the job to poll (null = disabled)
 * @param {number}      intervalMs - polling interval (default 3000)
 */
export function useJobPolling(jobId, intervalMs = 3000) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const activeRef = useRef(false);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    try {
      const { data } = await jobService.getById(jobId);
      setJob(data);
      setError(null);
      if (TERMINAL.includes(data.status)) {
        activeRef.current = false;
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch job status');
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    activeRef.current = true;
    setLoading(true);

    fetchJob().finally(() => setLoading(false));

    timerRef.current = setInterval(() => {
      if (!activeRef.current) {
        clearInterval(timerRef.current);
        return;
      }
      fetchJob();
    }, intervalMs);

    return () => {
      activeRef.current = false;
      clearInterval(timerRef.current);
    };
  }, [jobId, intervalMs, fetchJob]);

  const refresh = useCallback(() => fetchJob(), [fetchJob]);

  return { job, loading, error, refresh };
}
