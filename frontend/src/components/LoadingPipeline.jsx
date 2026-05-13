import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineClock } from 'react-icons/hi';
import { RiLoader4Line } from 'react-icons/ri';

export default function LoadingPipeline({ steps, currentStep = 0 }) {
  const defaultSteps = steps || [
    { label: 'Neural Uplink', desc: 'Connecting to source core' },
    { label: 'Deep Scanning', desc: 'Parsing abstract syntax structures' },
    { label: 'Machine Synthesis', desc: 'Executing neural generative models' },
    { label: 'Test Formulation', desc: 'Synthesizing edge case protocols' },
    { label: 'Matrix Integrity', desc: 'Finalizing coverage metrics' },
  ];

  return (
    <div className="space-y-4">
      {defaultSteps.map((step, i) => {
        const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-start gap-6 group"
          >
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 border ${
                status === 'done' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                status === 'active' ? 'bg-cyan-400/20 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' :
                'bg-white/[0.02] border-white/5'
              }`}>
                {status === 'done' ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <HiOutlineCheck className="text-emerald-400 text-xl" />
                  </motion.div>
                ) : status === 'active' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                    <RiLoader4Line className="text-cyan-400 text-xl" />
                  </motion.div>
                ) : (
                  <HiOutlineClock className="text-slate-600 text-xl" />
                )}
              </div>
              {i < defaultSteps.length - 1 && (
                <div className={`w-px h-12 my-2 transition-colors duration-500 ${
                  status === 'done' ? 'bg-emerald-500/30' : 'bg-white/5'
                }`} />
              )}
            </div>

            {/* Step content */}
            <div className="pt-2">
              <p className={`text-sm font-black font-heading transition-colors duration-300 uppercase tracking-widest ${
                status === 'done' ? 'text-emerald-400' :
                status === 'active' ? 'text-white' :
                'text-slate-600'
              }`}>
                {step.label}
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{step.desc}</p>
              {status === 'active' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 h-1 w-64 rounded-full bg-white/5 overflow-hidden"
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
