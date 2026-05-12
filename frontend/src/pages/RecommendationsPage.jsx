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
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
          <RiRobot2Line className="text-xl text-[#818CF8]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">AI Recommendations</h2>
          <p className="text-xs text-[#94A3B8]">ML-powered insights from your codebase analysis</p>
        </div>
      </motion.div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'High Risk Functions', value: '4', icon: HiOutlineExclamation, color: '#EF4444' },
          { label: 'Edge Cases Found', value: '41', icon: HiOutlineLightningBolt, color: '#F59E0B' },
          { label: 'AI Insights', value: '12', icon: RiRobot2Line, color: '#6366F1' },
          { label: 'Auto-Fixed', value: '8', icon: HiOutlineShieldCheck, color: '#10B981' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-[#1E293B]/60 border border-[#334155]/50 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
              <card.icon style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#F8FAFC]">{card.value}</p>
              <p className="text-[11px] text-[#64748B]">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Insights */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">AI Insights</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {insights.map((ins, i) => (
              <AIInsightCard key={i} {...ins} delay={i * 0.06} />
            ))}
          </div>
        </div>

        {/* Edge Case Predictions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Edge Case Predictions</h3>
          <div className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5 space-y-3">
            {predictions.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#E2E8F0]">{p.label}</span>
                  <span className="text-xs font-semibold text-[#818CF8]">{p.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#0F172A] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(p.count / 25) * 100}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#818CF8]" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* High Risk Table */}
          <div className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#334155]/50">
              <h3 className="text-xs font-semibold text-[#F8FAFC]">High-Risk Functions</h3>
            </div>
            <div className="divide-y divide-[#334155]/30">
              {highRiskFunctions.map((fn, i) => (
                <div key={i} className="px-4 py-3 hover:bg-[#334155]/20 transition-colors cursor-pointer">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-mono font-medium text-[#E2E8F0]">{fn.name}</span>
                    <span className={`text-[10px] font-bold ${fn.risk > 80 ? 'text-[#EF4444]' : fn.risk > 60 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>{fn.risk}%</span>
                  </div>
                  <p className="text-[10px] text-[#64748B] font-mono">{fn.file} · {fn.edgeCases} edge cases · {fn.confidence}% confidence</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
