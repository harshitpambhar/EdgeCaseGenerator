import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineDocumentText } from 'react-icons/hi';
import axios from 'axios';

// Align with base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form fields
  const [reqId, setReqId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchRequirements = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/requirements`)
      .then((res) => {
        setRequirements(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setError('Failed to fetch requirements. Make sure the backend server is running.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reqId || !title || !description) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    axios.post(`${API_BASE_URL}/requirements`, {
      req_id: reqId,
      title: title,
      description: description
    })
      .then(() => {
        setSuccessMsg(`Requirement ${reqId} added and parsed successfully!`);
        setReqId('');
        setTitle('');
        setDescription('');
        fetchRequirements();
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to create requirement.');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this requirement?')) return;
    
    axios.delete(`${API_BASE_URL}/requirements/${id}`)
      .then(() => {
        fetchRequirements();
      })
      .catch(() => {
        setError('Failed to delete requirement.');
      });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Functional Requirements</h2>
        <p className="text-sm text-white/40 mt-0.5">Manage and extract NLP constraints from your system specifications.</p>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left column: Upload/Form (1 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -12 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 h-fit backdrop-blur-md"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlinePlus className="text-indigo-400" />
            Add Requirement
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Requirement ID</label>
              <input
                type="text"
                placeholder="e.g. REQ-001"
                value={reqId}
                onChange={(e) => setReqId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Title</label>
              <input
                type="text"
                placeholder="e.g. Password Length Constraint"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Description</label>
              <textarea
                rows={4}
                placeholder="e.g. The password should contain at least 8 characters."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <HiOutlineExclamationCircle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <HiOutlineCheckCircle className="flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-9 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/50 text-white text-xs font-semibold cursor-pointer transition-colors border-none flex items-center justify-center gap-1.5"
            >
              {submitting ? 'Analyzing...' : 'Add & Run NLP Parser'}
            </button>
          </form>
        </motion.div>

        {/* Right column: Requirements list (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50">{requirements.length} Requirements found</span>
          </div>

          {loading && (
            <div className="text-xs text-white/40">Loading requirement list...</div>
          )}

          {!loading && requirements.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center text-white/30 text-xs">
              <HiOutlineDocumentText className="text-2xl mx-auto mb-2 text-white/10" />
              No requirements uploaded yet. Use the form to add one.
            </div>
          )}

          {!loading && requirements.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] font-bold">
                    {req.req_id}
                  </span>
                  <h4 className="text-sm font-semibold text-white">{req.title}</h4>
                </div>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="w-7 h-7 rounded bg-white/[0.04] border-none hover:bg-rose-500/20 text-white/30 hover:text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <HiOutlineTrash />
                </button>
              </div>

              <p className="text-xs text-white/60 leading-relaxed bg-white/[0.01] p-3 rounded border border-white/[0.02]">
                {req.description}
              </p>

              {/* Extracted NLP Constraints */}
              {req.constraints && req.constraints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">spaCy NLP Entities & Constraints</p>
                  <div className="flex flex-wrap gap-2">
                    {req.constraints.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-xs text-white/80">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">{c.entity}</span>
                        <span className="text-white/30">|</span>
                        <span className="text-white/50">{c.attribute}</span>
                        <span className="text-amber-400 font-mono font-semibold">{c.operator}</span>
                        <span className="text-emerald-400 font-semibold">{JSON.stringify(c.value)}</span>
                        <span className="text-white/30">|</span>
                        <span className="text-[10px] bg-white/[0.08] px-1 rounded text-white/70 font-semibold">{c.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
