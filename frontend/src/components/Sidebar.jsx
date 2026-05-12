import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../context/SidebarContext';
import {
  HiOutlineHome,
  HiOutlineCloudUpload,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiOutlineCode,
  HiOutlineLightningBolt,
  HiOutlineBeaker,
  HiOutlineChevronLeft,
  HiOutlineX,
} from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/upload', label: 'Upload Repo', icon: HiOutlineCloudUpload },
  { path: '/processing', label: 'Processing', icon: HiOutlineBeaker },
  { path: '/explorer', label: 'Code Explorer', icon: HiOutlineCode },
  { path: '/coverage', label: 'Coverage', icon: HiOutlineChartBar },
  { path: '/recommendations', label: 'AI Insights', icon: HiOutlineLightningBolt },
  { path: '/reports', label: 'Reports', icon: HiOutlineDocumentReport },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
];

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useSidebar();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-20 border-b border-white/5">
        <NavLink to="/dashboard" className="flex items-center gap-3 no-underline" onClick={closeMobile}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <RiRobot2Line className="text-white text-xl" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-black font-heading text-white whitespace-nowrap overflow-hidden tracking-tight uppercase"
                >
                  TESTGEN<span className="text-cyan-400">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
  
          {/* Collapse button - desktop only */}
          <button
            onClick={toggle}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer border-none"
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <HiOutlineChevronLeft className="text-base" />
            </motion.div>
          </button>
  
          {/* Close button - mobile only */}
          <button
            onClick={closeMobile}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer border-none"
          >
            <HiOutlineX className="text-base" />
          </button>
        </div>
  
        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-6">
            <NavLink to="/upload" className="no-underline">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34,211,238,0.4)' }}
                whileTap={{ scale: 0.98 }}
                className={`w-full h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-none cursor-pointer transition-shadow ${isCollapsed ? 'px-0' : 'px-4'}`}
              >
                <HiOutlineCloudUpload className="text-base" />
                {!isCollapsed && <span>Initialize Archive</span>}
              </motion.button>
            </NavLink>
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className="no-underline block"
              >
                <motion.div
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-cyan-400/10 text-cyan-400'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-cyan-400 rounded-r-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={`text-lg flex-shrink-0 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'group-hover:text-cyan-400 transition-colors'}`} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </NavLink>
            );
          })}
        </nav>
  
        {/* Bottom section */}
        {!isCollapsed && (
          <div className="px-5 py-6 mt-auto border-t border-white/5">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl" />
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">PLAN: ELITE</p>
                <span className="text-[10px] font-black text-cyan-400 animate-pulse-neon">AI ACTIVE</span>
              </div>
              <p className="text-xs font-bold text-white mb-2">84% Capacity</p>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                />
              </div>
              <button className="w-full py-2.5 rounded-xl bg-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:bg-cyan-400 hover:text-[#050816] transition-all border-none cursor-pointer">
                UPGRADE GEAR
              </button>
            </div>
          </div>
        )}

    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#07111f]/60 backdrop-blur-2xl border-r border-white/5 z-40 overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-[#07111f]/80 backdrop-blur-2xl border-r border-white/10 z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
