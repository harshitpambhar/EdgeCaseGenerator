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
    <div className="max-w-3xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-4xl font-black font-heading text-white tracking-tighter">Processing Core</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Sync in Progress</p>
        </div>
      </motion.div>

      {/* Progress Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] glass-panel border-white/5 p-10 bg-[#07111f]/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-cyber opacity-5 pointer-events-none" />
        
        {/* Overall progress */}
        <div className="mb-12 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Integration Level</span>
            <span className="text-sm font-black text-cyan-400 font-mono tracking-tighter">{Math.min(currentStep * 20, 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min(currentStep * 20, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            />
          </div>
        </div>

        <LoadingPipeline currentStep={currentStep} />
      </motion.div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        {[
          { label: 'Files Scanned', value: currentStep >= 1 ? '347' : '—', active: currentStep >= 1 },
          { label: 'Functions Found', value: currentStep >= 2 ? '1,203' : '—', active: currentStep >= 2 },
          { label: 'Tests Generated', value: currentStep >= 4 ? '486' : '—', active: currentStep >= 4 },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
            className={`rounded-2xl border p-6 text-center transition-all duration-500 ${
              item.active 
              ? 'bg-white/[0.03] border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
              : 'bg-white/[0.01] border-white/5'
            }`}>
            <p className={`text-3xl font-black font-heading tracking-tighter mb-1 transition-colors duration-500 ${item.active ? 'text-white' : 'text-slate-700'}`}>{item.value}</p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Complete button */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 pt-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Protocol Succeeded</span>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/explorer')}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-[10px] font-black text-white uppercase tracking-widest hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all border-none cursor-pointer active:scale-95">
              Access Results
            </button>
            <button onClick={() => navigate('/coverage')}
              className="h-12 px-8 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 hover:border-cyan-400/30 transition-all cursor-pointer">
              Intel Report
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
