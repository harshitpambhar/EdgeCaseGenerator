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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Upload Repository</h2>
        <p className="text-sm text-[#94A3B8]">Upload your source code or connect a GitHub repository for AI analysis</p>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#1E293B]/60 border border-[#334155]/50 w-fit">
        {['upload', 'github'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all border-none cursor-pointer ${
              activeTab === tab ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20' : 'bg-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}>
            {tab === 'upload' ? '📁 File Upload' : '🔗 GitHub URL'}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="rounded-2xl bg-[#1E293B]/40 border border-[#334155]/50 p-6">
        {activeTab === 'upload' ? (
          <UploadBox />
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">GitHub Repository URL</label>
              <div className="relative">
                <RiGithubFill className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] text-lg" />
                <input type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repository"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#0F172A] border border-[#334155] text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/30 transition-all" />
              </div>
            </div>
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[#6366F1]/5 border border-[#6366F1]/10">
              <HiOutlineInformationCircle className="text-[#818CF8] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#94A3B8]">Supports public and private repositories. For private repos, ensure your GitHub account is connected in Settings.</p>
            </div>
            {/* Branch selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Branch</label>
                <select className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-[#334155] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                  <option>main</option><option>develop</option><option>feature/test</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Language</label>
                <select className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-[#334155] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                  <option>Auto-detect</option><option>Python</option><option>JavaScript</option><option>TypeScript</option><option>Java</option><option>Go</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Analyze button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-end">
        <button onClick={handleAnalyze}
          className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-sm font-semibold text-white flex items-center gap-2 hover:shadow-xl hover:shadow-[#6366F1]/25 transition-all cursor-pointer border-none hover:scale-105 transform duration-200">
          Start AI Analysis <HiOutlineArrowRight />
        </button>
      </motion.div>

      {/* Preview card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl bg-[#1E293B]/40 border border-[#334155]/50 p-6">
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Supported Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'Ruby'].map(lang => (
            <div key={lang} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0F172A]/60 border border-[#334155]/30 text-sm text-[#94A3B8]">
              <HiOutlineLink className="text-[#818CF8] text-xs" /> {lang}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
