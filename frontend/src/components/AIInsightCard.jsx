import { motion } from 'framer-motion';
import { HiOutlineLightningBolt, HiOutlineTrendingUp, HiOutlineSparkles } from 'react-icons/hi';

export default function AIInsightCard({ title, description, confidence, type = 'insight', delay = 0 }) {
  const typeConfig = {
    insight: { icon: HiOutlineSparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    warning: { icon: HiOutlineLightningBolt, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    improvement: { icon: HiOutlineTrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  };

  const config = typeConfig[type] || typeConfig.insight;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-3xl glass-card border ${config.border} p-5 group cursor-pointer relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${config.bg}`} />
      
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`text-2xl ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black font-heading text-white group-hover:text-cyan-400 transition-colors truncate uppercase tracking-tight">{title}</h4>
            {confidence && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 flex-shrink-0 ml-2">
                <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-tighter">
                  {confidence}% CONF
                </span>
              </div>
            )}
          </div>
          <p className="text-xs font-medium text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
