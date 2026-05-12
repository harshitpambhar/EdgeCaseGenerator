import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useSidebar } from '../context/SidebarContext';

export default function DashboardLayout() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#050816] bg-mesh bg-grid-cyber">
      <Sidebar />
      <motion.div
        animate={{ marginLeft: window.innerWidth >= 1024 ? (isCollapsed ? 72 : 260) : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen flex flex-col"
      >
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
