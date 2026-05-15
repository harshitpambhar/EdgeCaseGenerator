import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheckCircle } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';

export default function SignupPage() {
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // UI States
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Sign up, Step 2: Verify Email
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateSignUp = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Min 8 characters required by AWS'; // AWS default is 8
    
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // STEP 1: Create the account in AWS
  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (validateSignUp()) {
      setIsLoading(true);
      try {
        await signUp({
          username: email,
          password: password,
          options: {
            userAttributes: {
              email: email,
            },
          }
        });
        // If successful, move to verification step
        setStep(2);
      } catch (error) {
        setAuthError(error.message || 'Failed to sign up.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // STEP 2: Verify the email with the 6-digit code
  const handleVerify = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!verificationCode) {
      setErrors({ code: 'Verification code is required' });
      return;
    }

    setIsLoading(true);
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode
      });
      // Verification successful! Send them to login.
      navigate('/login');
    } catch (error) {
      setAuthError(error.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">
            {step === 1 ? 'Create an account' : 'Check your email'}
          </h1>
          <p className="text-sm text-[#94A3B8]">
            {step === 1 ? 'Start testing your AI models today' : `We sent a code to ${email}`}
          </p>
        </div>

        {/* Show AWS Errors */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-sm text-[#EF4444]">
            {authError}
          </div>
        )}

        {/* STEP 1 FORM: Email & Password */}
        {step === 1 && (
          <form onSubmit={handleSignUp} className="space-y-4">
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input type={showConfirmPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className={`w-full h-11 pl-10 pr-11 rounded-xl bg-[#0F172A] border text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? 'border-[#EF4444] focus:ring-[#EF4444]/30' : 'border-[#334155] focus:border-[#6366F1] focus:ring-[#6366F1]/30'}`} />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] bg-transparent border-none cursor-pointer">
                  {showConfirmPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-[#EF4444] mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full h-11 mt-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#6366F1]/25 transition-all cursor-pointer border-none disabled:opacity-70">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* STEP 2 FORM: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Verification Code</label>
              <div className="relative">
                <HiOutlineCheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="Enter 6-digit code"
                  className={`w-full h-11 pl-10 pr-4 rounded-xl bg-[#0F172A] border text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${errors.code ? 'border-[#EF4444] focus:ring-[#EF4444]/30' : 'border-[#334155] focus:border-[#6366F1] focus:ring-[#6366F1]/30'}`} />
              </div>
              {errors.code && <p className="text-xs text-[#EF4444] mt-1">{errors.code}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#6366F1]/25 transition-all cursor-pointer border-none disabled:opacity-70">
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <button type="button" onClick={() => setStep(1)} className="w-full mt-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors bg-transparent border-none cursor-pointer">
              Wrong email? Go back
            </button>
          </form>
        )}

        {/* Bottom Link */}
        {step === 1 && (
          <p className="text-center text-sm text-[#94A3B8] mt-6">
            Already have an account? <Link to="/login" className="text-[#818CF8] hover:text-[#6366F1] no-underline font-medium">Sign in</Link>
          </p>
        )}
      </div>
    </motion.div>
  );
}