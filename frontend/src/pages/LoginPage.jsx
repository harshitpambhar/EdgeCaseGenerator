import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { RiRobot2Line, RiGithubFill, RiGoogleFill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
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
      login({ email, password });
      navigate('/dashboard');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="w-full max-w-md relative z-10">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
          <RiRobot2Line className="text-white text-xl" />
        </div>
        <span className="text-2xl font-bold text-[#F8FAFC]">TestGen<span className="text-[#6366F1]">AI</span></span>
      </div>

      {/* Card */}
      <div className="glass-strong rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">Welcome back</h1>
          <p className="text-sm text-[#94A3B8]">Sign in to your AI testing platform</p>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#1E293B] border border-[#334155] text-sm font-medium text-[#F8FAFC] hover:border-[#6366F1]/40 hover:bg-[#334155]/50 transition-all cursor-pointer">
            <RiGithubFill className="text-lg" /> GitHub
          </button>
          <button className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#1E293B] border border-[#334155] text-sm font-medium text-[#F8FAFC] hover:border-[#6366F1]/40 hover:bg-[#334155]/50 transition-all cursor-pointer">
            <RiGoogleFill className="text-lg text-[#FBBF24]" /> Google
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#334155]" />
          <span className="text-xs text-[#64748B]">or continue with email</span>
          <div className="flex-1 h-px bg-[#334155]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Email</label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className={`w-full h-11 pl-10 pr-4 rounded-xl bg-[#0F172A] border text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-[#EF4444] focus:ring-[#EF4444]/30' : 'border-[#334155] focus:border-[#6366F1] focus:ring-[#6366F1]/30'}`} />
            </div>
            {errors.email && <p className="text-xs text-[#EF4444] mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className={`w-full h-11 pl-10 pr-11 rounded-xl bg-[#0F172A] border text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${errors.password ? 'border-[#EF4444] focus:ring-[#EF4444]/30' : 'border-[#334155] focus:border-[#6366F1] focus:ring-[#6366F1]/30'}`} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] bg-transparent border-none cursor-pointer">
                {showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-[#EF4444] mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded bg-[#0F172A] border-[#334155] accent-[#6366F1]" />
              <span className="text-xs text-[#94A3B8]">Remember me</span>
            </label>
            <a href="#" className="text-xs text-[#818CF8] hover:text-[#6366F1] no-underline">Forgot password?</a>
          </div>

          <button type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#6366F1]/25 transition-all cursor-pointer border-none">
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-[#94A3B8] mt-6">
          Don't have an account? <Link to="/" className="text-[#818CF8] hover:text-[#6366F1] no-underline font-medium">Sign up</Link>
        </p>
      </div>
    </motion.div>
  );
}
