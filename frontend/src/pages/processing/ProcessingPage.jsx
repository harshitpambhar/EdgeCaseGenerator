import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCheck, HiOutlineArrowRight } from 'react-icons/hi';
import LoadingPipeline from '../../components/shared/LoadingPipeline';

export default function ProcessingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 5) { clearInterval(timer); setIsComplete(true); return prev; }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const pct = Math.min(currentStep * 20, 100);

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-8 pt-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">Analyzing repository</h2>
        <p className="text-sm text-white/40 mt-1">This usually takes 30–60 seconds.</p>
      </div>

      {/* Progress */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/40">Overall progress</p>
          <p className="text-xs font-medium text-indigo-400">{pct}%</p>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden mb-6">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-rose-500"
          />
        </div>
        <LoadingPipeline currentStep={currentStep} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Files scanned', value: currentStep >= 1 ? '347' : '—', active: currentStep >= 1 },
          { label: 'Functions found', value: currentStep >= 2 ? '1,203' : '—', active: currentStep >= 2 },
          { label: 'Tests generated', value: currentStep >= 4 ? '486' : '—', active: currentStep >= 4 },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
            className={`rounded-xl border p-4 text-center transition-all duration-500 ${
              item.active ? 'bg-white/[0.04] border-indigo-500/20' : 'bg-white/[0.02] border-white/[0.05]'
            }`}>
            <p className={`text-xl font-semibold mb-1 transition-colors duration-500 ${item.active ? 'text-white' : 'text-white/20'}`}>
              {item.value}
            </p>
            <p className="text-xs text-white/30">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Done */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-5 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <HiOutlineCheck className="text-emerald-400 text-xs" />
            </div>
            <p className="text-sm font-medium text-emerald-400">Analysis complete</p>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate('/explorer')}
              className="h-9 px-5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium flex items-center gap-2 transition-colors cursor-pointer border-none">
              View results <HiOutlineArrowRight />
            </button>
            <button onClick={() => navigate('/coverage')}
              className="h-9 px-5 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent">
              Coverage report
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
