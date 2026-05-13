import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { RiRobot2Line, RiGithubFill, RiGoogleFill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name) errs.name = 'Name is required';
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Min 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      login({ name, email, password });
      navigate('/dashboard');
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
          <h1 className="text-3xl font-black font-heading text-white mb-2 uppercase tracking-tight">Access Protocol</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Establish your neural identity</p>
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

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Direct Registration</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Archive Identity (Name)</label>
            <div className="relative group">
              <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="NEURAL_OPERATIVE_01"
                className={`w-full h-12 pl-12 pr-4 rounded-xl bg-[#050816]/60 border text-xs font-bold text-white placeholder-slate-800 focus:outline-none focus:ring-4 transition-all ${errors.name ? 'border-rose-500/50 focus:ring-rose-500/5' : 'border-white/5 focus:border-cyan-400/50 focus:ring-cyan-400/5'}`} />
            </div>
            {errors.name && <p className="text-[9px] font-black text-rose-500 mt-2 ml-1 uppercase tracking-tighter">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Communication Node (Email)</label>
            <div className="relative group">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nexus@core.sync"
                className={`w-full h-12 pl-12 pr-4 rounded-xl bg-[#050816]/60 border text-xs font-bold text-white placeholder-slate-800 focus:outline-none focus:ring-4 transition-all ${errors.email ? 'border-rose-500/50 focus:ring-rose-500/5' : 'border-white/5 focus:border-cyan-400/50 focus:ring-cyan-400/5'}`} />
            </div>
            {errors.email && <p className="text-[9px] font-black text-rose-500 mt-2 ml-1 uppercase tracking-tighter">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Encryption Key (Password)</label>
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

          <button type="submit"
            className="w-full h-14 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-[10px] font-black text-white uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all cursor-pointer border-none active:scale-95">
            Initialize Access
          </button>
        </form>

        <p className="text-center text-[10px] font-black text-slate-500 mt-10 uppercase tracking-[0.2em] relative z-10">
          Already synced? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 no-underline transition-colors ml-1">SIGN IN</Link>
        </p>
      </div>
    </motion.div>
  );
}
