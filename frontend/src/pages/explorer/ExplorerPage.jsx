import { useState } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { HiOutlineCode, HiOutlineDocument, HiOutlineFolder, HiOutlineFolderOpen } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import TestPreview from '../../components/editor/TestPreview';

const fileTree = [
  {
    name: 'payment', type: 'folder', children: [
      { name: 'handler.py', type: 'file', lang: 'python' },
      { name: 'models.py', type: 'file', lang: 'python' },
    ]
  },
  {
    name: 'auth', type: 'folder', children: [
      { name: 'service.js', type: 'file', lang: 'javascript' },
      { name: 'middleware.js', type: 'file', lang: 'javascript' },
    ]
  },
  {
    name: 'utils', type: 'folder', children: [
      { name: 'parser.ts', type: 'file', lang: 'typescript' },
      { name: 'validators.ts', type: 'file', lang: 'typescript' },
    ]
  },
];

const suggestions = [
  { text: 'Null pointer risk: card parameter not validated before property access on line 4.', severity: 'high' },
  { text: 'SQL injection vector: buildQuery() uses string concatenation instead of parameterized queries.', severity: 'high' },
  { text: 'Missing boundary test for amount=0 and amount=-1 edge cases.', severity: 'medium' },
];

function FileTreeItem({ item, depth = 0 }) {
  const [open, setOpen] = useState(true);
  const isFolder = item.type === 'folder';

  return (
    <div>
      <div
        onClick={() => isFolder && setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer group transition-colors"
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {isFolder
          ? open
            ? <HiOutlineFolderOpen className="text-indigo-400 text-sm flex-shrink-0" />
            : <HiOutlineFolder className="text-indigo-400/60 text-sm flex-shrink-0" />
          : <HiOutlineDocument className="text-white/30 text-sm flex-shrink-0" />
        }
        <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{item.name}</span>
      </div>
      {isFolder && open && item.children?.map((child, i) => (
        <FileTreeItem key={i} item={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ExplorerPage() {
  const [selectedFile] = useState('handler.py');
  const [code, setCode] = useState(`def process_payment(amount, card, currency="USD"):
    # AI_ANALYSIS: Critical risk detected in line 4
    # POTENTIAL_VULN: Null pointer risk for 'card'
    if not card:
        raise ValueError("Card details required")
    
    # SECURITY_ALERT: build_query uses string concatenation
    # RECOMMENDATION: Use parameterized queries
    query = f"SELECT * FROM transactions WHERE card_num = '{card}'"
    
    return {"status": "success", "tx_id": "TX_4920492"}`);

  return (
    <div className="grid lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)] pb-4">
      {/* File Tree */}
      <motion.div
        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden flex flex-col"
      >
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Explorer</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {fileTree.map((item, i) => <FileTreeItem key={i} item={item} />)}
        </div>
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="lg:col-span-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] overflow-hidden flex flex-col group"
      >
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-white/[0.06] bg-white/[0.02] px-4">
          <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-indigo-400 text-white">
            <HiOutlineDocument className="text-indigo-400 text-sm" />
            <span className="text-xs font-medium">{selectedFile}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 px-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[9px] font-semibold text-rose-400">3 issues</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v)}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              renderLineHighlight: 'line',
              lineNumbersMinChars: 3,
            }}
            loading={
              <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
                <RiRobot2Line className="text-3xl text-indigo-400 animate-pulse" />
              </div>
            }
          />
        </div>

        {/* Status bar */}
        <div className="h-7 bg-indigo-500/20 border-t border-indigo-500/30 flex items-center justify-between px-4 text-[10px] text-indigo-300/70 font-medium">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><HiOutlineCode className="text-xs" /> Python 3.9</span>
            <span className="flex items-center gap-1.5"><RiRobot2Line className="text-xs" /> AI assist on</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ln 42, Col 18</span>
            <span>UTF-8</span>
          </div>
        </div>
      </motion.div>

      {/* AI Panel */}
      <motion.div
        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto"
      >
        {/* Suggestions */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiRobot2Line className="text-indigo-400 text-sm" />
              <span className="text-xs font-semibold text-white">AI Analysis</span>
            </div>
            <span className="text-[9px] font-medium text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <div className="p-3 space-y-2">
            {suggestions.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors cursor-pointer"
              >
                <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.severity === 'high' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                <p className="text-xs text-white/50 leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <TestPreview />
      </motion.div>
    </div>
  );
}
