import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Settings, BarChart3 } from 'lucide-react';
import { HiOutlineCheckCircle, HiOutlineArrowRight } from 'react-icons/hi';

export default function TestGenerationPage() {
  const [generationMode, setGenerationMode] = useState('automatic');
  const [selectedModules, setSelectedModules] = useState(['checkout', 'auth']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const modules = ['Auth', 'Products', 'Cart', 'Checkout', 'Orders', 'Payments'];
  const testTypes = ['Functional', 'Edge Case', 'Security', 'Performance', 'API'];

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return p + Math.random() * 30;
      });
    }, 300);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">AI Test Generation</h1>
        <p className="text-white/60">Generate comprehensive test cases automatically</p>
      </div>

      {/* Generation Mode Selection */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { id: 'automatic', label: 'Automatic', icon: Play, desc: 'Generate all tests automatically' },
          { id: 'bymodule', label: 'By Module', icon: Settings, desc: 'Select specific modules' },
          { id: 'byapi', label: 'By API', icon: BarChart3, desc: 'Target specific APIs' },
        ].map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => setGenerationMode(mode.id)}
            whileHover={{ y: -2 }}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              generationMode === mode.id
                ? 'bg-indigo-500/20 border-indigo-500'
                : 'bg-slate-900/50 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <mode.icon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white">{mode.label}</p>
                <p className="text-sm text-white/60">{mode.desc}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Module Selection */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Select Modules for Testing</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {modules.map((module) => (
            <button
              key={module}
              onClick={() =>
                setSelectedModules((prev) =>
                  prev.includes(module.toLowerCase())
                    ? prev.filter((m) => m !== module.toLowerCase())
                    : [...prev, module.toLowerCase()]
                )
              }
              className={`p-3 rounded-lg border transition-all text-sm font-medium flex items-center justify-between ${
                selectedModules.includes(module.toLowerCase())
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <span>{module}</span>
              {selectedModules.includes(module.toLowerCase()) && (
                <HiOutlineCheckCircle className="text-lg" />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Test Types Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Test Types to Generate</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {testTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-white/80">{type}</span>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Generation Progress */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Generating test cases...</h3>
            <span className="text-sm font-mono text-indigo-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400"
            />
          </div>
          <p className="text-sm text-white/60 mt-3">AI is analyzing your code and generating comprehensive test cases...</p>
        </motion.div>
      )}

      {/* Generate Button */}
      {!isGenerating && (
        <button
          onClick={handleGenerate}
          disabled={selectedModules.length === 0}
          className="w-full px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Generate Test Cases
        </button>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Test Cases', value: '284' },
          { label: 'Estimated Coverage', value: '87%' },
          { label: 'Generation Time', value: '2m 34s' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{stat.value}</p>
            <p className="text-sm text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
