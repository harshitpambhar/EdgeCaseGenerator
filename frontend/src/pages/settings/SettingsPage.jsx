import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineBell, HiOutlineCog } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5 rounded-full transition-colors border-none cursor-pointer p-0 flex-shrink-0 ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}
  >
    <motion.div
      animate={{ x: checked ? 22 : 3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
    />
  </button>
);

const Slider = ({ value, onChange, min = 0, max = 100, label, suffix = '%' }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs text-white/50">{label}</label>
      <span className="text-xs font-medium text-indigo-400">{value}{suffix}</span>
    </div>
    <div className="relative h-1.5 rounded-full bg-white/[0.08]">
      <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10" />
    </div>
  </div>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({ email: true, push: true, slack: false, weekly: true });
  const [aiConfig, setAiConfig] = useState({ confidence: 75, depth: 3, edgeCases: true, autoFix: false });

  return (
    <div className="max-w-3xl space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="text-sm text-white/40 mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <HiOutlineUser className="text-sm text-white/40" />
          <p className="text-sm font-medium text-white">Profile</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-400 to-rose-500 flex items-center justify-center text-2xl font-semibold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#1a1a1a] border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer">
              <HiOutlineCog className="text-xs" />
            </button>
          </div>
          <div className="flex-1 grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Full name', value: user?.name || '', type: 'text' },
              { label: 'Email', value: user?.email || '', type: 'email' },
              { label: 'Role', type: 'select', options: ['Developer', 'Architect', 'Admin'] },
              { label: 'Organization', value: 'TestGenAI Labs', type: 'text' },
            ].map((field, i) => (
              <div key={i}>
                <label className="block text-xs text-white/40 mb-1.5">{field.label}</label>
                {field.type === 'select' ? (
                  <select className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors appearance-none cursor-pointer">
                    {field.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type} defaultValue={field.value}
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-400/50 transition-colors" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI config */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <RiRobot2Line className="text-sm text-white/40" />
          <p className="text-sm font-medium text-white">AI configuration</p>
        </div>
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Slider label="Confidence threshold" value={aiConfig.confidence} onChange={v => setAiConfig(p => ({ ...p, confidence: v }))} />
            <Slider label="Scan depth" value={aiConfig.depth} min={1} max={5} suffix=" levels" onChange={v => setAiConfig(p => ({ ...p, depth: v }))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'edgeCases', label: 'Edge case generation', desc: 'Automatically generate edge case permutations' },
              { key: 'autoFix', label: 'Auto-fix suggestions', desc: 'Let AI suggest code fixes for identified issues' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="mr-4">
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
                </div>
                <Toggle checked={aiConfig[item.key]} onChange={v => setAiConfig(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <HiOutlineBell className="text-sm text-white/40" />
          <p className="text-sm font-medium text-white">Notifications</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: 'email', label: 'Email notifications', desc: 'Receive analysis reports by email' },
            { key: 'push', label: 'Push notifications', desc: 'Real-time alerts for analysis events' },
            { key: 'slack', label: 'Slack integration', desc: 'Send notifications to a Slack channel' },
            { key: 'weekly', label: 'Weekly digest', desc: 'Summary of weekly activity' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <div className="mr-4">
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
              </div>
              <Toggle checked={notifications[item.key]} onChange={v => setNotifications(p => ({ ...p, [item.key]: v }))} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1">
        <button className="h-9 px-5 rounded-lg border border-white/[0.08] text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors cursor-pointer bg-transparent">
          Cancel
        </button>
        <button className="h-9 px-5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors cursor-pointer border-none">
          Save changes
        </button>
      </div>
    </div>
  );
}
