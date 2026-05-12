import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0F172A] bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#6366F1]/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#818CF8]/8 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366F1]/5 rounded-full blur-[200px] pointer-events-none" />
      <Outlet />
    </div>
  );
}
