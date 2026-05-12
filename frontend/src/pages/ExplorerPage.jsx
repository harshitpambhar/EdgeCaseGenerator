import Editor from '@monaco-editor/react';

export default function ExplorerPage() {
  const [selectedFile, setSelectedFile] = useState('handler.py');
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
    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-10rem)] pb-6">
      {/* File Tree */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-3 rounded-[2.5rem] glass-panel border-white/5 overflow-hidden flex flex-col bg-[#07111f]/40 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-grid-cyber opacity-5 pointer-events-none" />
        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] relative z-10">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Explorer</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
          {fileTree.map((item, i) => <FileTreeItem key={i} item={item} />)}
        </div>
      </motion.div>

      {/* Editor Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="lg:col-span-5 rounded-[2.5rem] glass-panel border-white/5 overflow-hidden flex flex-col bg-[#050816]/80 relative group">
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <div className="flex gap-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineDocument className="text-cyan-400" />
              <span className="text-[10px] font-black font-mono text-white uppercase tracking-[0.2em]">{selectedFile}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">Analysis Failed (3 Risks)</span>
             </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              padding: { top: 24, bottom: 24 },
              cursorStyle: 'block',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              renderLineHighlight: 'all',
              lineNumbersMinChars: 3,
              backgroundColor: '#050816',
            }}
            loading={
              <div className="flex items-center justify-center h-full bg-[#050816]">
                <div className="text-center">
                  <RiRobot2Line className="text-4xl text-cyan-400 animate-pulse mb-4" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compiling Neural Interface...</p>
                </div>
              </div>
            }
          />
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-grid-cyber opacity-5" />
        </div>

        {/* Editor Status Bar */}
        <div className="h-10 bg-cyan-400 flex items-center justify-between px-8 text-[9px] text-[#050816] font-black uppercase tracking-[0.15em]">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2">
              <HiOutlineCode className="text-sm" /> ARCHIVE_PYTHON_3.9
            </span>
            <span className="flex items-center gap-2 group-hover:scale-105 transition-transform">
              <RiRobot2Line className="text-sm animate-pulse" /> NEURAL_ASSIST: OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-8">
            <span className="bg-[#050816] text-cyan-400 px-2 py-0.5 rounded">Ln 42, Col 18</span>
            <span>Tab size: 4</span>
            <span className="hidden sm:block">Encoding: UTF-8</span>
          </div>
        </div>
      </motion.div>

      {/* AI Panel */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        className="lg:col-span-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* AI Suggestions */}
        <div className="rounded-[2rem] glass-panel border-white/5 overflow-hidden bg-[#07111f]/40">
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiRobot2Line className="text-cyan-400 text-lg" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Intel Core</h3>
            </div>
            <span className="text-[9px] font-black text-cyan-400 animate-pulse-neon">LIVE FEED</span>
          </div>
          <div className="p-4 space-y-3">
            {suggestions.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${s.severity === 'high' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-amber-500 shadow-amber-500/20'}`} />
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">{s.text}</p>
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
