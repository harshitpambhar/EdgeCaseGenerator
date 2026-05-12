import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineMenu,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineLogout,
  HiOutlineUser,
} from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Repository',
  '/processing': 'Processing Pipeline',
  '/explorer': 'Code Explorer',
  '/coverage': 'Coverage Analytics',
  '/recommendations': 'AI Recommendations',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function Navbar() {
  const { toggleMobile } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-18 bg-[#050816]/60 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 md:px-10">
      {/* Left */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleMobile}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border-none cursor-pointer"
        >
          <HiOutlineMenu className="text-lg" />
        </button>
        <div>
          <h1 className="text-lg font-black font-heading text-white tracking-tight">{title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-neon" />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Link: SECURE</p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <AnimatePresence mode="wait">
            {showSearch ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="relative"
              >
                <input
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                  placeholder="Query system database..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-[13px] font-medium text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all"
                />
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              </motion.div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-3 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-[13px] font-bold text-slate-400 hover:border-cyan-400/50 hover:text-white transition-all cursor-pointer"
              >
                <HiOutlineSearch className="text-base" />
                <span className="uppercase tracking-widest text-[9px]">Search</span>
                <kbd className="ml-4 text-[9px] px-2 py-0.5 rounded bg-[#050816] text-slate-500 border border-white/5">⌘K</kbd>
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border-none cursor-pointer">
          <HiOutlineBell className="text-lg" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 h-10 pl-1.5 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all border-none cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[11px] font-black text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:block text-[11px] font-black text-white uppercase tracking-wider">{user?.name}</span>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="absolute right-0 top-12 w-60 rounded-2xl bg-[#07111f] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 backdrop-blur-2xl"
              >
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-[13px] font-black font-heading text-white">{user?.name}</p>
                  <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all border-none cursor-pointer bg-transparent text-left uppercase tracking-widest">
                    <HiOutlineUser className="text-base text-cyan-400" />
                    Identity
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[11px] font-bold text-red-400 hover:bg-red-400/10 transition-all border-none cursor-pointer bg-transparent text-left uppercase tracking-widest"
                  >
                    <HiOutlineLogout className="text-base" />
                    Terminate
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
