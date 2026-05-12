import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCode, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineBeaker, HiOutlineCube, HiOutlineArrowRight, HiOutlineCheck } from 'react-icons/hi';
import { RiRobot2Line, RiGithubFill } from 'react-icons/ri';
import Footer from '../components/Footer';

const stats = [
  { label: 'Test Cases Generated', value: '2.4M+', icon: HiOutlineBeaker },
  { label: 'Repositories Analyzed', value: '18K+', icon: HiOutlineCube },
  { label: 'Avg Coverage Boost', value: '47%', icon: HiOutlineChartBar },
  { label: 'Edge Cases Found', value: '890K+', icon: HiOutlineShieldCheck },
];

const features = [
  { title: 'AST-Based Analysis', desc: 'Deep abstract syntax tree parsing for intelligent code understanding across 12+ languages.', icon: HiOutlineCode, color: '#6366F1' },
  { title: 'ML Risk Detection', desc: 'Neural networks identify high-risk functions and predict potential failure points.', icon: HiOutlineLightningBolt, color: '#F59E0B' },
  { title: 'Smart Edge Cases', desc: 'Automatically generates boundary conditions, null checks, and concurrency edge cases.', icon: HiOutlineShieldCheck, color: '#10B981' },
  { title: 'Coverage Analytics', desc: 'Real-time coverage metrics with branch, line, and function-level breakdowns.', icon: HiOutlineChartBar, color: '#818CF8' },
  { title: 'CI/CD Integration', desc: 'Seamlessly plugs into GitHub Actions, Jenkins, GitLab CI, and more.', icon: HiOutlineCube, color: '#34D399' },
  { title: 'Auto-Healing Tests', desc: 'Tests automatically adapt when your codebase changes, reducing maintenance.', icon: HiOutlineBeaker, color: '#EF4444' },
];

const workflow = [
  { step: '01', title: 'Upload Repository', desc: 'Push your code or connect via GitHub URL' },
  { step: '02', title: 'AI Analysis', desc: 'ML models parse AST and detect risk zones' },
  { step: '03', title: 'Test Generation', desc: 'Intelligent test cases created for each function' },
  { step: '04', title: 'Coverage Report', desc: 'Comprehensive analytics and export options' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center">
              <RiRobot2Line className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-[#F8FAFC]">TestGen<span className="text-[#6366F1]">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors no-underline">Features</a>
            <a href="#workflow" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors no-underline">How it works</a>
            <a href="#stats" className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors no-underline">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors no-underline">Sign in</Link>
            <Link to="/dashboard" className="h-9 px-5 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-sm font-semibold text-white flex items-center gap-2 hover:shadow-lg hover:shadow-[#6366F1]/25 transition-all no-underline">
              Get Started <HiOutlineArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#6366F1]/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-medium text-[#818CF8]">AI Engine v2.4 — Now with GPT-4 Analysis</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-[#F8FAFC]">Intelligent Test Cases</span><br />
              <span className="text-gradient">Powered by AI</span>
            </h1>
            <p className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
              Generate comprehensive, edge-case-aware test suites using advanced ML models, AST analysis, and intelligent risk detection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard" className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-base font-semibold text-white flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#6366F1]/25 transition-all no-underline hover:scale-105 transform duration-200">
                Start Generating <HiOutlineArrowRight />
              </Link>
              <Link to="/login" className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#1E293B] border border-[#334155] text-base font-semibold text-[#F8FAFC] flex items-center justify-center gap-2 hover:border-[#6366F1]/40 transition-all no-underline">
                <RiGithubFill className="text-lg" /> Connect GitHub
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-[#1E293B]/40 border border-[#334155]/40 p-6 text-center hover:border-[#6366F1]/30 transition-all group">
              <stat.icon className="text-2xl text-[#818CF8] mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-3xl font-bold text-[#F8FAFC] mb-1">{stat.value}</p>
              <p className="text-xs text-[#64748B]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-20 px-6 bg-[#111827]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">How It Works</h2>
            <p className="text-[#94A3B8]">Four simple steps from code to comprehensive test coverage</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {workflow.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 p-6 hover:border-[#6366F1]/30 transition-all">
                <span className="text-4xl font-extrabold text-[#6366F1]/20">{item.step}</span>
                <h3 className="text-base font-semibold text-[#F8FAFC] mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-[#94A3B8]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">Powerful Features</h2>
            <p className="text-[#94A3B8]">Everything you need for enterprise-grade test generation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                className="rounded-2xl bg-[#1E293B]/40 border border-[#334155]/40 p-6 hover:border-[#6366F1]/30 transition-all group cursor-pointer">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${feat.color}15` }}>
                  <feat.icon className="text-xl" style={{ color: feat.color }} />
                </div>
                <h3 className="text-base font-semibold text-[#F8FAFC] mb-2 group-hover:text-[#818CF8] transition-colors">{feat.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#6366F1]/20 to-[#818CF8]/10 border border-[#6366F1]/20 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">Ready to Supercharge Your Tests?</h2>
            <p className="text-[#94A3B8] max-w-lg mx-auto mb-8">Join thousands of developers using AI to generate comprehensive test suites in seconds.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard" className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-base font-semibold text-white flex items-center gap-2 hover:shadow-xl hover:shadow-[#6366F1]/25 transition-all no-underline">
                Get Started Free <HiOutlineArrowRight />
              </Link>
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                <HiOutlineCheck className="text-[#10B981]" /> No credit card required
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
