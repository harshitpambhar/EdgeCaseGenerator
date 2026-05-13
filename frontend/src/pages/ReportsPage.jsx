import { motion } from 'framer-motion';
import { HiOutlineDocumentDownload, HiOutlineDocumentText, HiOutlineCode, HiOutlineCalendar, HiOutlineDownload, HiOutlineEye } from 'react-icons/hi';

const reportCards = [
  { title: 'Full Coverage Report', desc: 'Complete test coverage analysis with line, branch, and function metrics', format: 'PDF', size: '2.4 MB', icon: HiOutlineDocumentText, color: '#EF4444' },
  { title: 'Test Suite Export', desc: 'All AI-generated test cases packaged and ready for integration', format: 'ZIP', size: '8.1 MB', icon: HiOutlineCode, color: '#6366F1' },
  { title: 'Risk Assessment', desc: 'Detailed risk analysis with function-level scoring and recommendations', format: 'HTML', size: '1.2 MB', icon: HiOutlineDocumentDownload, color: '#F59E0B' },
  { title: 'JSON Data Export', desc: 'Raw analysis data for CI/CD pipeline integration and automation', format: 'JSON', size: '340 KB', icon: HiOutlineCode, color: '#10B981' },
];

const history = [
  { name: 'payment-service-report', date: '2026-05-12', format: 'PDF', status: 'Ready', coverage: '87%' },
  { name: 'auth-gateway-analysis', date: '2026-05-11', format: 'HTML', status: 'Ready', coverage: '72%' },
  { name: 'data-pipeline-tests', date: '2026-05-10', format: 'ZIP', status: 'Ready', coverage: '45%' },
  { name: 'ml-inference-coverage', date: '2026-05-09', format: 'PDF', status: 'Ready', coverage: '91%' },
  { name: 'api-gateway-report', date: '2026-05-08', format: 'JSON', status: 'Expired', coverage: '68%' },
];

const summaryCards = [
  { label: 'Total Reports', value: '47', change: '+5 this week' },
  { label: 'Avg Coverage', value: '78%', change: '+3.2%' },
  { label: 'Tests Exported', value: '1,247', change: '+120 today' },
  { label: 'Active Repos', value: '12', change: '3 pending' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-[2rem] glass-panel border-white/5 p-6 bg-[#07111f]/40 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 relative z-10">{card.label}</p>
            <p className="text-3xl font-black font-heading text-white tracking-tighter relative z-10">{card.value}</p>
            <p className="text-[10px] font-black text-emerald-400 mt-2 uppercase tracking-tighter relative z-10">{card.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Download Cards */}
      <div className="space-y-6">
        <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest px-2">Export Protocols</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="rounded-[2.5rem] glass-panel border-white/5 p-8 group cursor-pointer bg-[#050816]/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-grid-cyber opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center mb-6 bg-white/[0.03] border border-white/5 group-hover:scale-110 transition-transform" style={{ color: card.color }}>
                <card.icon className="text-2xl" />
              </div>
              <h4 className="text-sm font-black font-heading text-white mb-2 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{card.title}</h4>
              <p className="text-[11px] font-bold text-slate-500 mb-6 leading-relaxed group-hover:text-slate-400 transition-colors">{card.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-[#050816] text-slate-400 border border-white/5 uppercase tracking-tighter">{card.format}</span>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{card.size}</span>
                </div>
                <button className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-400 hover:text-[#050816] transition-all border-none cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                  <HiOutlineDownload className="text-lg" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-[2.5rem] glass-panel border-white/5 overflow-hidden bg-[#07111f]/40 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-grid-cyber opacity-5 pointer-events-none" />
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10">
          <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest">Neural History</h3>
          <button className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-[0.2em] bg-transparent border-none cursor-pointer">
            Archive Access →
          </button>
        </div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data Fragment</th>
                <th className="text-left px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="text-left px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Encoding</th>
                <th className="text-left px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Integrity</th>
                <th className="text-left px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Protocol</th>
                <th className="text-right px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Interface</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((row, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                  className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-xs font-black font-mono text-slate-200 group-hover:text-white transition-colors">{row.name}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-tighter">
                      <HiOutlineCalendar className="text-slate-700" /> {row.date}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black px-2 py-1 rounded bg-[#050816] text-slate-500 border border-white/5 font-mono group-hover:border-cyan-400/30 transition-colors uppercase">{row.format}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black font-mono text-emerald-400 tracking-tighter">{row.coverage}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      row.status === 'Ready' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                      : 'bg-white/5 text-slate-600'
                    }`}>{row.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-cyan-400/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-all border-none cursor-pointer group-hover:border-white/10 border">
                        <HiOutlineEye className="text-lg" />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-emerald-500/10 flex items-center justify-center text-slate-500 hover:text-emerald-400 transition-all border-none cursor-pointer group-hover:border-white/10 border">
                        <HiOutlineDownload className="text-lg" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
