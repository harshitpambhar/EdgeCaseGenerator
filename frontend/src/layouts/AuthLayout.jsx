import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#050816] bg-mesh flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      
      <Outlet />
    </div>
  );
}
