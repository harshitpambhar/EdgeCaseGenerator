import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineBell, HiOutlineCog, HiOutlineColorSwatch } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  
  // NEW: Added state to keep track of the selected theme!
  const [activeTheme, setActiveTheme] = useState('Dark'); 
  const [notifications, setNotifications] = useState({ email: true, push: true, slack: false, weekly: true });
  const [aiConfig, setAiConfig] = useState({ confidence: 75, depth: 3, edgeCases: true, autoFix: false });

  const Toggle = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors border-none cursor-pointer ${checked ? 'bg-[#6366F1]' : 'bg-[#334155]'}`}>
      <motion.div animate={{ x: checked ? 20 : 2 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
    </button>
  );

  const Slider = ({ value, onChange, min = 0, max = 100, label, suffix = '%' }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#94A3B8]">{label}</span>
        <span className="text-sm font-semibold text-[#F8FAFC]">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-[#334155] cursor-pointer accent-[#6366F1]"
        style={{ accentColor: '#6366F1' }} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <HiOutlineUser className="text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Profile Settings</h3>
        </div>
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 overflow-hidden">
             {/* Show user avatar if it exists, otherwise show initial */}
             {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
          </div>
          <div className="flex-1 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Full Name</label>
              <input defaultValue={user?.name || ''} className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-[#334155] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email</label>
              <input defaultValue={user?.email || ''} className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-[#334155] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Role</label>
              <select className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-[#334155] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                <option>Developer</option><option>Team Lead</option><option>Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Organization</label>
              <input defaultValue="TestGenAI Labs" className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-[#334155] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] transition-colors" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme Placeholder */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <HiOutlineColorSwatch className="text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Theme Settings</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Dark', bg: 'bg-[#0F172A]' },
            { name: 'Midnight', bg: 'bg-[#030712]' },
            { name: 'Light', bg: 'bg-[#F1F5F9]' },
          ].map(theme => {
            // NEW: Check if this theme is the active one in our state
            const isActive = activeTheme === theme.name;
            
            return (
            <div key={theme.name}
              // NEW: Add the onClick event to change the state!
              onClick={() => setActiveTheme(theme.name)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                isActive ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-[#334155] hover:border-[#6366F1]/30'
              }`}>
              <div className={`w-full h-16 rounded-lg mb-3 ${theme.bg} border border-[#334155]/50`} />
              <p className="text-sm font-medium text-[#F8FAFC]">{theme.name}</p>
              {isActive && <p className="text-[10px] text-[#818CF8] mt-0.5">Active</p>}
            </div>
          )})}
        </div>
      </motion.div>

      {/* AI Configuration */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <RiRobot2Line className="text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">AI Configuration</h3>
        </div>
        <div className="space-y-6">
          <Slider label="Minimum Confidence Threshold" value={aiConfig.confidence}
            onChange={v => setAiConfig(p => ({ ...p, confidence: v }))} />
          <Slider label="Analysis Depth Level" value={aiConfig.depth} min={1} max={5} suffix=""
            onChange={v => setAiConfig(p => ({ ...p, depth: v }))} />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-[#E2E8F0]">Edge Case Generation</p>
              <p className="text-xs text-[#64748B]">Automatically generate boundary and edge case tests</p>
            </div>
            <Toggle checked={aiConfig.edgeCases} onChange={v => setAiConfig(p => ({ ...p, edgeCases: v }))} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-[#E2E8F0]">Auto-Fix Suggestions</p>
              <p className="text-xs text-[#64748B]">Apply AI-suggested fixes automatically</p>
            </div>
            <Toggle checked={aiConfig.autoFix} onChange={v => setAiConfig(p => ({ ...p, autoFix: v }))} />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <HiOutlineBell className="text-[#818CF8]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive analysis reports via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push for real-time updates' },
            { key: 'slack', label: 'Slack Integration', desc: 'Post results to Slack channels' },
            { key: 'weekly', label: 'Weekly Digest', desc: 'Summary of weekly testing activity' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-[#E2E8F0]">{item.label}</p>
                <p className="text-xs text-[#64748B]">{item.desc}</p>
              </div>
              <Toggle checked={notifications[item.key]} onChange={v => setNotifications(p => ({ ...p, [item.key]: v }))} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save button */}
      <div className="flex justify-end gap-3 pb-8">
        <button className="h-10 px-5 rounded-xl bg-[#1E293B] border border-[#334155] text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#6366F1]/40 transition-all cursor-pointer">
          Cancel
        </button>
        <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#6366F1]/25 transition-all cursor-pointer border-none">
          Save Changes
        </button>
      </div>
    </div>
  );
}