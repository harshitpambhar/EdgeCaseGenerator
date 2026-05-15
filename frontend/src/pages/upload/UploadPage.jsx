import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info, GitBranch, Zap, Shield, Globe, Upload as UploadIcon, X } from 'lucide-react';
import { RiGithubFill } from 'react-icons/ri';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';

const testTypes = [
  { id: 'functional', label: 'Functional', icon: HiOutlineCheckCircle, desc: 'Core user flows' },
  { id: 'api', label: 'API', icon: Globe, desc: 'Endpoint testing' },
  { id: 'security', label: 'Security', icon: Shield, desc: 'Vulnerability checks' },
  { id: 'edge', label: 'Edge Cases', icon: Zap, desc: 'Boundary conditions' },
];

const analysisDepths = [
  { id: 'quick', label: 'Quick Scan', desc: '~30s' },
  { id: 'standard', label: 'Standard', desc: '~2 min' },
  { id: 'deep', label: 'Deep Analysis', desc: '~5 min' },
];

const analysisPipelineSteps = [
  { label: 'Cloning & extracting repository', desc: 'Fetching source files' },
  { label: 'Detecting framework & language', desc: 'Identifying tech stack' },
  { label: 'Parsing AST & mapping routes', desc: 'Building code structure' },
  { label: 'AI workflow detection', desc: 'Identifying user flows' },
  { label: 'Generating test cases', desc: 'Creating test scenarios' },
  { label: 'Building automation scripts', desc: 'Generating Playwright scripts' },
];

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [framework, setFramework] = useState('auto');
  const [executionMode, setExecutionMode] = useState('playwright');
  const [analysisDepth, setAnalysisDepth] = useState('standard');
  const [selectedTestTypes, setSelectedTestTypes] = useState(['functional', 'edge']);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const navigate = useNavigate();

  const canRun = activeTab === 'upload' ? uploadedFiles.length > 0 : repoUrl.trim().length > 0;

  // File upload handler
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(files);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTestType = (id) => {
    setSelectedTestTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleRun = () => {
    setIsAnalyzing(true);
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setAnalysisStep(step);
      if (step >= analysisPipelineSteps.length) {
        clearInterval(timer);
        setTimeout(() => navigate('/projects/demo-project-1'), 800);
      }
    }, 1800);
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-xl mx-auto space-y-5 pb-8 pt-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Analyzing repository</h2>
          <p className="text-sm text-white/40 mt-1">AI is processing your codebase. This may take a moment.</p>
        </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40">Overall progress</p>
              <p className="text-xs font-medium text-indigo-400">
                {Math.round((analysisStep / analysisPipelineSteps.length) * 100)}%
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden mb-6">
              <motion.div
                animate={{ width: `${(analysisStep / analysisPipelineSteps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-rose-500"
              />
            </div>
            {/* Pipeline steps */}
            <div className="space-y-2">
              {analysisPipelineSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: analysisStep >= idx ? 1 : 0.5 }}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    analysisStep >= idx ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/[0.02] border border-white/[0.05]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                    analysisStep > idx ? 'bg-indigo-500 text-white' : analysisStep === idx ? 'bg-indigo-400/50 text-indigo-100' : 'bg-white/[0.08] text-white/40'
                  }`}>
                    {analysisStep > idx ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${analysisStep >= idx ? 'text-white' : 'text-white/50'}`}>{step.label}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Files scanned', value: analysisStep >= 1 ? '284' : '—', active: analysisStep >= 1 },
            { label: 'Routes detected', value: analysisStep >= 3 ? '47' : '—', active: analysisStep >= 3 },
            { label: 'Test cases', value: analysisStep >= 5 ? '312' : '—', active: analysisStep >= 5 },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl border p-4 text-center transition-all duration-500 ${item.active ? 'bg-white/[0.04] border-indigo-500/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
              <p className={`text-xl font-semibold mb-1 transition-colors duration-500 ${item.active ? 'text-white' : 'text-white/20'}`}>{item.value}</p>
              <p className="text-xs text-white/30">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Upload Repository</h2>
        <p className="text-sm text-white/40 mt-0.5">Upload a ZIP or connect via GitHub URL to start AI-powered QA automation.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] w-fit">
        {[{ id: 'upload', label: 'ZIP Upload' }, { id: 'github', label: 'GitHub URL' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all border-none cursor-pointer ${activeTab === tab.id ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/40 hover:text-white/70'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload panel */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-5">

        {activeTab === 'upload' ? (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/[0.2] hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer group">
              <UploadIcon className="w-8 h-8 text-white/40 group-hover:text-indigo-400 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">Drag and drop files here</p>
                <p className="text-xs text-white/40 mt-0.5">or click to browse</p>
                <p className="text-[10px] text-white/20 mt-1">ZIP, TAR, or GZ files up to 100 MB</p>
              </div>
              <input
                type="file"
                multiple
                accept=".zip,.tar,.gz"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-white/50">{uploadedFiles.length} file(s) selected</p>
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <span className="text-xs text-white/70 truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="p-1 hover:bg-white/[0.1] rounded transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-white/40" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="repo-url" className="text-white/60">Repository URL</Label>
              <div className="relative">
                <RiGithubFill className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-base" />
                <Input id="repo-url" type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-400/50" />
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/45 leading-relaxed">
                Public and private repositories supported. Connect your GitHub account in Settings for private repos.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Branch</Label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <select value={branch} onChange={e => setBranch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors appearance-none cursor-pointer">
                  <option>main</option><option>develop</option><option>staging</option>
                </select>
              </div>
            </div>
          </>
        )}

        <Separator className="bg-white/[0.06]" />

        {/* Test type selection */}
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">Test types to generate</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {testTypes.map(t => (
              <button key={t.id} onClick={() => toggleTestType(t.id)}
                className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all cursor-pointer ${selectedTestTypes.includes(t.id) ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/[0.12]'}`}>
                <t.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{t.label}</span>
                <span className="text-[10px] opacity-60">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Config row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/50 text-xs">Framework detection</Label>
            <select value={framework} onChange={e => setFramework(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors appearance-none cursor-pointer">
              <option value="auto">Auto-detect</option>
              <option value="playwright">Playwright</option>
              <option value="cypress">Cypress</option>
              <option value="jest">Jest</option>
              <option value="pytest">pytest</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/50 text-xs">Execution mode</Label>
            <select value={executionMode} onChange={e => setExecutionMode(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors appearance-none cursor-pointer">
              <option value="playwright">Playwright</option>
              <option value="headless">Headless Chrome</option>
              <option value="api-only">API Only</option>
            </select>
          </div>
        </div>

        {/* Analysis depth */}
        <div className="space-y-2">
          <Label className="text-white/60 text-xs">AI analysis depth</Label>
          <div className="flex gap-2">
            {analysisDepths.map(d => (
              <button key={d.id} onClick={() => setAnalysisDepth(d.id)}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${analysisDepth === d.id ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/[0.12]'}`}>
                {d.label}
                <span className="block text-[10px] opacity-60 mt-0.5">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button onClick={handleRun} disabled={!canRun}
          className="bg-indigo-500 hover:bg-indigo-400 text-white border-none h-9 px-5 gap-2 disabled:opacity-40">
          Start AI Analysis <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}