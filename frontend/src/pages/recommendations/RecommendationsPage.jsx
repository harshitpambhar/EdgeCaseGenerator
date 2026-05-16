import { motion } from 'framer-motion';
import { HiOutlineExclamation, HiOutlineShieldCheck, HiOutlineLightningBolt } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import AIInsightCard from '../../components/dashboard/AIInsightCard';

const highRiskFunctions = [
  { name: 'processPayment()', file: 'payment/handler.py', risk: 95, edgeCases: 12, confidence: 97 },
  { name: 'authenticateUser()', file: 'auth/service.js', risk: 82, edgeCases: 8, confidence: 91 },
  { name: 'parseXMLInput()', file: 'utils/parser.ts', risk: 74, edgeCases: 15, confidence: 88 },
  { name: 'handleFileUpload()', file: 'upload/controller.go', risk: 56, edgeCases: 6, confidence: 85 },
];

const insights = [
  { title: 'Null pointer risk', description: 'processPayment() does not validate the card parameter before accessing its properties. Add a null-check guard clause.', confidence: 97, type: 'warning' },
  { title: 'SQL injection', description: 'buildQuery() in models.py uses string concatenation instead of parameterized queries.', confidence: 94, type: 'warning' },
  { title: 'Race condition', description: 'Concurrent calls to updateBalance() may cause inconsistent state. Consider using a mutex or transaction.', confidence: 89, type: 'insight' },
  { title: 'Missing boundary tests', description: 'validateAge() does not test boundary values: 0, -1, MAX_INT. 4 edge cases were auto-generated.', confidence: 92, type: 'improvement' },
  { title: 'Silent error handling', description: 'connectDB() catch block swallows exceptions silently. Add proper logging and retry logic.', confidence: 86, type: 'warning' },
  { title: 'Memory usage', description: 'fetchRecords() loads all records into memory. Consider adding pagination for large datasets.', confidence: 78, type: 'improvement' },
];

const predictions = [
  { label: 'Null pointer exceptions', count: 23 },
  { label: 'Off-by-one errors', count: 15 },
  { label: 'Type mismatches', count: 12 },
  { label: 'Concurrency issues', count: 8 },
  { label: 'Resource leaks', count: 6 },
];

const stats = [
  { label: 'Critical issues', value: '4', icon: HiOutlineExclamation, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { label: 'Edge cases found', value: '41', icon: HiOutlineLightningBolt, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'AI suggestions', value: '12', icon: RiRobot2Line, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Auto-fixable', value: '8', icon: HiOutlineShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function RecommendationsPage() {
  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        <p className="text-sm text-white/40 mt-0.5">Recommendations and risk analysis from the AI engine.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`text-sm ${s.color}`} />
              </div>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
            <p className="text-2xl font-semibold text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Insight cards */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-sm font-medium text-white">Findings</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {insights.map((ins, i) => <AIInsightCard key={i} {...ins} delay={i * 0.05} />)}
          </div>
        </div>

        <div className="space-y-4">
          {/* Predictions */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <p className="text-sm font-medium text-white mb-4">Predicted issues</p>
            <div className="space-y-4">
              {predictions.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/50">{p.label}</span>
                    <span className="text-xs font-medium text-white/70">{p.count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.count / 25) * 100}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                      className="h-full rounded-full bg-indigo-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* High-risk functions */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium text-white">High-risk functions</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {highRiskFunctions.map((fn, i) => (
                <div key={i} className="px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-white/70 group-hover:text-white transition-colors">{fn.name}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      fn.risk > 80 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      fn.risk > 60 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                     'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>{fn.risk}%</span>
                  </div>
                  <p className="text-[11px] text-white/25 font-mono">{fn.file} · {fn.edgeCases} edge cases</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
