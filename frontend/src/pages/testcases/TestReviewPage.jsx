import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Download, Trash2 } from 'lucide-react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlinePencil } from 'react-icons/hi';

export default function TestReviewPage() {
  const [selectedTests, setSelectedTests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const testCases = [
    { id: 1, title: 'User can complete checkout with valid card', type: 'Functional', priority: 'High', status: 'Pending', steps: 8 },
    { id: 2, title: 'Cart persists after page refresh', type: 'Edge Case', priority: 'Medium', status: 'Pending', steps: 5 },
    { id: 3, title: 'Checkout with expired credit card', type: 'Edge Case', priority: 'High', status: 'Pending', steps: 6 },
    { id: 4, title: 'POST /api/orders returns 201', type: 'API', priority: 'High', status: 'Pending', steps: 3 },
    { id: 5, title: 'XSS injection in search input', type: 'Security', priority: 'High', status: 'Pending', steps: 5 },
  ];

  const handleApprove = (id) => {
    console.log('Approved:', id);
  };

  const handleReject = (id) => {
    console.log('Rejected:', id);
  };

  const handleSelectAll = () => {
    if (selectedTests.length === testCases.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(testCases.map((t) => t.id));
    }
  };

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

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Test Case Review</h1>
        <p className="text-white/60">Review, edit, approve or reject generated test cases</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-60 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors">
          Approve All
        </button>
        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
          Export
        </button>
      </div>

      {/* Test Cases Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTests.length === testCases.length}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/60">Test Case</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/60">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/60">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/60">Steps</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-white/60">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc, i) => (
              <tr
                key={tc.id}
                className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                  selectedTests.includes(tc.id) ? 'bg-indigo-500/10' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(tc.id)}
                    onChange={(e) =>
                      setSelectedTests((prev) =>
                        e.target.checked ? [...prev, tc.id] : prev.filter((id) => id !== tc.id)
                      )
                    }
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-4">
                  {editingId === tc.id ? (
                    <input
                      type="text"
                      defaultValue={tc.title}
                      className="w-full px-2 py-1 bg-slate-800 border border-indigo-500 rounded text-sm text-white"
                      onBlur={() => setEditingId(null)}
                    />
                  ) : (
                    <span className="text-sm text-white">{tc.title}</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${typeColors[tc.type]}`}>
                    {tc.type}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-sm font-semibold ${priorityColors[tc.priority]}`}>
                    {tc.priority}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-white/60">{tc.steps} steps</td>
                <td className="px-4 py-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingId(tc.id)}
                    className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-indigo-400 transition-colors"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApprove(tc.id)}
                    className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                  >
                    <HiOutlineCheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(tc.id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400 transition-colors"
                  >
                    <HiOutlineXCircle className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Status Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: testCases.length, color: 'indigo' },
          { label: 'Pending Review', value: testCases.length, color: 'amber' },
          { label: 'Approved', value: 0, color: 'emerald' },
          { label: 'Rejected', value: 0, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className={`bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-lg p-4 text-center`}>
            <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
            <p className="text-sm text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
