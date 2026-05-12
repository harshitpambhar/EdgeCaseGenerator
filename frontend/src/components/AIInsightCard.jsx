import { motion } from 'framer-motion';
import { HiOutlineLightningBolt, HiOutlineTrendingUp, HiOutlineSparkles } from 'react-icons/hi';

export default function AIInsightCard({ title, description, confidence, type = 'insight', delay = 0 }) {
  const typeConfig = {
    insight: { icon: HiOutlineSparkles, color: 'text-[#818CF8]', bg: 'bg-[#6366F1]/10', border: 'border-[#6366F1]/20' },
    warning: { icon: HiOutlineLightningBolt, color: 'text-[#FBBF24]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20' },
    improvement: { icon: HiOutlineTrendingUp, color: 'text-[#34D399]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/20' },
  };

  const config = typeConfig[type] || typeConfig.insight;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className={`rounded-xl bg-[#1E293B]/60 border ${config.border} p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon className={`text-lg ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-[#F8FAFC] group-hover:text-[#818CF8] transition-colors truncate">{title}</h4>
            {confidence && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#818CF8] flex-shrink-0 ml-2">
                {confidence}% conf
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
