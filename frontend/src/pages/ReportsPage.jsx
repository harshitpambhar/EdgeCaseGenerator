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
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-[#1E293B]/60 border border-[#334155]/50 p-4">
            <p className="text-xs text-[#64748B] mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-[#F8FAFC]">{card.value}</p>
            <p className="text-[11px] text-[#10B981] mt-1">{card.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Download Cards */}
      <div>
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Export Reports</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-5 group cursor-pointer hover:border-[#6366F1]/30 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="text-xl" style={{ color: card.color }} />
              </div>
              <h4 className="text-sm font-semibold text-[#F8FAFC] mb-1 group-hover:text-[#818CF8] transition-colors">{card.title}</h4>
              <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">{card.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#0F172A] text-[#94A3B8] font-mono">{card.format}</span>
                  <span className="text-[10px] text-[#64748B]">{card.size}</span>
                </div>
                <button className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#818CF8] hover:bg-[#6366F1]/20 transition-colors border-none cursor-pointer">
                  <HiOutlineDownload className="text-sm" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#334155]/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Report History</h3>
          <button className="text-xs text-[#818CF8] hover:text-[#6366F1] bg-transparent border-none cursor-pointer">Export All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Report</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Format</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Coverage</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                  className="border-b border-[#334155]/20 hover:bg-[#334155]/10 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-[#E2E8F0]">{row.name}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-[#94A3B8] flex items-center gap-1"><HiOutlineCalendar className="text-[10px]" />{row.date}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#0F172A] text-[#94A3B8] font-mono">{row.format}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-[#10B981]">{row.coverage}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      row.status === 'Ready' ? 'bg-[#10B981]/10 text-[#34D399]' : 'bg-[#64748B]/10 text-[#64748B]'
                    }`}>{row.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-7 h-7 rounded-lg hover:bg-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-colors border-none cursor-pointer bg-transparent">
                        <HiOutlineEye className="text-sm" />
                      </button>
                      <button className="w-7 h-7 rounded-lg hover:bg-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-colors border-none cursor-pointer bg-transparent">
                        <HiOutlineDownload className="text-sm" />
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
