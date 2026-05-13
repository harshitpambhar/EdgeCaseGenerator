import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCode, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineBeaker, HiOutlineCube, HiOutlineArrowRight, HiOutlineCheck } from 'react-icons/hi';
import { RiRobot2Line, RiGithubFill } from 'react-icons/ri';
import Footer from '../components/Footer';

const stats = [
  { label: 'Tests Generated', value: '2.4M+', icon: HiOutlineBeaker, color: '#22d3ee' },
  { label: 'Repos Analyzed', value: '18K+', icon: HiOutlineCube, color: '#3b82f6' },
  { label: 'Coverage Boost', value: '47%', icon: HiOutlineChartBar, color: '#8b5cf6' },
  { label: 'Edge Cases', value: '890K+', icon: HiOutlineShieldCheck, color: '#10B981' },
];

const features = [
  { title: 'AST-Based Analysis', desc: 'Deep abstract syntax tree parsing for intelligent code understanding across 12+ languages.', icon: HiOutlineCode, color: '#22d3ee' },
  { title: 'ML Risk Detection', desc: 'Neural networks identify high-risk functions and predict potential failure points.', icon: HiOutlineLightningBolt, color: '#3b82f6' },
  { title: 'Smart Edge Cases', desc: 'Automatically generates boundary conditions, null checks, and concurrency edge cases.', icon: HiOutlineShieldCheck, color: '#8b5cf6' },
  { title: 'Coverage Analytics', desc: 'Real-time coverage metrics with branch, line, and function-level breakdowns.', icon: HiOutlineChartBar, color: '#22d3ee' },
  { title: 'CI/CD Integration', desc: 'Seamlessly plugs into GitHub Actions, Jenkins, GitLab CI, and more.', icon: HiOutlineCube, color: '#3b82f6' },
  { title: 'Auto-Healing Tests', desc: 'Tests automatically adapt when your codebase changes, reducing maintenance.', icon: HiOutlineBeaker, color: '#8b5cf6' },
];

const workflow = [
  { step: '01', title: 'Upload Repo', desc: 'Push your code or connect via GitHub URL' },
  { step: '02', title: 'AI Analysis', desc: 'ML models parse AST and detect risk zones' },
  { step: '03', title: 'Test Generation', desc: 'Intelligent test cases created for each function' },
  { step: '04', title: 'Reports', desc: 'Comprehensive analytics and export options' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050816] bg-mesh bg-grid-cyber selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050816]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
              <RiRobot2Line className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold font-heading tracking-tight text-white">TestGen<span className="text-cyan-400">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Workflow', 'Stats'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors no-underline uppercase tracking-widest">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors no-underline">SIGN IN</Link>
            <Link to="/signup" className="h-11 px-6 rounded-full bg-white text-[#050816] text-sm font-bold flex items-center gap-2 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all no-underline">
              GET STARTED <HiOutlineArrowRight className="text-base" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden min-h-screen flex items-center">
        <div className="hero-glow" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Floating Background Nodes */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 2000 - 1000, 
              y: Math.random() * 1000 - 500,
              opacity: Math.random() * 0.3 + 0.1
            }}
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400/40 pointer-events-none"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px rgba(34,211,238,0.5)'
            }}
          />
        ))}

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-panel border-white/5 mb-12 bg-white/[0.02]">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-neon shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Project NEURAL_ORCHESTRATOR v1.0.4</span>
            </div>
            
            <h1 className="text-6xl md:text-[7.5rem] font-black font-heading leading-[0.85] mb-12 tracking-tighter text-white">
              AUTONOMOUS<br />
              <span className="text-gradient-cyan">TESTING_CORE</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-tight font-black uppercase tracking-tight">
              NEURAL_ANALYSIS ENGINE // AUTOMATED EDGE_CASE SYNTHESIS // ELITE COVERAGE ORCHESTRATION
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/signup" className="w-full sm:w-auto h-16 px-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white text-base font-black flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:scale-105 transition-all no-underline uppercase tracking-widest">
                Initialize System <HiOutlineArrowRight />
              </Link>
              <Link to="/login" className="w-full sm:w-auto h-16 px-12 rounded-full glass-panel border-white/10 text-white text-base font-black flex items-center justify-center gap-4 hover:border-cyan-400/50 transition-all no-underline uppercase tracking-widest">
                <RiGithubFill className="text-2xl" /> Connect Archive
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-6 relative border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-500">
                <stat.icon className="text-xl" style={{ color: stat.color }} />
              </div>
              <p className="text-3xl font-black font-heading text-white mb-2">{stat.value}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black font-heading text-white mb-6">Engineered for Scale.</h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto uppercase tracking-widest font-bold">The most advanced AI test suite on the planet.</p>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-[2rem] p-10 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent blur-3xl" />
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative z-10" style={{ background: `${feat.color}15` }}>
                <feat.icon className="text-3xl" style={{ color: feat.color }} />
              </div>
              <h3 className="text-2xl font-black font-heading text-white mb-4 group-hover:text-cyan-400 transition-colors">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-32 px-6 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent">
        <div className="max-w-5xl mx-auto text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black font-heading text-white mb-6">Four Steps to Perfection.</h2>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          {workflow.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative">
              <span className="text-8xl font-black font-heading text-white/[0.03] absolute -top-12 -left-4 leading-none select-none">{item.step}</span>
              <div className="relative z-10 pt-8">
                <h3 className="text-xl font-black font-heading text-white mb-3 uppercase tracking-wider">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-blue-600 to-purple-800 p-20 text-center relative overflow-hidden group shadow-[0_0_100px_rgba(59,130,246,0.2)]">
          <div className="absolute inset-0 bg-grid-cyber opacity-20 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#050816]/60 to-transparent" />
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black font-heading text-white mb-10 tracking-tighter">Ready to Deploy <br /> Better Code?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/signup" className="h-16 px-12 rounded-full bg-white text-[#050816] text-xl font-black flex items-center gap-3 hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all no-underline">
                Get Started Free <HiOutlineArrowRight />
              </Link>
              <div className="flex items-center gap-3 text-slate-200 font-bold uppercase tracking-widest text-sm">
                <HiOutlineCheck className="text-cyan-400 text-xl" /> Enterprise Ready
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
