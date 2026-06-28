import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Home } from 'lucide-react';
import { RiGithubFill, RiGoogleFill, RiRobot2Line } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';

const GMAIL_REGEX = /^[A-Za-z0-9+_.-]+@gmail\.com$/;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registeredHandled = useRef(false);

  useEffect(() => {
    if (registeredHandled.current) return;
    if (location.state?.registered) {
      registeredHandled.current = true;
      setInfoMessage('Account created. Sign in with your email and password.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!GMAIL_REGEX.test(email)) errs.email = 'Use a valid Gmail address (@gmail.com)';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'At least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setIsLoading(true);
    const result = await login({ email: email.trim(), password });
    if (result?.success) navigate('/dashboard');
    else {
      setApiError(result?.error || 'Something went wrong');
      if (result?.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
      }
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="w-full max-w-sm relative z-10"
    >
      {/* Logo with Home Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center">
            <RiRobot2Line className="text-white text-lg" />
          </div>
          <span className="text-xl font-semibold text-white">
            TestGen<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-rose-400">AI</span>
          </span>
        </div>
        <Link to="/" className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors">
          <Home className="w-4 h-4" />
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-7">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white">Sign in</h1>
          <p className="text-sm text-white/40 mt-1">Welcome back. Enter your credentials to continue.</p>
          <p className="text-xs text-white/30 mt-2">
            First time here?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 no-underline">Create an account</Link>
            {' '}before signing in.
          </p>
        </div>

        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button className="flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors cursor-pointer">
            <RiGithubFill className="text-base" /> GitHub
          </button>
          <button className="flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors cursor-pointer">
            <RiGoogleFill className="text-base text-amber-400" /> Google
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <Separator className="flex-1 bg-white/[0.06]" />
          <span className="text-xs text-white/25">or continue with email</span>
          <Separator className="flex-1 bg-white/[0.06]" />
        </div>

        {infoMessage && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            {infoMessage}
          </div>
        )}

        {apiError && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/60">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input
                id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className={`pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-400/50 ${errors.email ? 'border-rose-500/50' : ''}`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/60">Password</Label>
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors no-underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input
                id="password" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`pl-9 pr-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-400/50 ${errors.password ? 'border-rose-500/50' : ''}`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 bg-transparent border-none cursor-pointer transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400">{errors.password}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer" />
            <label htmlFor="remember" className="text-xs text-white/40 cursor-pointer">Remember me</label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white border-none h-9">
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-xs text-white/30 mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 no-underline transition-colors">Create one</Link>
        </p>
      </div>
    </motion.div>
  );
}
