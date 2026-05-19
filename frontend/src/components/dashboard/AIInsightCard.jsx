import { motion } from 'framer-motion';
import { HiOutlineLightningBolt, HiOutlineTrendingUp, HiOutlineSparkles } from 'react-icons/hi';

const typeConfig = {
  insight:     { icon: HiOutlineSparkles,    color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/15' },
  warning:     { icon: HiOutlineLightningBolt, color: 'text-amber-400', bg: 'bg-amber-500/10',  border: 'border-amber-500/15' },
  improvement: { icon: HiOutlineTrendingUp,  color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/15' },
};

export default function AIInsightCard({ title, description, confidence, type = 'insight', delay = 0 }) {
  const c = typeConfig[type] || typeConfig.insight;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`rounded-xl border ${c.border} bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon className={`text-sm ${c.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-white truncate">{title}</p>
            {confidence && (
              <span className="text-[10px] text-white/30 flex-shrink-0">{confidence}%</span>
            )}
          </div>
          <p className="text-xs text-white/45 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
