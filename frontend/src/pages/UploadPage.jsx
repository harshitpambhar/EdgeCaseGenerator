import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLink, HiOutlineArrowRight, HiOutlineInformationCircle } from 'react-icons/hi';
import { RiGithubFill } from 'react-icons/ri';
import UploadBox from '../components/UploadBox';

export default function UploadPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const navigate = useNavigate();

  const handleAnalyze = () => navigate('/processing');

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-4xl font-black font-heading text-white tracking-tighter">Initialize Protocol</h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Acquisition: READY</p>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-2 rounded-2xl glass-panel border-white/5 w-fit">
        {['upload', 'github'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-none cursor-pointer ${
              activeTab === tab 
              ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20' 
              : 'bg-transparent text-slate-500 hover:text-white'
            }`}>
            {tab === 'upload' ? 'Neural Link (File)' : 'External Core (Git)'}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#07111f]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl" />
        {activeTab === 'upload' ? (
          <UploadBox />
        ) : (
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Source Repository Hash (URL)</label>
              <div className="relative group">
                <RiGithubFill className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400 text-xl transition-transform group-focus-within:scale-110" />
                <input type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/cyber/core"
                  className="w-full h-14 pl-14 pr-6 rounded-2xl bg-[#050816]/60 border border-white/5 text-sm font-bold text-white placeholder-slate-700 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all" />
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-cyan-400/5 border border-cyan-400/10">
              <HiOutlineInformationCircle className="text-cyan-400 text-xl flex-shrink-0" />
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">System supports deep neural mapping for public and restricted archives. Ensure appropriate authorization layers are active.</p>
            </div>

            {/* Config selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Execution Branch</label>
                <select className="w-full h-12 px-5 rounded-xl bg-[#050816]/60 border border-white/5 text-xs font-black text-white focus:outline-none focus:border-cyan-400/50 uppercase tracking-widest cursor-pointer">
                  <option>main-core</option><option>dev-nexus</option><option>experimental</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Synthesizer Mode</label>
                <select className="w-full h-12 px-5 rounded-xl bg-[#050816]/60 border border-white/5 text-xs font-black text-white focus:outline-none focus:border-cyan-400/50 uppercase tracking-widest cursor-pointer">
                  <option>Auto-Detect Protocol</option><option>Python (PyTest)</option><option>JavaScript (Jest)</option><option>TypeScript (Vitest)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Action button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-end">
        <button onClick={handleAnalyze}
          className="h-14 px-10 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-4 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all cursor-pointer border-none group active:scale-95">
          Execute Neural Mapping <HiOutlineArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Tech Grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#07111f]/20">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Compatibility Matrix</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Python', 'Node.js', 'TypeScript', 'Java', 'GoLang', 'Rust-Core', 'C/C++', 'Ruby-Link'].map(lang => (
            <div key={lang} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#050816]/40 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-cyan-400/30 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              {lang}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
