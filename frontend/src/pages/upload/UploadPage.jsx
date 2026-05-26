import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info, Loader, CheckCircle, AlertCircle, Code2, Package, Zap, FileText } from 'lucide-react';
import { RiGithubFill } from 'react-icons/ri';
import { FileUpload } from '../../components/ui/advanced-file-upload';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import api, { getErrorMessage, jobService } from '../../services/api';
import { AnalysisResults } from './AnalysisResults';

const languages = ['Python', 'Node.js', 'TypeScript', 'Java', 'Go', 'Rust', 'C/C++', 'Ruby'];

export default function UploadPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [framework, setFramework] = useState('auto');
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const canRun = activeTab === 'upload' ? uploadedFiles.length > 0 : repoUrl.trim().length > 0;

  const analyzeRepository = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }
    const githubPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/;
    if (!githubPattern.test(repoUrl.trim())) {
      setError('Please enter a valid GitHub HTTPS URL (e.g. https://github.com/user/repo)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await jobService.create(repoUrl.trim());
      // Store the new job ID so ExecutionPage can highlight it
      sessionStorage.setItem('lastJobId', data.id);
      navigate('/executions');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Show analysis results if available
  if (analysisData) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        <button
          onClick={() => {
            setAnalysisData(null);
            setRepoUrl('');
            setError('');
          }}
          className="text-sm text-white/60 hover:text-white/80 transition-colors flex items-center gap-1"
        >
          ← Back to upload
        </button>
        <AnalysisResults data={analysisData} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-white">New analysis</h2>
        <p className="text-sm text-white/40 mt-0.5">Upload a repository or connect via GitHub URL to get started.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] w-fit">
        {[{ id: 'upload', label: 'Upload files' }, { id: 'github', label: 'GitHub URL' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all border-none cursor-pointer ${
              activeTab === tab.id ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/40 hover:text-white/70'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-5">

        {activeTab === 'upload' ? (
          <>
            <FileUpload
              accept=".zip,.tar,.gz,.py,.js,.ts,.java,.go,.rs,.cpp,.c,.rb"
              multiple
              maxSize={50 * 1024 * 1024}
              onFilesSelect={setUploadedFiles}
              onFilesRemove={setUploadedFiles}
            />

            <Separator className="bg-white/[0.06]" />

            {/* Config */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Test framework</Label>
                <select value={framework} onChange={e => setFramework(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors appearance-none cursor-pointer">
                  <option value="auto">Auto-detect</option>
                  <option value="pytest">pytest</option>
                  <option value="jest">Jest</option>
                  <option value="vitest">Vitest</option>
                  <option value="junit">JUnit</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Language</Label>
                <select className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors appearance-none cursor-pointer">
                  <option>Auto-detect</option>
                  {languages.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* GitHub URL */}
            <div className="space-y-1.5">
              <Label htmlFor="repo-url" className="text-white/60">Repository URL</Label>
              <div className="relative">
                <RiGithubFill className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-base" />
                <Input
                  id="repo-url" type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-400/50"
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/45 leading-relaxed">
                Both public and private repositories are supported. For private repos, connect your GitHub account in Settings first.
              </p>
            </div>

            <Separator className="bg-white/[0.06]" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Branch</Label>
                <select value={branch} onChange={e => setBranch(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors appearance-none cursor-pointer">
                  <option>main</option>
                  <option>develop</option>
                  <option>staging</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Test framework</Label>
                <select value={framework} onChange={e => setFramework(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors appearance-none cursor-pointer">
                  <option value="auto">Auto-detect</option>
                  <option value="pytest">pytest</option>
                  <option value="jest">Jest</option>
                  <option value="vitest">Vitest</option>
                  <option value="junit">JUnit</option>
                </select>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-white/25 mb-2">Supported languages</p>
          <div className="flex flex-wrap gap-1.5">
            {languages.map(lang => (
              <span key={lang} className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/35">{lang}</span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
          
          <Button
            onClick={activeTab === 'github' ? analyzeRepository : () => navigate('/processing')}
            disabled={!canRun || loading}
            className="flex-shrink-0 bg-indigo-500 hover:bg-indigo-400 text-white border-none h-9 px-5 gap-2 disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                {activeTab === 'github' ? 'Analyze Repository' : 'Run analysis'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
