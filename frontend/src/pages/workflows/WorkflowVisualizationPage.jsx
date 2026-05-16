import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HiOutlineCheckCircle, HiOutlineArrowRight, HiOutlineCollection } from 'react-icons/hi';
import { WORKFLOW_STEPS } from '../../constants/status-values';

export default function WorkflowVisualizationPage() {
  const workflows = [
    {
      id: 1,
      name: 'User Authentication Flow',
      steps: ['Login Page', 'API Call', 'Token Storage', 'Dashboard Redirect'],
      apis: ['POST /auth/login', 'GET /auth/verify'],
      pages: ['Login', 'Dashboard'],
      components: ['LoginForm', 'AuthContext', 'ProtectedRoute'],
    },
    {
      id: 2,
      name: 'Product Purchase Flow',
      steps: ['Product Page', 'Add to Cart', 'Checkout', 'Payment', 'Order Confirmation'],
      apis: ['GET /products', 'POST /cart/add', 'POST /orders', 'POST /payment'],
      pages: ['Products', 'Cart', 'Checkout', 'OrderConfirmation'],
      components: ['ProductCard', 'CartSummary', 'CheckoutForm', 'PaymentForm'],
    },
    {
      id: 3,
      name: 'User Profile Update Flow',
      steps: ['Profile Page', 'Edit Mode', 'Update API', 'Success Message'],
      apis: ['GET /users/:id', 'PUT /users/:id'],
      pages: ['ProfilePage'],
      components: ['ProfileForm', 'EditButton', 'SuccessNotification'],
    },
  ];

  const allSteps = Object.values(WORKFLOW_STEPS);

  const WorkflowCard = ({ workflow }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-slate-900/50 border border-white/10 rounded-xl p-6 hover:border-indigo-500/20 transition-colors"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{workflow.name}</h3>

      {/* Workflow Steps */}
      <div className="mb-6">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Workflow Path</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {workflow.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-sm text-indigo-300 whitespace-nowrap">
                {step}
              </div>
              {i < workflow.steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* APIs */}
      <div className="mb-4">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">API Endpoints</p>
        <div className="flex flex-wrap gap-2">
          {workflow.apis.map((api, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              {api}
            </span>
          ))}
        </div>
      </div>

      {/* Pages & Components */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-white/40 mb-1">Pages</p>
          <div className="space-y-1">
            {workflow.pages.map((page, i) => (
              <div key={i} className="text-white/60">{page}</div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-white/40 mb-1">Components</p>
          <div className="space-y-1">
            {workflow.components.slice(0, 3).map((comp, i) => (
              <div key={i} className="text-white/60">{comp}</div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Workflow Visualization</h1>
        <p className="text-white/60">View user flows, API interactions, and component relationships</p>
      </div>

      {/* QA Testing Workflow */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-8"
      >
        <h2 className="text-xl font-semibold text-white mb-6">QA Testing Workflow</h2>
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {allSteps.map((step, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-indigo-500 mb-2">
                  <HiOutlineCheckCircle className="text-white text-lg" />
                </div>
                <span className="text-xs text-white/80 text-center whitespace-nowrap w-20">{step}</span>
              </div>
              {i < allSteps.length - 1 && (
                <div className="h-1 w-12 bg-indigo-500 mx-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Workflows Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Application Workflows</h2>
        <div className="grid gap-6">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      </div>

      {/* Backend Services Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Backend Microservices Architecture</h3>
        <div className="space-y-4">
          {[
            { name: 'API Gateway', description: 'Central entry point for all requests', port: '8080' },
            { name: 'Auth Service', description: 'Authentication and user management', port: '8081' },
            { name: 'User Service', description: 'User profile and preferences', port: '8082' },
            { name: 'Config Server', description: 'Centralized configuration', port: '8888' },
            { name: 'Eureka Server', description: 'Service discovery and registration', port: '8761' },
          ].map((service, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <div>
                <p className="font-semibold text-white">{service.name}</p>
                <p className="text-sm text-white/40">{service.description}</p>
              </div>
              <span className="text-sm text-white/60 font-mono">:{service.port}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Frontend Routes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Frontend Routes</h3>
        <div className="space-y-2 text-sm">
          {[
            '/dashboard - Main dashboard with analytics',
            '/projects - Project listing and management',
            '/repository-analysis - Repository structure analysis',
            '/workflows - Workflow visualization',
            '/test-generation - AI test case generation',
            '/test-review - Test case review and approval',
            '/automation - Automation script management',
            '/executions - Execution monitoring and history',
            '/reports - Test reports and analytics',
          ].map((route, i) => (
            <div key={i} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <HiOutlineArrowRight className="flex-shrink-0 text-indigo-400" />
              <span className="font-mono">{route}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
