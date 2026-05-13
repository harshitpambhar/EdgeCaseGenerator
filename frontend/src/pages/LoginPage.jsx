import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheck } from 'react-icons/hi';
import { RiRobot2Line, RiGithubFill, RiGoogleFill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Min 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (validate()) {
      setIsLoading(true);
      const result = await login({ email, password });
      if (result.success) {
        navigate('/dashboard');
      } else {
        setApiError(result.error);
      }
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="w-full max-w-md relative z-10">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          <RiRobot2Line className="text-white text-3xl" />
        </div>
        <span className="text-4xl font-black font-heading text-white tracking-tighter">TestGen<span className="text-cyan-400">AI</span></span>
      </div>

      {/* Card */}
      <div className="glass-panel rounded-[2.5rem] p-10 border-white/10 bg-[#07111f]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl" />
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-3xl font-black font-heading text-white mb-2 uppercase tracking-tight">Sync Portal</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Authorize Neural Link</p>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
          <button className="flex items-center justify-center gap-3 h-12 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all cursor-pointer group uppercase tracking-widest">
            <RiGithubFill className="text-xl group-hover:scale-110 transition-transform" /> GitHub
          </button>
          <button className="flex items-center justify-center gap-3 h-12 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all cursor-pointer group uppercase tracking-widest">
            <RiGoogleFill className="text-xl text-amber-400 group-hover:scale-110 transition-transform" /> Google
          </button>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Archive ID (Email)</label>
            <div className="relative group">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nexus@core.sync"
                className={`w-full h-12 pl-12 pr-4 rounded-xl bg-[#050816]/60 border text-xs font-bold text-white placeholder-slate-800 focus:outline-none focus:ring-4 transition-all ${errors.email ? 'border-rose-500/50 focus:ring-rose-500/5' : 'border-white/5 focus:border-cyan-400/50 focus:ring-cyan-400/5'}`} />
            </div>
            {errors.email && <p className="text-[9px] font-black text-rose-500 mt-2 ml-1 uppercase tracking-tighter">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Access Key (Password)</label>
            <div className="relative group">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className={`w-full h-12 pl-12 pr-12 rounded-xl bg-[#050816]/60 border text-xs font-bold text-white placeholder-slate-800 focus:outline-none focus:ring-4 transition-all ${errors.password ? 'border-rose-500/50 focus:ring-rose-500/5' : 'border-white/5 focus:border-cyan-400/50 focus:ring-cyan-400/5'}`} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white bg-transparent border-none cursor-pointer transition-colors">
                {showPass ? <HiOutlineEyeOff className="text-lg" /> : <HiOutlineEye className="text-lg" />}
              </button>
            </div>
            {errors.password && <p className="text-[9px] font-black text-rose-500 mt-2 ml-1 uppercase tracking-tighter">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 accent-cyan-400 cursor-pointer appearance-none checked:bg-cyan-400 transition-all border" />
                <HiOutlineCheck className="absolute top-0.5 left-0.5 text-[12px] text-[#050816] pointer-events-none opacity-0 checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">Persist Link</span>
            </label>
            <a href="#" className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors no-underline uppercase tracking-widest">Lost Key?</a>
          </div>

          <button type="submit" disabled={isLoading}
            className={`w-full h-14 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all cursor-pointer border-none active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]'}`}>
            {isLoading ? 'Synchronizing...' : 'Establish Link'}
          </button>
        </form>

        <p className="text-center text-[10px] font-black text-slate-500 mt-10 uppercase tracking-[0.2em] relative z-10">
          New Operative? <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 no-underline transition-colors ml-1">CREATE ARCHIVE</Link>
        </p>
      </div>
    </motion.div>
  );
}
