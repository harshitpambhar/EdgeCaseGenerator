import { motion } from 'framer-motion';
import { HiOutlineCheck } from 'react-icons/hi';
import { RiLoader4Line } from 'react-icons/ri';

const defaultSteps = [
  { label: 'Connecting to repository', desc: 'Fetching source files' },
  { label: 'Parsing code', desc: 'Building abstract syntax tree' },
  { label: 'Running ML models', desc: 'Analyzing code patterns' },
  { label: 'Generating tests', desc: 'Creating edge case scenarios' },
  { label: 'Computing coverage', desc: 'Finalizing metrics' },
];

export default function LoadingPipeline({ steps, currentStep = 0 }) {
  const list = steps || defaultSteps;

  return (
    <div className="space-y-3">
      {list.map((step, i) => {
        const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
        return (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              status === 'done'   ? 'bg-emerald-500/15 border border-emerald-500/25' :
              status === 'active' ? 'bg-indigo-500/15 border border-indigo-500/30' :
                                   'bg-white/[0.03] border border-white/[0.06]'
            }`}>
              {status === 'done' ? (
                <HiOutlineCheck className="text-emerald-400 text-xs" />
              ) : status === 'active' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                  <RiLoader4Line className="text-indigo-400 text-xs" />
                </motion.div>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-white/[0.15]" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className={`text-sm transition-colors duration-300 ${
                status === 'done'   ? 'text-white/50' :
                status === 'active' ? 'text-white' :
                                     'text-white/20'
              }`}>{step.label}</p>
              {status === 'active' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 h-0.5 w-32 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="h-full w-1/2 rounded-full bg-indigo-400" />
                </motion.div>
              )}
            </div>

            {status === 'done' && (
              <span className="text-[11px] text-white/20">Done</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
