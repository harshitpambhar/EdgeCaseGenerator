import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Loader, AlertCircle, ChevronLeft, ChevronRight, FileText, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { jobService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLOR_BY_STATUS } from '../../constants/status-values';

const PAGE_SIZE = 10;

function extractRepoName(url) {
  try {
    const parts = url.replace(/\.git$/, '').split('/');
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
}

function parseTestCases(resultJson) {
  if (!resultJson) return [];
  try {
    const data = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
    if (data.generated_tests && Array.isArray(data.generated_tests)) {
      return data.generated_tests;
    }
    if (Array.isArray(data)) return data;
    if (data.tests && Array.isArray(data.tests)) return data.tests;
    return [];
  } catch {
    return [];
  }
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedProjectPage, setExpandedProjectPage] = useState(1);

  const toggleExpand = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
      setExpandedProjectPage(1);
    }
  };

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    jobService.getByUser(user.email)
      .then(({ data }) => {
        setProjects(data || []);
        setPage(1);
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.message || 'Failed to fetch projects';
        setError(msg);
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const allStatuses = ['All', 'Completed', 'Running', 'Failed', 'Queued', 'Pending'];

  const filtered = projects.filter(p => {
    const name = extractRepoName(p.repoUrl).toLowerCase();
    const url = (p.repoUrl || '').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || name.includes(q) || url.includes(q);
    const matchStatus = statusFilter === 'All' || (p.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-6 h-6 text-indigo-400 animate-spin" />
        <span className="ml-3 text-sm text-white/40">Loading your projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <p className="text-sm text-white/40 mt-0.5">{projects.length} repository{projects.length !== 1 ? 'ies' : 'y'} analyzed</p>
        </div>
        <Link to="/upload"
          className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-2">
          New project
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && projects.length === 0 && !error && (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm mb-4">No projects yet. Upload your first repository to get started.</p>
          <Link to="/upload"
            className="inline-flex h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline items-center gap-2">
            Upload repository
          </Link>
        </div>
      )}

      {projects.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search repositories or URLs..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400/50 transition-colors" />
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {allStatuses.map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all border-none cursor-pointer ${statusFilter === s ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/40 hover:text-white/70'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {paginated.map((project, i) => {
              const testCases = parseTestCases(project.resultJson);
              const testCount = testCases.length;
              const tcTotalPages = Math.ceil(testCount / PAGE_SIZE);
              const tcPaginated = testCases.slice((expandedProjectPage - 1) * PAGE_SIZE, expandedProjectPage * PAGE_SIZE);

              return (
                <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                  {/* Project header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white/40" />
                        </div>
                        <div>
                          <Link to={`/project/${project.id}`}
                            className="text-sm font-medium text-white hover:text-indigo-300 transition-colors no-underline">
                            {extractRepoName(project.repoUrl)}
                          </Link>
                          <p className="text-xs text-white/30 mt-0.5 flex items-center gap-2">
                            <span className="truncate max-w-[300px]">{project.repoUrl}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${COLOR_BY_STATUS[project.status] || 'text-white/40 bg-white/5 border-white/10'}`}>
                          {project.status || 'Unknown'}
                        </span>
                        <button onClick={() => toggleExpand(project.id)}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white transition-colors border-none cursor-pointer flex items-center justify-center">
                          <ArrowRight className={`w-3.5 h-3.5 transition-transform ${expandedProject === project.id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.05] text-xs text-white/30">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {testCount} test cases
                      </span>
                      {project.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {project.status === 'COMPLETED' && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                      {project.status === 'FAILED' && (
                        <span className="flex items-center gap-1 text-rose-400">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      {project.status === 'RUNNING' && (
                        <span className="flex items-center gap-1 text-indigo-400">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Running
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Test cases section */}
                  {expandedProject === project.id && (
                    <div className="border-t border-white/[0.05] bg-white/[0.01]">
                      {testCount > 0 ? (
                        <div className="p-4">
                          <p className="text-xs font-medium text-white/50 mb-3">Generated Test Cases ({testCount})</p>
                          <div className="space-y-2">
                            {tcPaginated.map((tc, idx) => {
                              const realIdx = (expandedProjectPage - 1) * PAGE_SIZE + idx;
                              return (
                                <div key={realIdx}
                                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-[10px] text-white/20 w-5 flex-shrink-0">#{realIdx + 1}</span>
                                    <span className="text-xs text-white/60 truncate">{tc.title || tc.name || `Test case ${realIdx + 1}`}</span>
                                  </div>
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border text-indigo-400 bg-indigo-500/10 border-indigo-500/20 flex-shrink-0 ml-2">
                                    {tc.type || tc.category || 'Test'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {testCount > PAGE_SIZE && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                              <p className="text-[10px] text-white/30">
                                Showing {(expandedProjectPage - 1) * PAGE_SIZE + 1}–{Math.min(expandedProjectPage * PAGE_SIZE, testCount)} of {testCount} test cases
                              </p>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setExpandedProjectPage(p => Math.max(1, p - 1))}
                                    disabled={expandedProjectPage === 1}
                                    className="w-12 h-6 rounded text-[10px] font-medium transition-all border-none cursor-pointer disabled:opacity-30 bg-white/[0.04] text-white/40 hover:text-white"
                                  >
                                    Prev
                                  </button>
                                  <button
                                    onClick={() => setExpandedProjectPage(p => Math.min(tcTotalPages, p + 1))}
                                    disabled={expandedProjectPage === tcTotalPages}
                                    className="w-12 h-6 rounded text-[10px] font-medium transition-all border-none cursor-pointer disabled:opacity-30 bg-white/[0.04] text-white/40 hover:text-white"
                                  >
                                    Next
                                  </button>
                                </div>
                                <p className="text-[10px] text-white/30">Page {expandedProjectPage} of {tcTotalPages}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-xs text-white/30">
                            {project.status === 'COMPLETED' ? 'No test cases generated yet' : 'Analysis in progress...'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/30">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg text-xs font-medium transition-all border-none cursor-pointer disabled:opacity-30 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all border-none cursor-pointer ${page === p ? 'bg-indigo-500 text-white' : 'bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08]'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg text-xs font-medium transition-all border-none cursor-pointer disabled:opacity-30 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
