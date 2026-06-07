import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Download } from 'lucide-react';
import { HiOutlineArrowRight } from 'react-icons/hi';

const testCases = [
  { id: 'tc1', title: 'User can complete checkout with valid card', type: 'Functional', priority: 'High', severity: 'Critical', module: 'Checkout', status: 'Generated', steps: 8 },
  { id: 'tc2', title: 'Cart persists after page refresh', type: 'Functional', priority: 'Medium', severity: 'Major', module: 'Cart', status: 'Generated', steps: 5 },
  { id: 'tc3', title: 'Checkout with expired credit card', type: 'Edge Case', priority: 'High', severity: 'Critical', module: 'Checkout', status: 'Generated', steps: 6 },
  { id: 'tc4', title: 'Add 999 items to cart (boundary)', type: 'Edge Case', priority: 'Low', severity: 'Minor', module: 'Cart', status: 'Generated', steps: 4 },
  { id: 'tc5', title: 'POST /api/orders returns 201 with valid payload', type: 'API', priority: 'High', severity: 'Critical', module: 'Orders API', status: 'Generated', steps: 3 },
  { id: 'tc6', title: 'GET /api/products pagination works correctly', type: 'API', priority: 'Medium', severity: 'Major', module: 'Products API', status: 'Generated', steps: 4 },
  { id: 'tc7', title: 'XSS injection in search input', type: 'Security', priority: 'High', severity: 'Critical', module: 'Search', status: 'Generated', steps: 5 },
  { id: 'tc8', title: 'SQL injection in login form', type: 'Security', priority: 'High', severity: 'Critical', module: 'Auth', status: 'Generated', steps: 4 },
  { id: 'tc9', title: 'User login with valid credentials', type: 'Functional', priority: 'High', severity: 'Critical', module: 'Auth', status: 'Generated', steps: 5 },
  { id: 'tc10', title: 'Empty cart checkout attempt', type: 'Edge Case', priority: 'Medium', severity: 'Major', module: 'Checkout', status: 'Generated', steps: 3 },
];

const typeColors = {
  Functional: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'Edge Case': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  API: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Security: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const priorityColors = {
  High: 'text-rose-400',
  Medium: 'text-amber-400',
  Low: 'text-emerald-400',
};

const severityColors = {
  Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Major: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Minor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const allTypes = ['All', 'Functional', 'Edge Case', 'API', 'Security'];
const PAGE_SIZE = 10;

export default function TestCasesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = testCases.filter(tc => {
    const matchSearch = tc.title.toLowerCase().includes(search.toLowerCase()) ||
      tc.module.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || tc.type === typeFilter;
    return matchSearch && matchType;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Test Cases</h2>
          <p className="text-sm text-white/40 mt-0.5">{testCases.length} test cases generated</p>
        </div>
        <button className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent flex items-center gap-2">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Type summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {allTypes.slice(1).map((type, i) => {
          const count = testCases.filter(tc => tc.type === type).length;
          return (
            <motion.button key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setTypeFilter(typeFilter === type ? 'All' : type)}
              className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${typeFilter === type ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1]'}`}>
              <p className="text-xl font-semibold text-white">{count}</p>
              <p className="text-xs text-white/40 mt-0.5">{type}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search test cases or modules..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-400/50 transition-colors" />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          {allTypes.map(t => (
            <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all border-none cursor-pointer ${typeFilter === t ? 'bg-white/[0.08] text-white' : 'bg-transparent text-white/40 hover:text-white/70'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Test Case', 'Type', 'Module', 'Priority', 'Severity', 'Steps', ''].map((h, i) => (
                <th key={i} className={`px-4 py-3 text-xs font-medium text-white/30 text-left ${i === 6 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginated.map((tc, i) => (
              <motion.tr key={tc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-white/70 group-hover:text-white transition-colors truncate">{tc.title}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeColors[tc.type]}`}>{tc.type}</span>
                </td>
                <td className="px-4 py-3"><span className="text-xs text-white/40">{tc.module}</span></td>
                <td className="px-4 py-3"><span className={`text-xs font-medium ${priorityColors[tc.priority]}`}>{tc.priority}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${severityColors[tc.severity]}`}>{tc.severity}</span>
                </td>
                <td className="px-4 py-3"><span className="text-xs text-white/40">{tc.steps} steps</span></td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/testcases/${tc.id}`} className="no-underline w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] inline-flex items-center justify-center text-white/30 hover:text-white transition-colors">
                    <HiOutlineArrowRight className="text-sm" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-14 h-8 rounded-lg text-xs font-medium transition-all border-none cursor-pointer disabled:opacity-30 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-14 h-8 rounded-lg text-xs font-medium transition-all border-none cursor-pointer disabled:opacity-30 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center"
              >
                Next
              </button>
            </div>
            <p className="text-[10px] text-white/30">Page {page} of {totalPages}</p>
          </div>
        </div>
      )}
    </div>
  );
}
