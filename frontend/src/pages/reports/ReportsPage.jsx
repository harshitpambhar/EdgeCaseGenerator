import { motion } from 'framer-motion';
import { HiOutlineDocumentDownload, HiOutlineDocumentText, HiOutlineCode, HiOutlineDownload, HiOutlineEye } from 'react-icons/hi';

const reportCards = [
  { title: 'Full Coverage Report', desc: 'Line, branch, and function coverage metrics', format: 'PDF', size: '2.4 MB', icon: HiOutlineDocumentText, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { title: 'Test Suite Export', desc: 'All generated test cases ready for integration', format: 'ZIP', size: '8.1 MB', icon: HiOutlineCode, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { title: 'Risk Assessment', desc: 'Function-level risk scoring and recommendations', format: 'HTML', size: '1.2 MB', icon: HiOutlineDocumentDownload, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { title: 'JSON Data Export', desc: 'Raw analysis data for CI/CD integration', format: 'JSON', size: '340 KB', icon: HiOutlineCode, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const history = [
  { name: 'payment-service-report', date: '2026-05-12', format: 'PDF', status: 'Ready', coverage: '87%' },
  { name: 'auth-gateway-analysis', date: '2026-05-11', format: 'HTML', status: 'Ready', coverage: '72%' },
  { name: 'data-pipeline-tests', date: '2026-05-10', format: 'ZIP', status: 'Ready', coverage: '45%' },
  { name: 'ml-inference-coverage', date: '2026-05-09', format: 'PDF', status: 'Ready', coverage: '91%' },
  { name: 'api-gateway-report', date: '2026-05-08', format: 'JSON', status: 'Expired', coverage: '68%' },
];

const summaryStats = [
  { label: 'Total reports', value: '47', sub: '+5 this week' },
  { label: 'Avg coverage', value: '78%', sub: '+3.2%' },
  { label: 'Tests exported', value: '1,247', sub: '+120 today' },
  { label: 'Active repos', value: '12', sub: '3 pending' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Reports</h2>
        <p className="text-sm text-white/40 mt-0.5">Download and manage your analysis reports.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className="text-2xl font-semibold text-white">{s.value}</p>
            <p className="text-xs text-emerald-400 mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Download cards */}
      <div>
        <p className="text-sm font-medium text-white mb-3">Available exports</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/[0.1] transition-colors cursor-pointer group">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
                <card.icon className={`text-lg ${card.color}`} />
              </div>
              <p className="text-sm font-medium text-white mb-1 group-hover:text-indigo-300 transition-colors">{card.title}</p>
              <p className="text-xs text-white/40 mb-4 leading-relaxed">{card.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-white/40 font-mono">{card.format}</span>
                  <span className="text-[11px] text-white/25">{card.size}</span>
                </div>
                <button className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all border-none cursor-pointer">
                  <HiOutlineDownload className="text-sm" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <p className="text-sm font-medium text-white">History</p>
          <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent border-none cursor-pointer">
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Name', 'Date', 'Format', 'Coverage', 'Status', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-xs font-medium text-white/30 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-white/70 font-mono group-hover:text-white transition-colors">{row.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-white/40">{row.date}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-white/[0.06] text-white/40 font-mono">{row.format}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium text-emerald-400">{row.coverage}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${
                      row.status === 'Ready'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/30'
                    }`}>{row.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors border-none cursor-pointer">
                        <HiOutlineEye className="text-sm" />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-colors border-none cursor-pointer">
                        <HiOutlineDownload className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
