import { motion } from 'framer-motion';
import { HiOutlineStar, HiOutlineCode } from 'react-icons/hi';
import { VscGitMerge } from 'react-icons/vsc';

export default function RepoCard({ name, language, stars, coverage, risk, lastAnalyzed, delay = 0 }) {
  const riskConfig = {
    Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    High: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  const rc = riskConfig[risk] || riskConfig.Low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[2rem] glass-card p-6 group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-400/50 transition-colors">
            <VscGitMerge className="text-lg text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-black font-heading text-white group-hover:text-cyan-400 transition-colors tracking-tight">{name}</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{lastAnalyzed}</p>
          </div>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${rc}`}>{risk} RISK</span>
      </div>

      <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6">
        <span className="flex items-center gap-2">
          <HiOutlineCode className="text-sm text-cyan-400" />
          {language}
        </span>
        <span className="flex items-center gap-2">
          <HiOutlineStar className="text-sm text-amber-400" />
          {stars}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400">{coverage}% COVERAGE</span>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${coverage}%` }}
          transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
        />
      </div>
    </motion.div>
  );
}
