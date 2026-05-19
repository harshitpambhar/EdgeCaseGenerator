import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Play } from 'lucide-react';
import { HiOutlineArrowRight } from 'react-icons/hi';

export default function ExecutionConfigurationPage() {
  const [config, setConfig] = useState({
    browser: 'chromium',
    headless: true,
    parallelRuns: 4,
    timeout: 30000,
    retries: 2,
    slowMo: 0,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    dockerEnabled: false,
    environment: '',
  });

  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveAndExecute = async () => {
    setIsValidating(true);
    try {
      // Validate and save configuration
      console.log('Saving configuration:', config);
      // API call would go here
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Execution Configuration</h1>
        <p className="text-white/60">Configure execution parameters before running tests</p>
      </div>

      {/* Browser Settings */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Browser Configuration
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Browser Type</label>
            <select
              value={config.browser}
              onChange={(e) => handleChange('browser', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="chromium">Chromium</option>
              <option value="firefox">Firefox</option>
              <option value="webkit">WebKit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Screenshot on Failure</label>
            <select
              value={config.screenshot}
              onChange={(e) => handleChange('screenshot', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="off">Off</option>
              <option value="only-on-failure">Only on Failure</option>
              <option value="on">On</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Video Recording</label>
            <select
              value={config.video}
              onChange={(e) => handleChange('video', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="off">Off</option>
              <option value="retain-on-failure">Retain on Failure</option>
              <option value="on">On</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <input
                type="checkbox"
                checked={config.headless}
                onChange={(e) => handleChange('headless', e.target.checked)}
                className="rounded"
              />
              Headless Mode
            </label>
          </div>
        </div>
      </motion.div>

      {/* Performance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Performance & Reliability
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Parallel Runs: {config.parallelRuns}
            </label>
            <input
              type="range"
              min="1"
              max="16"
              value={config.parallelRuns}
              onChange={(e) => handleChange('parallelRuns', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Timeout (ms): {config.timeout}
            </label>
            <input
              type="number"
              value={config.timeout}
              onChange={(e) => handleChange('timeout', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Retries: {config.retries}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={config.retries}
              onChange={(e) => handleChange('retries', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Slow Motion (ms): {config.slowMo}
            </label>
            <input
              type="number"
              value={config.slowMo}
              onChange={(e) => handleChange('slowMo', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Docker & Environment */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Deployment & Environment
        </h2>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white mb-4">
            <input
              type="checkbox"
              checked={config.dockerEnabled}
              onChange={(e) => handleChange('dockerEnabled', e.target.checked)}
              className="rounded"
            />
            Run in Docker Container
          </label>
          {config.dockerEnabled && (
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
              Tests will be executed inside a Docker container for isolation
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Environment Variables</label>
          <textarea
            value={config.environment}
            onChange={(e) => handleChange('environment', e.target.value)}
            placeholder="KEY=value&#10;KEY2=value2"
            rows="4"
            className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none font-mono text-sm resize-none"
          />
        </div>
      </motion.div>

      {/* Configuration Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4"
      >
        <p className="text-sm text-indigo-200">
          ✓ Configuration is valid and ready for execution
        </p>
      </motion.div>

      {/* Execute Button */}
      <button
        onClick={handleSaveAndExecute}
        disabled={isValidating}
        className="w-full px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        {isValidating ? 'Validating...' : 'Save Configuration & Execute'}
        <HiOutlineArrowRight />
      </button>
    </div>
  );
}
