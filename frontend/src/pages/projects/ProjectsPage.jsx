import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { HiOutlineClock, HiOutlineCode } from 'react-icons/hi';
import { VscGitMerge } from 'react-icons/vsc';

const projects = [
  { id: 'p1', name: 'ecommerce-frontend', framework: 'React + Playwright', language: 'TypeScript', coverage: 84, status: 'Completed', lastRun: '1 hr ago', testCases: 312, scripts: 28 },
  { id: 'p2', name: 'payment-api', framework: 'Express + Jest', language: 'Node.js', coverage: 71, status: 'Running', lastRun: '10 min ago', testCases: 148, scripts: 14 },
  { id: 'p3', name: 'auth-service', framework: 'Spring Boot', language: 'Java', coverage: 58, status: 'Failed', lastRun: '3 hrs ago', testCases: 94, scripts: 9 },
  { id: 'p4', name: 'admin-dashboard', framework: 'Next.js + Playwright', language: 'TypeScript', coverage: 92, status: 'Completed', lastRun: '5 hrs ago', testCases: 267, scripts: 31 },
  { id: 'p5', name: 'notification-service', framework: 'FastAPI + pytest', language: 'Python', coverage: 67, status: 'Pending', lastRun: '1 day ago', testCases: 76, scripts: 8 },
  { id: 'p6', name: 'inventory-api', framework: 'Django REST', language: 'Python', coverage: 79, status: 'Completed', lastRun: '2 days ago', testCases: 201, scripts: 19 },
];

const statusStyle = {
  Completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Running: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  Failed: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const allStatuses = ['All', 'Completed', 'Running', 'Failed', 'Pending'];

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.framework.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <p className="text-sm text-white/40 mt-0.5">{projects.length} repositories analyzed</p>
        </div>
        <Link to="/upload"
          className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-2">
          New project
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects or frameworks..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400/50 transition-colors" />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          {allStatuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all border-none cursor-pointer ${statusFilter === s ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/40 hover:text-white/70'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Project grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/projects/${p.id}`} className="no-underline block rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/[0.1] transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <VscGitMerge className="text-sm text-white/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{p.name}</p>
                    <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1">
                      <HiOutlineCode className="text-xs" />{p.language}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle[p.status]}`}>{p.status}</span>
              </div>

              <p className="text-xs text-white/40 mb-3">{p.framework}</p>

              <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden mb-3">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.coverage}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
              </div>

              <div className="flex items-center justify-between text-xs text-white/30">
                <span className="text-emerald-400 font-medium">{p.coverage}% coverage</span>
                <span className="flex items-center gap-1"><HiOutlineClock className="text-xs" />{p.lastRun}</span>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.05] text-xs text-white/30">
                <span>{p.testCases} test cases</span>
                <span>{p.scripts} scripts</span>
                <ArrowRight className="w-3 h-3 ml-auto text-white/20 group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30 text-sm">No projects match your search.</div>
      )}
    </div>
  );
}
