import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  HiOutlineCode, HiOutlinePlay, HiOutlineLightningBolt,
  HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineArrowRight,
} from 'react-icons/hi';
import { Globe, GitBranch, Layers, Shield } from 'lucide-react';

const project = {
  name: 'ecommerce-frontend',
  framework: 'React 18 + TypeScript',
  language: 'TypeScript',
  testFramework: 'Playwright',
  coverage: 84,
  status: 'Completed',
  files: 284,
  routes: 47,
  components: 93,
  apis: 31,
  testCases: 312,
  scripts: 28,
  lastRun: '1 hr ago',
};

const workflowSteps = [
  { label: 'Upload', status: 'done' },
  { label: 'AI Analysis', status: 'done' },
  { label: 'Workflow Detection', status: 'done' },
  { label: 'Test Generation', status: 'done' },
  { label: 'Script Generation', status: 'done' },
  { label: 'Execution', status: 'done' },
  { label: 'Report', status: 'done' },
];

const detectedRoutes = ['/home', '/products', '/cart', '/checkout', '/account', '/orders', '/login', '/signup'];

const aiRisks = [
  { label: 'Unhandled async errors in checkout flow', severity: 'High' },
  { label: 'Missing input validation on payment form', severity: 'High' },
  { label: 'No loading state for product fetch', severity: 'Medium' },
  { label: 'Cart state not persisted on refresh', severity: 'Medium' },
  { label: 'Accessibility: missing aria-labels on icons', severity: 'Low' },
];

const riskStyle = {
  High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function ProjectOverviewPage() {
  const { id } = useParams();

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/projects" className="text-xs text-white/30 hover:text-white/60 transition-colors no-underline">Projects</Link>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs text-white/60">{project.name}</span>
          </div>
          <h2 className="text-xl font-semibold text-white">{project.name}</h2>
          <p className="text-sm text-white/40 mt-0.5">{project.framework} · {project.testFramework}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/testcases" className="h-9 px-4 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors no-underline flex items-center gap-2">
            <HiOutlineCode className="text-sm" /> Test Cases
          </Link>
          <Link to="/executions" className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-2">
            <HiOutlinePlay className="text-sm" /> Run Tests
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Files', value: project.files },
          { label: 'Routes', value: project.routes },
          { label: 'Components', value: project.components },
          { label: 'APIs', value: project.apis },
          { label: 'Test Cases', value: project.testCases },
          { label: 'Scripts', value: project.scripts },
          { label: 'Coverage', value: `${project.coverage}%` },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-semibold text-white">{s.value}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Workflow visualization */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <p className="text-sm font-medium text-white mb-4">Pipeline status</p>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {workflowSteps.map((step, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <HiOutlineCheckCircle className="text-emerald-400 text-sm" />
                </div>
                <span className="text-[10px] text-white/40 whitespace-nowrap">{step.label}</span>
              </div>
              {i < workflowSteps.length - 1 && (
                <div className="w-8 h-px bg-emerald-500/20 mx-1 flex-shrink-0 mb-4" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Detected structure */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-4">
          <p className="text-sm font-medium text-white">Detected structure</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-white">Framework</p>
                <p className="text-xs text-white/40 mt-0.5">{project.framework}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-white">Routes detected</p>
                <p className="text-xs text-white/40 mt-0.5">{detectedRoutes.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <GitBranch className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-white">APIs mapped</p>
                <p className="text-xs text-white/40 mt-0.5">{project.apis} endpoints across 8 services</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI risks */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineLightningBolt className="text-amber-400 text-sm" />
            <p className="text-sm font-medium text-white">AI-detected risks</p>
          </div>
          <div className="space-y-2">
            {aiRisks.map((risk, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs text-white/60 flex-1">{risk.label}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${riskStyle[risk.severity]}`}>{risk.severity}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Coverage bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white">Coverage summary</p>
          <Link to={`/reports/coverage/${id}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors no-underline flex items-center gap-1">
            Full report <HiOutlineArrowRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Route coverage', value: 89 },
            { label: 'Component coverage', value: 84 },
            { label: 'API coverage', value: 76 },
            { label: 'Workflow coverage', value: 91 },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/40">{item.label}</span>
                <span className="text-xs font-medium text-emerald-400">{item.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}