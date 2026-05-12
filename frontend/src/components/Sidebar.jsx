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
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#1E293B]">
        <NavLink to="/dashboard" className="flex items-center gap-3 no-underline" onClick={closeMobile}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
            <RiRobot2Line className="text-white text-lg" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-[#F8FAFC] whitespace-nowrap overflow-hidden"
              >
                TestGen<span className="text-[#6366F1]">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Collapse button - desktop only */}
        <button
          onClick={toggle}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer border-none"
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <HiOutlineChevronLeft className="text-sm" />
          </motion.div>
        </button>

        {/* Close button - mobile only */}
        <button
          onClick={closeMobile}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer border-none"
        >
          <HiOutlineX className="text-sm" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
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
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#6366F1]/10 text-[#818CF8]'
                    : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#6366F1] rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`text-xl flex-shrink-0 ${isActive ? 'text-[#818CF8]' : ''}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
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
        <div className="p-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-[#6366F1]/10 to-[#818CF8]/5 border border-[#6366F1]/20">
          <p className="text-xs text-[#94A3B8] mb-1">AI Engine</p>
          <p className="text-sm font-semibold text-[#F8FAFC]">v2.4.1 Active</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs text-[#10B981]">All systems operational</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#111827] border-r border-[#1E293B] z-40 overflow-hidden"
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
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-[260px] bg-[#111827] border-r border-[#1E293B] z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
