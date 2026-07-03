import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDatabase, HiOutlineLink, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineCode } from 'react-icons/hi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function RequirementMappingPage() {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [threshold, setThreshold] = useState(0.2);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load repositories list
    axios.get(`${API_BASE_URL}/projects`)
      .then((res) => {
        setRepositories(Array.isArray(res.data) ? res.data : []);
        if (res.data.length > 0) {
          setSelectedRepoId(res.data[0].id.toString());
        }
      })
      .catch(() => {
        setError('Failed to fetch repositories. Ensure FastAPI is running.');
      });
  }, []);

  const runMapping = () => {
    if (!selectedRepoId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setMappings([]);

    axios.post(`${API_BASE_URL}/requirements/map`, {
      repo_id: parseInt(selectedRepoId),
      threshold: parseFloat(threshold)
    })
      .then((res) => {
        setMappings(res.data.mappings || []);
        setSuccess('Mapped requirements successfully.');
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to map requirements.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Semantic Requirement Mapping</h2>
        <p className="text-sm text-white/40 mt-0.5">Map functional requirement statements to code implementations using CodeBERT embeddings and FAISS search.</p>
      </div>

      {/* Configuration bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 backdrop-blur-md flex flex-wrap gap-6 items-end"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1">
            <HiOutlineDatabase className="text-indigo-400" />
            Select Repository
          </label>
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            <option value="" className="bg-[#111]">-- Choose a repository --</option>
            {repositories.map(repo => (
              <option key={repo.id} value={repo.id} className="bg-[#111]">{repo.name} ({repo.language})</option>
            ))}
          </select>
        </div>

        <div className="w-64">
          <div className="flex justify-between items-center mb-1.5 text-xs text-white/60">
            <span>Similarity Threshold</span>
            <span className="font-mono text-indigo-400 font-bold">{(threshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <button
          onClick={runMapping}
          disabled={loading || !selectedRepoId}
          className="h-9 px-6 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/30 text-white text-xs font-semibold cursor-pointer border-none transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          {loading ? 'Mapping...' : 'Map Requirements'}
        </button>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <HiOutlineExclamationCircle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <HiOutlineCheckCircle className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Mappings results */}
      {loading && (
        <div className="text-xs text-white/40">Performing semantic mappings on database vectors...</div>
      )}

      {!loading && mappings.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center text-white/30 text-xs">
          <HiOutlineLink className="text-2xl mx-auto mb-2 text-white/10" />
          No mappings computed. Select a repository and run the engine.
        </div>
      )}

      {!loading && mappings.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {mappings.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-3 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[9px] font-bold">
                  {m.requirement_code}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-white/40">Similarity:</span>
                  <span className="font-mono text-emerald-400 font-bold">{(m.similarity_score * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white/80 line-clamp-1">Requirement: {m.requirement_title}</h4>
              </div>

              {/* Call relation vector */}
              <div className="flex items-center gap-2 text-white/30 my-2">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <HiOutlineLink className="text-sm" />
                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              <div className="space-y-1 bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-white">
                  <HiOutlineCode className="text-indigo-400" />
                  <span className="font-semibold">{m.function_name}()</span>
                </div>
                <p className="text-[10px] text-white/40 font-mono line-clamp-1">{m.file_path}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
