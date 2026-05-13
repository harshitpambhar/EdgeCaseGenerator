import { RiRobot2Line } from 'react-icons/ri';
import { HiOutlineHeart } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#030303]">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-rose-500 flex items-center justify-center">
            <RiRobot2Line className="text-white text-xs" />
          </div>
          <span className="text-sm text-white/40">
            TestGen<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300 font-semibold">AI</span> © 2026
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/20">
          Made with <HiOutlineHeart className="text-rose-400/60 mx-0.5" /> by AI Engine v2.4
        </div>
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Docs'].map((item) => (
            <a key={item} href="#" className="text-xs text-white/30 hover:text-white/70 transition-colors no-underline">{item}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
