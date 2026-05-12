import { motion } from 'framer-motion';
import { HiOutlineStar, HiOutlineCode } from 'react-icons/hi';
import { VscGitMerge } from 'react-icons/vsc';

export default function RepoCard({ name, language, stars, coverage, risk, lastAnalyzed, delay = 0 }) {
  const riskColor = risk === 'Low' ? 'text-[#34D399] bg-[#10B981]/10' : risk === 'Medium' ? 'text-[#FBBF24] bg-[#F59E0B]/10' : 'text-[#F87171] bg-[#EF4444]/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="rounded-xl bg-[#1E293B]/60 border border-[#334155]/50 p-4 hover:border-[#6366F1]/30 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
            <VscGitMerge className="text-[#818CF8]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC] group-hover:text-[#818CF8] transition-colors">{name}</h3>
            <p className="text-xs text-[#64748B]">{lastAnalyzed}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${riskColor}`}>{risk} Risk</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
        <span className="flex items-center gap-1">
          <HiOutlineCode className="text-sm" />
          {language}
        </span>
        <span className="flex items-center gap-1">
          <HiOutlineStar className="text-sm text-[#FBBF24]" />
          {stars}
        </span>
        <span className="ml-auto text-[#10B981] font-semibold">{coverage}% coverage</span>
      </div>

      {/* Coverage bar */}
      <div className="mt-3 h-1.5 rounded-full bg-[#0F172A] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${coverage}%` }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#10B981]"
        />
      </div>
    </motion.div>
  );
}
