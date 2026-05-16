import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppHeader from '../components/shared/AppHeader';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#030303]">
      <AppHeader />
      <div className="pt-14 flex flex-col min-h-screen">
        <main className="flex-1 px-6 py-6 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
