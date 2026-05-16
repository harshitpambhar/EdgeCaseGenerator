import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineXCircle, HiOutlineLightningBolt, HiOutlineRefresh } from 'react-icons/hi';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';

const failures = [
  {
    id: 'f1',
    test: 'should reject expired card',
    script: 'checkout-flow.spec.ts',
    error: 'AssertionError: Expected element [data-testid="card-error"] to contain text "expired" but got "Invalid card"',
    stack: `at checkout-flow.spec.ts:42:5
  at PlaywrightTestRunner.runTest (runner.js:218:12)
  at async Promise.all (index 0)`,
    aiSuggestion: 'The error message returned by the payment API differs from what the test expects. Update the assertion to match "Invalid card" or fix the API to return "expired" for expired cards.',
    group: 'Assertion Mismatch',
  },
  {
    id: 'f2',
    test: 'should validate JWT token expiry',
    script: 'auth-api.spec.ts',
    error: 'TimeoutError: Waiting for response from /api/auth/refresh exceeded 5000ms',
    stack: `at auth-api.spec.ts:67:3
  at PlaywrightTestRunner.runTest (runner.js:218:12)`,
    aiSuggestion: 'The auth refresh endpoint is timing out. This may indicate a backend issue with token refresh logic or a network timeout. Consider increasing the timeout or investigating the /api/auth/refresh endpoint performance.',
    group: 'Timeout',
  },
];

const groupColors = {
  'Assertion Mismatch': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Timeout': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Network Error': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
};

export default function FailureAnalysisPage() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState({ f1: true, f2: false });

  return (
    <div className="max-w-3xl space-y-5 pb-8">
      <div className="flex items-center gap-2 text-xs text-white/30">
        <Link to="/reports" className="hover:text-white/60 transition-colors no-underline">Reports</Link>
        <span>/</span>
        <span className="text-white/60">Failure Analysis</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Failure Analysis</h2>
          <p className="text-sm text-white/40 mt-0.5">{failures.length} failures detected · auth-service execution</p>
        </div>
        <button className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors cursor-pointer border-none flex items-center gap-2">
          <HiOutlineRefresh className="text-sm" /> Retry failed
        </button>
      </div>

      {/* Failure groups summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Assertion Mismatch', count: 1 },
          { label: 'Timeout', count: 1 },
          { label: 'Network Error', count: 0 },
        ].map((g, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <p className="text-2xl font-semibold text-white">{g.count}</p>
            <p className="text-xs text-white/30 mt-1">{g.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Failures */}
      <div className="space-y-3">
        {failures.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <button onClick={() => setExpanded(prev => ({ ...prev, [f.id]: !prev[f.id] }))}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer bg-transparent border-none text-left">
              <HiOutlineXCircle className="text-rose-400 text-base flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{f.test}</p>
                <p className="text-xs text-white/30 mt-0.5 font-mono">{f.script}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${groupColors[f.group]}`}>{f.group}</span>
              {expanded[f.id] ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
            </button>

            {expanded[f.id] && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-white/[0.06] space-y-4 p-5">
                {/* Error */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Error message</p>
                  <div className="rounded-lg bg-rose-500/5 border border-rose-500/15 p-3">
                    <p className="text-xs text-rose-400 font-mono leading-relaxed">{f.error}</p>
                  </div>
                </div>

                {/* Stack trace */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Stack trace</p>
                  <div className="rounded-lg bg-[#0a0a0a] border border-white/[0.06] p-3">
                    <pre className="text-xs text-white/40 font-mono leading-relaxed whitespace-pre-wrap">{f.stack}</pre>
                  </div>
                </div>

                {/* AI suggestion */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                  <Brain className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-indigo-300 mb-1">AI suggestion</p>
                    <p className="text-xs text-white/50 leading-relaxed">{f.aiSuggestion}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
