import { motion } from 'framer-motion';
import { HiOutlineExclamation, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineTrendingUp } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import AIInsightCard from '../components/AIInsightCard';
import RiskPanel from '../components/RiskPanel';

const highRiskFunctions = [
  { name: 'processPayment()', file: 'payment/handler.py', risk: 95, edgeCases: 12, confidence: 97 },
  { name: 'authenticateUser()', file: 'auth/service.js', risk: 82, edgeCases: 8, confidence: 91 },
  { name: 'parseXMLInput()', file: 'utils/parser.ts', risk: 74, edgeCases: 15, confidence: 88 },
  { name: 'handleFileUpload()', file: 'upload/controller.go', risk: 56, edgeCases: 6, confidence: 85 },
];

const insights = [
  { title: 'Null Pointer Risk', description: 'processPayment() does not validate card parameter before accessing properties. Add null-check guard clause.', confidence: 97, type: 'warning' },
  { title: 'SQL Injection Vector', description: 'buildQuery() in models.py uses string concatenation instead of parameterized queries.', confidence: 94, type: 'warning' },
  { title: 'Race Condition', description: 'Concurrent calls to updateBalance() may cause inconsistent state. Consider mutex or transaction.', confidence: 89, type: 'insight' },
  { title: 'Missing Boundary Test', description: 'validateAge() does not test boundary values: 0, -1, MAX_INT. Auto-generated 4 edge cases.', confidence: 92, type: 'improvement' },
  { title: 'Error Handling Gap', description: 'connectDB() catch block swallows exceptions silently. Add proper logging and retry logic.', confidence: 86, type: 'warning' },
  { title: 'Performance Optimization', description: 'fetchRecords() can benefit from pagination. Current implementation loads all records into memory.', confidence: 78, type: 'improvement' },
];

const predictions = [
  { label: 'Null pointer exceptions', count: 23 },
  { label: 'Off-by-one errors', count: 15 },
  { label: 'Concurrency issues', count: 8 },
  { label: 'Type mismatches', count: 12 },
  { label: 'Resource leaks', count: 6 },
];

export default function RecommendationsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          <RiRobot2Line className="text-2xl text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-black font-heading text-white tracking-tighter uppercase">Intelligence Core</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Insights Synchronized</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Critical Vulnerabilities', value: '4', icon: HiOutlineExclamation, color: '#f43f5e' },
          { label: 'Edge Case Matrix', value: '41', icon: HiOutlineLightningBolt, color: '#f59e0b' },
          { label: 'Neural Insights', value: '12', icon: RiRobot2Line, color: '#22d3ee' },
          { label: 'Autonomous Patches', value: '8', icon: HiOutlineShieldCheck, color: '#10B981' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-[2rem] glass-panel border-white/5 p-6 bg-[#07111f]/40 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5" style={{ color: card.color }}>
                <card.icon className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-black font-heading text-white tracking-tighter">{card.value}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Insights */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest px-2">Neural Analysis Feed</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {insights.map((ins, i) => (
              <AIInsightCard key={i} {...ins} delay={i * 0.06} />
            ))}
          </div>
        </div>

        {/* Edge Case Predictions */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest px-2">Anomaly Predictions</h3>
            <div className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#050816]/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-3xl" />
              <div className="space-y-6 relative z-10">
                {predictions.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.label}</span>
                      <span className="text-xs font-black font-mono text-cyan-400">{p.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(p.count / 25) * 100}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* High Risk Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest px-2">High-Risk Nodes</h3>
            <div className="rounded-[2.5rem] glass-panel border-white/5 overflow-hidden bg-[#07111f]/40">
              <div className="divide-y divide-white/5">
                {highRiskFunctions.map((fn, i) => (
                  <div key={i} className="px-8 py-5 hover:bg-white/[0.03] transition-all cursor-pointer group">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-black font-mono text-slate-200 group-hover:text-cyan-400 transition-colors">{fn.name}</span>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                        fn.risk > 80 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                        fn.risk > 60 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {fn.risk}% RISK
                      </div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-600 font-mono uppercase tracking-tighter group-hover:text-slate-400 transition-colors">
                      {fn.file} · {fn.edgeCases} EDGE CASES · {fn.confidence}% CONFIDENCE
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
