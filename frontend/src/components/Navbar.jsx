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
    <header className="sticky top-0 z-30 h-16 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#1E293B] flex items-center justify-between px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobile}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] transition-all border-none cursor-pointer"
        >
          <HiOutlineMenu className="text-lg" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#F8FAFC]">{title}</h1>
          <p className="text-xs text-[#64748B] hidden sm:block">AI-Powered Test Generation Platform</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <AnimatePresence>
            {showSearch ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                  placeholder="Search repositories, tests..."
                  className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#1E293B] border border-[#334155] text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all"
                />
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              </motion.div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#1E293B] border border-[#334155] text-sm text-[#64748B] hover:border-[#6366F1]/40 transition-all cursor-pointer"
              >
                <HiOutlineSearch />
                <span>Search...</span>
                <kbd className="ml-4 text-[10px] px-1.5 py-0.5 rounded bg-[#0F172A] text-[#64748B] border border-[#334155]">⌘K</kbd>
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* AI status */}
        <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
          <RiRobot2Line className="text-[#10B981] text-sm" />
          <span className="text-xs font-medium text-[#10B981]">AI Online</span>
        </div>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] transition-all border-none cursor-pointer">
          <HiOutlineBell className="text-lg" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] font-bold text-white flex items-center justify-center">3</span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-[#1E293B] transition-all border-none cursor-pointer bg-transparent"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-[#F8FAFC]">{user?.name}</span>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-12 w-56 rounded-xl bg-[#1E293B] border border-[#334155] shadow-2xl shadow-black/40 overflow-hidden"
              >
                <div className="p-4 border-b border-[#334155]">
                  <p className="text-sm font-semibold text-[#F8FAFC]">{user?.name}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-[#94A3B8] hover:bg-[#334155] hover:text-[#F8FAFC] transition-all border-none cursor-pointer bg-transparent text-left">
                    <HiOutlineUser className="text-base" />
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition-all border-none cursor-pointer bg-transparent text-left"
                  >
                    <HiOutlineLogout className="text-base" />
                    Sign out
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
