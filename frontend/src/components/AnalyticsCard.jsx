import { motion } from 'framer-motion';

export default function AnalyticsCard({ title, value, change, icon: Icon, color = 'cyan', delay = 0 }) {
  const colorMap = {
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/5' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/5' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/5' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'shadow-rose-500/5' },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-[2rem] glass-card p-6 overflow-hidden group`}
    >
      {/* Dynamic Glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${c.bg}`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <div className={`w-10 h-10 rounded-2xl ${c.bg} flex items-center justify-center border ${c.border} group-hover:scale-110 transition-transform duration-500`}>
            {Icon && <Icon className={`text-xl ${c.text}`} />}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-black font-heading text-white">{value}</span>
          {change && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {change}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
