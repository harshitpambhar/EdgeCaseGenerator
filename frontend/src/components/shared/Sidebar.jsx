import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../../context/SidebarContext';
import {
  HiOutlineHome, HiOutlineCloudUpload, HiOutlineCog, HiOutlineChartBar,
  HiOutlineDocumentReport, HiOutlineCode, HiOutlineLightningBolt,
  HiOutlineBeaker, HiOutlineX,
} from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/upload', label: 'Upload', icon: HiOutlineCloudUpload },
  { path: '/processing', label: 'Processing', icon: HiOutlineBeaker },
  { path: '/explorer', label: 'Explorer', icon: HiOutlineCode },
  { path: '/coverage', label: 'Coverage', icon: HiOutlineChartBar },
  { path: '/recommendations', label: 'AI Insights', icon: HiOutlineLightningBolt },
  { path: '/reports', label: 'Reports', icon: HiOutlineDocumentReport },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
];

function DrawerContent({ close }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06] flex-shrink-0">
        <NavLink to="/dashboard" onClick={close} className="flex items-center gap-2.5 no-underline">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center flex-shrink-0">
            <RiRobot2Line className="text-white text-xs" />
          </div>
          <span className="text-sm font-semibold text-white">
            TestGen<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">AI</span>
          </span>
        </NavLink>
        <button
          onClick={close}
          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
        >
          <HiOutlineX className="text-sm" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path} onClick={close} className="no-underline block">
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
                isActive ? 'bg-indigo-500/15 text-indigo-300' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}>
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <item.icon className={`text-base flex-shrink-0 ${isActive ? 'text-indigo-300' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer CTA */}
      <div className="px-3 py-3 border-t border-white/[0.06] flex-shrink-0">
        <NavLink to="/upload" onClick={close} className="no-underline block">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 transition-colors cursor-pointer">
            <HiOutlineCloudUpload className="text-indigo-400 text-sm flex-shrink-0" />
            <span className="text-xs font-medium text-indigo-300">New analysis</span>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-[#0a0a0a] border-r border-white/[0.08] z-50 flex flex-col"
          >
            <DrawerContent close={close} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
