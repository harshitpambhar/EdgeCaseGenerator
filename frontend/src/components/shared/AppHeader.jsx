import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { RiRobot2Line } from 'react-icons/ri';
import { ChevronDown, LayoutDashboard, Upload, BarChart2, FileText, Settings, LogOut, User } from 'lucide-react';

const navLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload', to: '/upload', icon: Upload },
  { label: 'Coverage', to: '/coverage', icon: BarChart2 },
  { label: 'Reports', to: '/reports', icon: FileText },
];

export default function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#030303]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center">
            <RiRobot2Line className="text-white text-sm" />
          </div>
          <span className="text-base font-semibold text-white">
            TestGen<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">AI</span>
          </span>
        </Link>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors no-underline">
            Home
          </Link>
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm transition-colors no-underline ${
                  isActive ? 'text-white bg-white/[0.07]' : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated && user ? (
            /* Profile dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07] transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-400 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-xs font-medium text-white/70 max-w-[90px] truncate">
                  {user?.name}
                </span>
                <ChevronDown className={`w-3 h-3 text-white/30 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-52 rounded-xl bg-[#111] border border-white/[0.08] shadow-2xl overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="px-3 py-3 border-b border-white/[0.06]">
                      <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-white/30 mt-0.5 truncate">{user?.email}</p>
                    </div>

                    {/* Nav links (mobile) */}
                    <div className="md:hidden p-1 border-b border-white/[0.06]">
                      <Link to="/" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:bg-white/[0.05] hover:text-white transition-colors no-underline">
                        Home
                      </Link>
                      {navLinks.map(({ label, to, icon: Icon }) => (
                        <Link key={to} to={to} onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:bg-white/[0.05] hover:text-white transition-colors no-underline">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {label}
                        </Link>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="p-1">
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:bg-white/[0.05] hover:text-white transition-colors no-underline">
                        <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /> Dashboard
                      </Link>
                      <Link to="/settings" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:bg-white/[0.05] hover:text-white transition-colors no-underline">
                        <Settings className="w-3.5 h-3.5 text-white/40 flex-shrink-0" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-400/10 transition-colors border-none cursor-pointer bg-transparent text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 flex-shrink-0" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Guest buttons */
            <div className="flex items-center gap-2">
              <Link to="/signup"
                className="h-8 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-1.5">
                Get started
              </Link>
              <Link to="/login"
                className="h-8 px-4 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors no-underline flex items-center">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
