import { RiRobot2Line } from 'react-icons/ri';
import { HiOutlineHeart } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="border-t border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <RiRobot2Line className="text-[#6366F1]" />
          <span className="text-sm text-[#94A3B8]">
            TestGen<span className="text-[#6366F1] font-semibold">AI</span> © 2026
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#64748B]">
          Made with <HiOutlineHeart className="text-[#EF4444] mx-0.5" /> by AI Engine v2.4
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-xs text-[#64748B] hover:text-[#818CF8] transition-colors no-underline">Privacy</a>
          <a href="#" className="text-xs text-[#64748B] hover:text-[#818CF8] transition-colors no-underline">Terms</a>
          <a href="#" className="text-xs text-[#64748B] hover:text-[#818CF8] transition-colors no-underline">Docs</a>
        </div>
      </div>
    </footer>
  );
}
