import { motion } from 'framer-motion';
import { HiOutlineCode } from 'react-icons/hi';
import { VscGitMerge } from 'react-icons/vsc';

const riskStyle = {
  Low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  High:   'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function RepoCard({ name, language, stars, coverage, risk, lastAnalyzed, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-white/[0.1] transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <VscGitMerge className="text-sm text-white/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{name}</p>
            <p className="text-xs text-white/30 mt-0.5">{lastAnalyzed}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${riskStyle[risk] || riskStyle.Low}`}>
          {risk}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
        <span className="flex items-center gap-1"><HiOutlineCode className="text-xs" />{language}</span>
        <span className="ml-auto text-emerald-400 font-medium">{coverage}%</span>
      </div>

      <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${coverage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
        />
      </div>
    </motion.div>
  );
}
