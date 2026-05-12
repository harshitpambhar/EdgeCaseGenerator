import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineBell, HiOutlineCog, HiOutlineColorSwatch } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({ email: true, push: true, slack: false, weekly: true });
  const [aiConfig, setAiConfig] = useState({ confidence: 75, depth: 3, edgeCases: true, autoFix: false });

  const Toggle = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all border-none cursor-pointer p-0 overflow-hidden ${checked ? 'bg-cyan-400' : 'bg-white/10'}`}>
      <motion.div animate={{ x: checked ? 26 : 4 }}
        className={`absolute top-1 w-4 h-4 rounded-full shadow-lg ${checked ? 'bg-[#050816]' : 'bg-slate-400'}`} />
    </button>
  );

  const Slider = ({ value, onChange, min = 0, max = 100, label, suffix = '%' }) => (
    <div className="group">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
        <span className="text-sm font-black font-mono text-cyan-400">{value}{suffix}</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10" />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#07111f]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-3xl" />
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 text-cyan-400">
            <HiOutlineUser className="text-xl" />
          </div>
          <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest">Archive Profile</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
            <div className="w-24 h-24 rounded-3xl bg-[#050816] border border-white/10 flex items-center justify-center text-4xl font-black font-heading text-white relative">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-cyan-400 flex items-center justify-center text-[#050816] shadow-lg cursor-pointer hover:scale-110 transition-transform border-none">
              <HiOutlineCog className="text-sm" />
            </div>
          </div>
          <div className="flex-1 grid sm:grid-cols-2 gap-6 w-full">
            {[
              { label: 'Full Name', value: user?.name || '', type: 'text' },
              { label: 'Email Node', value: user?.email || '', type: 'email' },
              { label: 'Neural Role', value: 'Developer', type: 'select', options: ['Developer', 'Architect', 'Admin'] },
              { label: 'Neural Organization', value: 'TestGenAI Labs', type: 'text' },
            ].map((field, i) => (
              <div key={i}>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select className="w-full h-12 px-4 rounded-xl bg-[#050816]/60 border border-white/5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all appearance-none">
                    {field.options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type={field.type} defaultValue={field.value} className="w-full h-12 px-4 rounded-xl bg-[#050816]/60 border border-white/5 text-xs font-bold text-white placeholder-slate-700 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Configuration */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#050816]/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-cyber opacity-5 pointer-events-none" />
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 text-cyan-400">
            <RiRobot2Line className="text-xl" />
          </div>
          <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest">Neural Parameters</h3>
        </div>
        <div className="space-y-10 relative z-10">
          <div className="grid md:grid-cols-2 gap-10">
            <Slider label="Integrity Threshold" value={aiConfig.confidence}
              onChange={v => setAiConfig(p => ({ ...p, confidence: v }))} />
            <Slider label="Deep Scan Depth" value={aiConfig.depth} min={1} max={5} suffix=" LEVELS"
              onChange={v => setAiConfig(p => ({ ...p, depth: v }))} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { key: 'edgeCases', label: 'Matrix Synthesis', desc: 'Synthesize complex edge case permutations' },
              { key: 'autoFix', label: 'Autonomous Patching', desc: 'Allow AI to auto-remediate identified vulnerabilities' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter leading-relaxed">{item.desc}</p>
                </div>
                <Toggle checked={aiConfig[item.key]} onChange={v => setAiConfig(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] glass-panel border-white/5 p-8 bg-[#07111f]/40 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 text-cyan-400">
            <HiOutlineBell className="text-xl" />
          </div>
          <h3 className="text-lg font-black font-heading text-white uppercase tracking-widest">Neural Uplink Alerts</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { key: 'email', label: 'Data Relay (Email)', desc: 'Periodic analysis reports to communication node' },
            { key: 'push', label: 'Direct Sync (Push)', desc: 'Instant telemetry for real-time analysis events' },
            { key: 'slack', label: 'Slack Node', desc: 'Bridge telemetry feed to external Slack channels' },
            { key: 'weekly', label: 'Archive Digest', desc: 'Cumulative summary of weekly analysis activity' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter leading-relaxed">{item.desc}</p>
              </div>
              <Toggle checked={notifications[item.key]} onChange={v => setNotifications(p => ({ ...p, [item.key]: v }))} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save button */}
      <div className="flex justify-end gap-6 pt-4">
        <button className="h-14 px-10 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer">
          Discard
        </button>
        <button className="h-14 px-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-[10px] font-black text-white uppercase tracking-widest hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all cursor-pointer border-none active:scale-95">
          Commit Changes
        </button>
      </div>
    </div>
  );
}
