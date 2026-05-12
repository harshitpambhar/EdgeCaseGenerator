import { motion } from 'framer-motion';
import { HiOutlineExclamation, HiOutlineShieldCheck, HiOutlineShieldExclamation } from 'react-icons/hi';

const riskItems = [
  { func: 'processPayment()', file: 'payment/handler.py', risk: 95, level: 'Critical' },
  { func: 'authenticateUser()', file: 'auth/service.js', risk: 82, level: 'High' },
  { func: 'parseXMLInput()', file: 'utils/parser.ts', risk: 74, level: 'High' },
  { func: 'handleFileUpload()', file: 'upload/controller.go', risk: 56, level: 'Medium' },
  { func: 'validateSchema()', file: 'validation/index.js', risk: 32, level: 'Low' },
];

export default function RiskPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#334155]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineShieldExclamation className="text-[#F59E0B] text-lg" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Risk Analysis</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-[#EF4444]/10 text-[#F87171] font-medium">
          {riskItems.filter(r => r.risk > 70).length} Critical
        </span>
      </div>

      <div className="divide-y divide-[#334155]/30">
        {riskItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="px-5 py-3 hover:bg-[#334155]/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {item.risk > 70 ? (
                  <HiOutlineExclamation className="text-[#EF4444] text-sm" />
                ) : (
                  <HiOutlineShieldCheck className="text-[#10B981] text-sm" />
                )}
                <span className="text-sm font-mono font-medium text-[#F8FAFC] group-hover:text-[#818CF8] transition-colors">
                  {item.func}
                </span>
              </div>
              <span className={`text-xs font-semibold ${
                item.risk > 80 ? 'text-[#EF4444]' : item.risk > 60 ? 'text-[#F59E0B]' : 'text-[#10B981]'
              }`}>
                {item.risk}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748B] font-mono">{item.file}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                item.level === 'Critical' ? 'bg-[#EF4444]/10 text-[#F87171]' :
                item.level === 'High' ? 'bg-[#F59E0B]/10 text-[#FBBF24]' :
                item.level === 'Medium' ? 'bg-[#6366F1]/10 text-[#818CF8]' :
                'bg-[#10B981]/10 text-[#34D399]'
              }`}>
                {item.level}
              </span>
            </div>
            {/* Risk bar */}
            <div className="mt-2 h-1 rounded-full bg-[#0F172A] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.risk}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                className={`h-full rounded-full ${
                  item.risk > 80 ? 'bg-[#EF4444]' : item.risk > 60 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
