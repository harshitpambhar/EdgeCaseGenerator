import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineCheck } from 'react-icons/hi';
import { RiGithubFill } from 'react-icons/ri';
import { Circle, Upload, Cpu, TestTube, Code2, Play, ShieldCheck, FileBarChart } from 'lucide-react';
import { HeroGeometric } from '../../components/ui/shape-landing-hero';
import AppHeader from '../../components/shared/AppHeader';
import Footer from '../../components/shared/Footer';

const stats = [
  { label: 'Test Cases Generated', value: '3.8M+' },
  { label: 'Repos Analyzed', value: '22K+' },
  { label: 'Automation Scripts', value: '1.2M+' },
  { label: 'Bugs Caught', value: '940K+' },
];

const features = [
  { title: 'Repository Upload', description: 'Upload ZIP files or connect GitHub repos. Drag-and-drop with instant validation and parsing.', icon: Upload },
  { title: 'AI Workflow Detection', description: 'Automatically detects frameworks, routes, APIs, and components from your codebase.', icon: Cpu },
  { title: 'Intelligent Test Generation', description: 'Generates functional, edge case, API, and security test cases with AI reasoning.', icon: TestTube },
  { title: 'Playwright Automation', description: 'Auto-generates Playwright scripts with assertions, API calls, and full test flow coverage.', icon: Code2 },
  { title: 'Live Test Execution', description: 'Stream real-time execution logs, browser previews, and pass/fail states as tests run.', icon: Play },
  { title: 'Coverage & Risk Reports', description: 'Route, component, API, and workflow coverage with AI-detected risk insights.', icon: FileBarChart },
];

const workflow = [
  { step: '01', title: 'Upload Repository', desc: 'GitHub URL, ZIP upload, or drag-and-drop your codebase' },
  { step: '02', title: 'AI Analysis', desc: 'Workflow detection, framework identification, API mapping' },
  { step: '03', title: 'Test Generation', desc: 'Functional, edge case, security, and API test cases' },
  { step: '04', title: 'Automation Scripts', desc: 'Playwright scripts generated and ready to execute' },
  { step: '05', title: 'Execution & Validation', desc: 'Live execution with streaming logs and browser preview' },
  { step: '06', title: 'Reports', desc: 'Coverage analytics, failure analysis, and AI risk insights' },
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 0.5 + i * 0.2, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030303] selection:bg-indigo-500/30">
      <AppHeader />

      <HeroGeometric>
        <div className="min-h-screen flex items-center justify-center pt-14">
          <div className="max-w-4xl mx-auto text-center px-6">
            <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12">
              <Circle className="h-2 w-2 fill-rose-500/80 text-rose-500/80" />
              <span className="text-sm text-white/60 tracking-wide">AI-Powered QA Automation Platform</span>
            </motion.div>

            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                  Automate Your
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                  QA Pipeline
                </span>
              </h1>
            </motion.div>

            <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
              <p className="text-base sm:text-lg md:text-xl text-white/40 mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto">
                Upload your repo · AI detects workflows · Generates test cases · Runs Playwright automation
              </p>
            </motion.div>

            <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible"
              className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/signup"
                className="w-full sm:w-auto h-14 px-10 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-sm font-bold flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:scale-105 transition-all no-underline">
                Start Automating <HiOutlineArrowRight />
              </Link>
              <Link to="/login"
                className="w-full sm:w-auto h-14 px-10 rounded-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-bold flex items-center justify-center gap-3 hover:border-indigo-400/50 hover:bg-white/[0.06] transition-all no-underline">
                <RiGithubFill className="text-xl" /> Connect GitHub
              </Link>
            </motion.div>
          </div>
        </div>
      </HeroGeometric>

      {/* Stats */}
      <section className="py-20 px-6 relative border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/30 mt-2 tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto w-full max-w-5xl space-y-10">
          <motion.div initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.8 }} className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              End-to-End QA{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">Automation.</span>
            </h2>
            <p className="text-white/40 mt-4 text-sm md:text-base max-w-xl mx-auto">
              From repository upload to validated test reports — fully automated.
            </p>
          </motion.div>

          <motion.div initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.8 }}
            className="grid grid-cols-1 divide-x divide-y divide-dashed divide-white/[0.08] border border-dashed border-white/[0.08] sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-6 md:p-8">
                  <Icon className="w-6 h-6 text-indigo-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-32 px-6 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent">
        <div className="max-w-5xl mx-auto text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">Six Steps to Zero Bugs.</h2>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 lg:grid-cols-6 gap-10">
          {workflow.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
              <span className="text-7xl font-bold text-white/[0.03] absolute -top-10 -left-2 leading-none select-none">{item.step}</span>
              <div className="relative z-10 pt-6">
                <div className="w-8 h-px bg-gradient-to-r from-indigo-400 to-rose-400 mb-5" />
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-indigo-500/[0.15] to-rose-500/[0.15] border border-white/[0.08] p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Ship with<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300">Confidence.</span>
            </h2>
            <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto">
              Automate your entire QA pipeline in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup"
                className="h-14 px-12 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-base font-bold flex items-center gap-3 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:scale-105 transition-all no-underline">
                Get Started Free <HiOutlineArrowRight />
              </Link>
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <HiOutlineCheck className="text-indigo-400 text-lg" /> No credit card required
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}