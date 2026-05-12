import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCheck } from 'react-icons/hi';
import { RiLoader4Line } from 'react-icons/ri';
import LoadingPipeline from '../components/LoadingPipeline';

export default function ProcessingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 5) {
          clearInterval(timer);
          setIsComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Processing Repository</h2>
        <p className="text-sm text-[#94A3B8]">AI engine is analyzing your codebase</p>
      </motion.div>

      {/* Progress Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-8">
        {/* Overall progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#94A3B8]">Overall Progress</span>
            <span className="text-sm font-bold text-[#F8FAFC]">{Math.min(currentStep * 20, 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#0F172A] overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min(currentStep * 20, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#818CF8]"
            />
          </div>
        </div>

        <LoadingPipeline currentStep={currentStep} />
      </motion.div>

      {/* Info cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Files Scanned', value: currentStep >= 1 ? '347' : '—', active: currentStep >= 1 },
          { label: 'Functions Found', value: currentStep >= 2 ? '1,203' : '—', active: currentStep >= 2 },
          { label: 'Tests Generated', value: currentStep >= 4 ? '486' : '—', active: currentStep >= 4 },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
            className={`rounded-xl border p-4 text-center transition-all ${
              item.active ? 'bg-[#1E293B]/60 border-[#6366F1]/20' : 'bg-[#1E293B]/30 border-[#334155]/30'
            }`}>
            <p className="text-2xl font-bold text-[#F8FAFC] mb-1">{item.value}</p>
            <p className="text-xs text-[#64748B]">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Complete button */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
            <HiOutlineCheck className="text-[#10B981]" />
            <span className="text-sm font-medium text-[#10B981]">Analysis Complete!</span>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate('/explorer')}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-sm font-semibold text-white hover:shadow-lg transition-all cursor-pointer border-none">
              View Results
            </button>
            <button onClick={() => navigate('/coverage')}
              className="h-10 px-6 rounded-xl bg-[#1E293B] border border-[#334155] text-sm font-medium text-[#F8FAFC] hover:border-[#6366F1]/40 transition-all cursor-pointer">
              Coverage Report
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
