import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineClock } from 'react-icons/hi';
import { RiLoader4Line } from 'react-icons/ri';

export default function LoadingPipeline({ steps, currentStep = 0 }) {
  const defaultSteps = steps || [
    { label: 'Repository Cloned', desc: 'Fetching source code from remote' },
    { label: 'AST Generated', desc: 'Parsing abstract syntax trees' },
    { label: 'ML Analysis', desc: 'Running neural network analysis' },
    { label: 'Test Generation', desc: 'Generating intelligent test cases' },
    { label: 'Coverage Analysis', desc: 'Computing code coverage metrics' },
  ];

  return (
    <div className="space-y-1">
      {defaultSteps.map((step, i) => {
        const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-start gap-4"
          >
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                status === 'done' ? 'bg-[#10B981]/20 border border-[#10B981]/30' :
                status === 'active' ? 'bg-[#6366F1]/20 border border-[#6366F1]/30 shadow-lg shadow-[#6366F1]/20' :
                'bg-[#1E293B] border border-[#334155]'
              }`}>
                {status === 'done' ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <HiOutlineCheck className="text-[#10B981] text-lg" />
                  </motion.div>
                ) : status === 'active' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <RiLoader4Line className="text-[#818CF8] text-lg" />
                  </motion.div>
                ) : (
                  <HiOutlineClock className="text-[#64748B] text-lg" />
                )}
              </div>
              {i < defaultSteps.length - 1 && (
                <div className={`w-0.5 h-10 my-1 rounded-full transition-colors duration-500 ${
                  status === 'done' ? 'bg-[#10B981]/30' : 'bg-[#334155]'
                }`} />
              )}
            </div>

            {/* Step content */}
            <div className="pt-2">
              <p className={`text-sm font-semibold transition-colors duration-300 ${
                status === 'done' ? 'text-[#10B981]' :
                status === 'active' ? 'text-[#F8FAFC]' :
                'text-[#64748B]'
              }`}>
                {step.label}
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">{step.desc}</p>
              {status === 'active' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 h-1.5 w-48 rounded-full bg-[#0F172A] overflow-hidden"
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#6366F1] to-transparent"
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
