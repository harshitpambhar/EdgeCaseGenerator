import { motion } from 'framer-motion';

const colors = {
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  blue:   { text: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  emerald:{ text: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
  rose:   { text: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  cyan:   { text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
};

export default function AnalyticsCard({ title, value, change, icon: Icon, color = 'indigo', delay = 0 }) {
  const c = colors[color] || colors.indigo;
  const isPositive = change?.startsWith('+');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-white/[0.1] transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40">{title}</p>
        <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center`}>
          {Icon && <Icon className={`text-sm ${c.text}`} />}
        </div>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {change && (
        <p className={`text-xs mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{change} from last week</p>
      )}
    </motion.div>
  );
}
