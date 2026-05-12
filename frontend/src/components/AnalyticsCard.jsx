import { motion } from 'framer-motion';

export default function AnalyticsCard({ title, value, change, icon: Icon, color = 'accent', delay = 0 }) {
  const colorMap = {
    accent: { bg: 'bg-[#6366F1]/10', text: 'text-[#818CF8]', border: 'border-[#6366F1]/20', glow: 'shadow-[#6366F1]/5' },
    success: { bg: 'bg-[#10B981]/10', text: 'text-[#34D399]', border: 'border-[#10B981]/20', glow: 'shadow-[#10B981]/5' },
    warning: { bg: 'bg-[#F59E0B]/10', text: 'text-[#FBBF24]', border: 'border-[#F59E0B]/20', glow: 'shadow-[#F59E0B]/5' },
    error: { bg: 'bg-[#EF4444]/10', text: 'text-[#F87171]', border: 'border-[#EF4444]/20', glow: 'shadow-[#EF4444]/5' },
  };

  const c = colorMap[color] || colorMap.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl bg-[#1E293B]/80 border ${c.border} p-5 overflow-hidden group hover:shadow-xl ${c.glow} transition-shadow duration-300`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-transparent ${c.bg}`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[#94A3B8]">{title}</span>
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
            {Icon && <Icon className={`text-xl ${c.text}`} />}
          </div>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-[#F8FAFC]">{value}</span>
          {change && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${
              change.startsWith('+') ? 'bg-[#10B981]/10 text-[#34D399]' : 'bg-[#EF4444]/10 text-[#F87171]'
            }`}>
              {change}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
