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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[2rem] glass-panel overflow-hidden border-white/5"
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <HiOutlineShieldExclamation className="text-cyan-400 text-xl animate-pulse-neon" />
          <h3 className="text-sm font-black font-heading text-white uppercase tracking-widest">Risk Analysis</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
            {riskItems.filter(r => r.risk > 70).length} Critical
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {riskItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="px-6 py-4 hover:bg-white/[0.03] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.risk > 70 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                <span className="text-sm font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.func}
                </span>
              </div>
              <span className={`text-xs font-black font-mono ${
                item.risk > 80 ? 'text-rose-400' : item.risk > 60 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {item.risk}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest">{item.file}</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border ${
                item.level === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                item.level === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                item.level === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {item.level}
              </span>
            </div>
            {/* Risk bar */}
            <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.risk}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${
                  item.risk > 80 ? 'from-rose-500 to-rose-700' : 
                  item.risk > 60 ? 'from-amber-500 to-amber-700' : 
                  'from-emerald-500 to-emerald-700'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
