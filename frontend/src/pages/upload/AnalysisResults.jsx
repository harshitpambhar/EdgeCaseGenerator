import { motion } from 'framer-motion';
import {
  Code2, Package, Zap, FileText, AlertTriangle, Lightbulb,
  GitBranch, Database, TestTube, Folder, CheckCircle, Clock
} from 'lucide-react';

export function AnalysisResults({ data }) {
  if (!data) return null;

  const stats = [
    { label: 'Languages', value: data.languages?.length || 0, icon: Code2 },
    { label: 'Frameworks', value: data.frameworks?.length || 0, icon: Package },
    { label: 'Files', value: data.fileCount || 0, icon: FileText },
    { label: 'Directories', value: data.directoryCount || 0, icon: Folder },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h1 className="text-3xl font-bold text-white">{data.repository}</h1>
        <p className="text-white/60 flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          By <span className="font-semibold text-white/80">{data.owner}</span>
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2 hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-400" />
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Technologies */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-4"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              Technologies
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/60 mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {(data.languages || []).map(lang => (
                    <span key={lang} className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-white/60 mb-2">Frameworks</p>
                <div className="flex flex-wrap gap-2">
                  {(data.frameworks || []).map(fw => (
                    <span key={fw} className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-xs text-white/60">Build Tool</p>
                  <p className="font-semibold text-white">{data.buildTool || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TestTube className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs text-white/60">Test Framework</p>
                  <p className="font-semibold text-white">{data.testFramework || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {data.packageManager && (
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <Database className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-xs text-white/60">Package Manager</p>
                  <p className="font-semibold text-white">{data.packageManager}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Risk Areas */}
          {(data.riskAreas || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-5 space-y-3"
            >
              <h3 className="text-lg font-semibold text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Identified Risks
              </h3>
              <ul className="space-y-2">
                {data.riskAreas.map((risk, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="flex gap-3 text-sm text-amber-100"
                  >
                    <span className="text-amber-400 font-bold">•</span>
                    {risk}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Recommendations */}
          {(data.recommendations || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-5 space-y-3"
            >
              <h3 className="text-lg font-semibold text-emerald-200 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex gap-3 text-sm text-emerald-100"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {rec}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          {/* Repository Info */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Repository Info</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-white/60 mb-1">Size</p>
                <p className="font-semibold text-white">{data.estimatedSize?.toFixed(2)} MB</p>
              </div>

              <div>
                <p className="text-xs text-white/60 mb-1">File Types</p>
                <div className="space-y-1">
                  {Object.entries(data.fileTypeDistribution || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="text-white/70">{type || 'other'}</span>
                        <span className="font-semibold text-white/90">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-xs text-white/60 mb-1">Analysis Time</p>
                <p className="font-semibold text-white flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {(data.analysisTimeMs / 1000).toFixed(2)}s
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80">Analysis Complete</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Directory Structure */}
      {(data.directories || []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-4"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-400" />
            Directory Structure
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {data.directories.map((dir, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.02 }}
                className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/70 truncate hover:text-white/90 transition-colors"
                title={dir}
              >
                📁 {dir}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
