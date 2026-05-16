import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineLightningBolt, HiOutlineCode, HiOutlineCheckCircle } from 'react-icons/hi';
import { Brain, GitBranch, Play } from 'lucide-react';

const testCase = {
  id: 'tc1',
  title: 'User can complete checkout with valid card',
  type: 'Functional',
  priority: 'High',
  severity: 'Critical',
  module: 'Checkout',
  automationScript: 'checkout-flow.spec.ts',
  steps: [
    { step: 1, action: 'Navigate to /products', expected: 'Products page loads with items listed' },
    { step: 2, action: 'Click "Add to Cart" on first product', expected: 'Cart count increments to 1' },
    { step: 3, action: 'Navigate to /cart', expected: 'Cart page shows added product' },
    { step: 4, action: 'Click "Proceed to Checkout"', expected: 'Checkout page loads with order summary' },
    { step: 5, action: 'Fill in shipping address fields', expected: 'Form accepts valid address input' },
    { step: 6, action: 'Enter valid card: 4111 1111 1111 1111, exp 12/26, CVV 123', expected: 'Card fields accept input without errors' },
    { step: 7, action: 'Click "Place Order"', expected: 'Loading state shown, API POST /api/orders called' },
    { step: 8, action: 'Wait for order confirmation', expected: 'Order confirmation page shown with order ID' },
  ],
  aiReasoning: 'This test case was generated because the checkout flow is the highest-value user journey. The AI detected a multi-step form with payment processing, async API calls, and state transitions — all high-risk areas. The test covers the happy path to establish a baseline before edge case testing.',
  moduleMapping: ['Checkout.tsx', 'CartContext.tsx', 'PaymentForm.tsx', 'OrderService.ts', 'api/orders.ts'],
};

const typeColors = {
  Functional: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'Edge Case': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  API: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Security: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function TestCaseDetailPage() {
  const { id } = useParams();

  return (
    <div className="max-w-3xl space-y-5 pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/30">
        <Link to="/testcases" className="hover:text-white/60 transition-colors no-underline">Test Cases</Link>
        <span>/</span>
        <span className="text-white/60">{testCase.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{testCase.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeColors[testCase.type]}`}>{testCase.type}</span>
            <span className="text-xs text-white/40">{testCase.module}</span>
            <span className="text-xs text-rose-400 font-medium">{testCase.priority} priority</span>
          </div>
        </div>
        <Link to={`/automation/${id}`}
          className="h-9 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-sm text-white font-medium transition-colors no-underline flex items-center gap-2 flex-shrink-0">
          <Play className="w-3.5 h-3.5" /> View Script
        </Link>
      </div>

      {/* Steps */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-medium text-white">Test steps</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {testCase.steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex gap-4 px-5 py-4">
              <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-indigo-400">{s.step}</span>
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-white/30 mb-1">Action</p>
                  <p className="text-sm text-white/70">{s.action}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 mb-1">Expected result</p>
                  <p className="text-sm text-emerald-400/80">{s.expected}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* AI reasoning */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-indigo-400" />
            <p className="text-sm font-medium text-white">AI reasoning</p>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{testCase.aiReasoning}</p>
        </motion.div>

        {/* Module mapping */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-medium text-white">Module mapping</p>
          </div>
          <div className="space-y-2">
            {testCase.moduleMapping.map((mod, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <HiOutlineCode className="text-xs text-white/30 flex-shrink-0" />
                <span className="text-xs text-white/60 font-mono">{mod}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Automation mapping */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiOutlineCheckCircle className="text-indigo-400 text-lg flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">Automation script generated</p>
            <p className="text-xs text-white/40 mt-0.5 font-mono">{testCase.automationScript}</p>
          </div>
        </div>
        <Link to={`/automation/${id}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors no-underline flex items-center gap-1">
          View script →
        </Link>
      </motion.div>
    </div>
  );
}
