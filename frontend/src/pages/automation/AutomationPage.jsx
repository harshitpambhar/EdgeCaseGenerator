import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, ChevronRight, ChevronDown, FileCode } from 'lucide-react';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineClock } from 'react-icons/hi';

const fileTree = [
  {
    folder: 'ecommerce-frontend',
    files: [
      { id: 's1', name: 'checkout-flow.spec.ts', tests: 8, status: 'Ready', size: '4.2 KB' },
      { id: 's2', name: 'cart-operations.spec.ts', tests: 5, status: 'Ready', size: '2.8 KB' },
      { id: 's3', name: 'auth-login.spec.ts', tests: 6, status: 'Ready', size: '3.1 KB' },
      { id: 's4', name: 'product-search.spec.ts', tests: 4, status: 'Ready', size: '2.2 KB' },
    ],
  },
  {
    folder: 'api-tests',
    files: [
      { id: 's5', name: 'orders-api.spec.ts', tests: 7, status: 'Ready', size: '3.6 KB' },
      { id: 's6', name: 'products-api.spec.ts', tests: 5, status: 'Ready', size: '2.9 KB' },
      { id: 's7', name: 'auth-api.spec.ts', tests: 4, status: 'Pending', size: '2.1 KB' },
    ],
  },
  {
    folder: 'security',
    files: [
      { id: 's8', name: 'xss-injection.spec.ts', tests: 5, status: 'Ready', size: '2.4 KB' },
      { id: 's9', name: 'sql-injection.spec.ts', tests: 4, status: 'Ready', size: '2.0 KB' },
    ],
  },
];

const statusIcon = {
  Ready: <HiOutlineCheckCircle className="text-emerald-400 text-sm" />,
  Pending: <HiOutlineClock className="text-amber-400 text-sm" />,
  Error: <HiOutlineExclamationCircle className="text-rose-400 text-sm" />,
};

const statusStyle = {
  Ready: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Error: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function AutomationPage() {
  const [expanded, setExpanded] = useState({ 'ecommerce-frontend': true, 'api-tests': true, 'security': false });

  const totalScripts = fileTree.reduce((acc, f) => acc + f.files.length, 0);
  const totalTests = fileTree.reduce((acc, f) => acc + f.files.reduce((a, s) => a + s.tests, 0), 0);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Automation Scripts</h2>
          <p className="text-sm text-white/40 mt-0.5">{totalScripts} Playwright scripts · {totalTests} test cases</p>
        </div>
        <button className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent flex items-center gap-2">
          <Download className="w-4 h-4" /> Download all
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total scripts', value: totalScripts },
          { label: 'Total tests', value: totalTests },
          { label: 'Ready to run', value: fileTree.reduce((acc, f) => acc + f.files.filter(s => s.status === 'Ready').length, 0) },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
            <p className="text-2xl font-semibold text-white">{s.value}</p>
            <p className="text-xs text-white/30 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* File tree */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-medium text-white">Script explorer</p>
        </div>
        <div className="p-3 space-y-1">
          {fileTree.map((folder) => (
            <div key={folder.folder}>
              <button onClick={() => setExpanded(prev => ({ ...prev, [folder.folder]: !prev[folder.folder] }))}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer bg-transparent border-none text-left">
                {expanded[folder.folder] ? <ChevronDown className="w-3.5 h-3.5 text-white/30" /> : <ChevronRight className="w-3.5 h-3.5 text-white/30" />}
                <span className="text-xs font-medium text-white/60">{folder.folder}/</span>
                <span className="text-[10px] text-white/25 ml-auto">{folder.files.length} files</span>
              </button>

              {expanded[folder.folder] && (
                <div className="ml-4 space-y-0.5">
                  {folder.files.map((file, i) => (
                    <motion.div key={file.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400/60 flex-shrink-0" />
                      <Link to={`/automation/${file.id}`} className="flex-1 text-xs text-white/60 hover:text-white transition-colors no-underline font-mono">
                        {file.name}
                      </Link>
                      <span className="text-[10px] text-white/25">{file.tests} tests</span>
                      <span className="text-[10px] text-white/25">{file.size}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle[file.status]}`}>{file.status}</span>
                      <button className="w-6 h-6 rounded-md bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors border-none cursor-pointer opacity-0 group-hover:opacity-100">
                        <Download className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
