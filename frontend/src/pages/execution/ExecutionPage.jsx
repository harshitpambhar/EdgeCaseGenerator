import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlinePlay, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineClock, HiOutlineRefresh, HiOutlineArrowRight,
} from 'react-icons/hi';
import { RiLoader4Line } from 'react-icons/ri';

const executions = [
  { id: 'e1', project: 'ecommerce-frontend', script: 'checkout-flow.spec.ts', status: 'Running', passed: 5, failed: 0, total: 8, duration: '1m 23s', started: '2 min ago' },
  { id: 'e2', project: 'ecommerce-frontend', script: 'auth-login.spec.ts', status: 'Passed', passed: 6, failed: 0, total: 6, duration: '48s', started: '15 min ago' },
  { id: 'e3', project: 'auth-service', script: 'auth-api.spec.ts', status: 'Failed', passed: 2, failed: 2, total: 4, duration: '32s', started: '3 hrs ago' },
  { id: 'e4', project: 'payment-api', script: 'orders-api.spec.ts', status: 'Queued', passed: 0, failed: 0, total: 7, duration: '—', started: 'Pending' },
];

const logLines = [
  { time: '14:32:01', level: 'info', msg: 'Starting Playwright execution: checkout-flow.spec.ts' },
  { time: '14:32:02', level: 'info', msg: 'Browser: Chromium 120.0.0 launched' },
  { time: '14:32:03', level: 'pass', msg: '✓ should complete checkout with valid card (8.2s)' },
  { time: '14:32:11', level: 'pass', msg: '✓ should show cart count after adding product (1.4s)' },
  { time: '14:32:13', level: 'pass', msg: '✓ should navigate to checkout from cart (2.1s)' },
  { time: '14:32:15', level: 'pass', msg: '✓ should validate shipping address fields (1.8s)' },
  { time: '14:32:17', level: 'pass', msg: '✓ should accept valid card number (0.9s)' },
  { time: '14:32:18', level: 'running', msg: '→ Running: should reject expired card...' },
];

const statusStyle = {
  Running: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  Passed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Failed: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Queued: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const logStyle = {
  info: 'text-white/40',
  pass: 'text-emerald-400',
  fail: 'text-rose-400',
  running: 'text-indigo-400',
};

export default function ExecutionPage() {
  const [logs, setLogs] = useState(logLines.slice(0, 5));
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logs.length >= logLines.length) return;
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, logLines[prev.length]]);
    }, 1200);
    return () => clearTimeout(timer);
  }, [logs]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const running = executions.find(e => e.status === 'Running');

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Test Executions</h2>
          <p className="text-sm text-white/40 mt-0.5">Live execution monitoring and history</p>
        </div>
        <Link to="/automation"
          className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-2">
          <HiOutlinePlay className="text-sm" /> New execution
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total runs', value: '312', color: 'text-white' },
          { label: 'Passed', value: '278', color: 'text-emerald-400' },
          { label: 'Failed', value: '34', color: 'text-rose-400' },
          { label: 'Pass rate', value: '89%', color: 'text-indigo-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/30 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Execution queue */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-white">Execution queue</p>
          <div className="space-y-2">
            {executions.map((exec, i) => (
              <motion.div key={exec.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-white/[0.1] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-white font-mono">{exec.script}</p>
                    <p className="text-xs text-white/30 mt-0.5">{exec.project}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle[exec.status]}`}>
                      {exec.status === 'Running' && (
                        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-block mr-1">●</motion.span>
                      )}
                      {exec.status}
                    </span>
                    {exec.status === 'Failed' && (
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors border-none cursor-pointer">
                        <HiOutlineRefresh className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span className="text-emerald-400">{exec.passed} passed</span>
                  {exec.failed > 0 && <span className="text-rose-400">{exec.failed} failed</span>}
                  <span>{exec.total} total</span>
                  <span className="ml-auto flex items-center gap-1"><HiOutlineClock className="text-xs" />{exec.started}</span>
                </div>
                {exec.status !== 'Queued' && (
                  <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(exec.passed / exec.total) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${exec.status === 'Failed' ? 'bg-gradient-to-r from-emerald-500 to-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'}`}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live logs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Live logs</p>
            {running && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-400">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                  <RiLoader4Line className="text-sm" />
                </motion.div>
                Running
              </div>
            )}
          </div>
          <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="text-xs text-white/25 ml-2 font-mono">execution.log</span>
            </div>
            <div className="p-4 h-72 overflow-y-auto font-mono text-xs space-y-1.5">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3">
                    <span className="text-white/20 flex-shrink-0">{log.time}</span>
                    <span className={logStyle[log.level]}>{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          </div>
          <Link to="/reports/failures/e3"
            className="no-underline flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/15 hover:border-rose-500/25 transition-colors group">
            <div>
              <p className="text-xs font-medium text-rose-400">View failure analysis</p>
              <p className="text-[11px] text-white/30 mt-0.5">auth-api.spec.ts — 2 assertions failed</p>
            </div>
            <HiOutlineArrowRight className="text-rose-400/60 group-hover:text-rose-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
