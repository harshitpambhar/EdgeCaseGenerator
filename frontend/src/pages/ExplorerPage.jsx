import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineFolder, HiOutlineFolderOpen, HiOutlineDocument, HiOutlineChevronRight, HiOutlineChevronDown, HiOutlineExclamation } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import TestPreview from '../components/TestPreview';
import RiskPanel from '../components/RiskPanel';

const fileTree = [
  { name: 'src', type: 'folder', children: [
    { name: 'payment', type: 'folder', children: [
      { name: 'handler.py', type: 'file', risk: 'high' },
      { name: 'models.py', type: 'file', risk: 'low' },
      { name: 'utils.py', type: 'file', risk: 'medium' },
    ]},
    { name: 'auth', type: 'folder', children: [
      { name: 'service.js', type: 'file', risk: 'high' },
      { name: 'middleware.js', type: 'file', risk: 'low' },
    ]},
    { name: 'utils', type: 'folder', children: [
      { name: 'parser.ts', type: 'file', risk: 'medium' },
      { name: 'helpers.ts', type: 'file', risk: 'low' },
    ]},
  ]},
  { name: 'tests', type: 'folder', children: [
    { name: 'test_handler.py', type: 'file', risk: 'low' },
    { name: 'test_auth.js', type: 'file', risk: 'low' },
  ]},
  { name: 'README.md', type: 'file', risk: 'low' },
];

const suggestions = [
  { text: 'processPayment() lacks null-check for card parameter', severity: 'high' },
  { text: 'Consider adding timeout handling in authenticateUser()', severity: 'medium' },
  { text: 'parseXMLInput() is vulnerable to XXE injection', severity: 'high' },
  { text: 'Add boundary tests for amount parameter (0, negative, overflow)', severity: 'medium' },
];

function FileTreeItem({ item, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const isFolder = item.type === 'folder';
  const riskDot = item.risk === 'high' ? 'bg-[#EF4444]' : item.risk === 'medium' ? 'bg-[#F59E0B]' : '';

  return (
    <div>
      <div onClick={() => isFolder && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-[#334155]/30 transition-colors group`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}>
        {isFolder ? (
          <>
            {isOpen ? <HiOutlineChevronDown className="text-[#64748B] text-xs" /> : <HiOutlineChevronRight className="text-[#64748B] text-xs" />}
            {isOpen ? <HiOutlineFolderOpen className="text-[#818CF8] text-sm" /> : <HiOutlineFolder className="text-[#818CF8] text-sm" />}
          </>
        ) : (
          <>
            <span className="w-3" />
            <HiOutlineDocument className="text-[#94A3B8] text-sm" />
          </>
        )}
        <span className="text-xs text-[#E2E8F0] group-hover:text-[#F8FAFC] flex-1">{item.name}</span>
        {riskDot && <div className={`w-1.5 h-1.5 rounded-full ${riskDot}`} />}
      </div>
      {isFolder && isOpen && item.children?.map((child, i) => (
        <FileTreeItem key={i} item={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <div className="grid lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
      {/* File Tree */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#334155]/50">
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Explorer</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {fileTree.map((item, i) => <FileTreeItem key={i} item={item} />)}
        </div>
      </motion.div>

      {/* Editor Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="lg:col-span-5 rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#334155]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
              <div className="w-3 h-3 rounded-full bg-[#10B981]/80" />
            </div>
            <span className="text-xs font-mono text-[#94A3B8] ml-2">handler.py</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#EF4444]/10 text-[#F87171] font-medium">3 risks detected</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-6">
          {/* Monaco editor placeholder */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-4">
                <RiRobot2Line className="text-3xl text-[#818CF8]" />
              </div>
              <p className="text-sm font-medium text-[#F8FAFC] mb-1">Monaco Editor</p>
              <p className="text-xs text-[#64748B]">Integrated code editor with AI suggestions</p>
              <div className="mt-4 px-4 py-2 rounded-lg bg-[#0F172A] border border-[#334155] text-xs font-mono text-[#94A3B8]">
                {'<MonacoEditor /> — Ready for integration'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Panel */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        className="lg:col-span-4 space-y-4 overflow-y-auto">
        {/* AI Suggestions */}
        <div className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#334155]/50 flex items-center gap-2">
            <RiRobot2Line className="text-[#818CF8]" />
            <h3 className="text-xs font-semibold text-[#F8FAFC]">AI Suggestions</h3>
          </div>
          <div className="p-3 space-y-2">
            {suggestions.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[#0F172A]/40 hover:bg-[#334155]/20 transition-colors cursor-pointer">
                <HiOutlineExclamation className={`mt-0.5 flex-shrink-0 ${s.severity === 'high' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`} />
                <p className="text-xs text-[#E2E8F0] leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Generated Test Preview */}
        <TestPreview />
      </motion.div>
    </div>
  );
}
