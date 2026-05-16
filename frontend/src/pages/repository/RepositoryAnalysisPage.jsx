import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, FileText, Folder, Code, Database, Settings } from 'lucide-react';
import { HiOutlineLightningBolt, HiOutlineCheckCircle } from 'react-icons/hi';

export default function RepositoryAnalysisPage() {
  const [expanded, setExpanded] = useState({});

  const analysis = {
    project: 'ecommerce-frontend',
    status: 'Completed',
    totalFiles: 284,
    totalLines: 45320,
    analyzedAt: '2 hours ago',
    folderStructure: {
      src: {
        components: ['Header.jsx', 'Footer.jsx', 'ProductCard.jsx', 'CartItem.jsx'],
        pages: ['Home.jsx', 'Products.jsx', 'Cart.jsx', 'Checkout.jsx', 'Account.jsx'],
        services: ['api.js', 'auth.js', 'storage.js'],
        hooks: ['useCart.js', 'useAuth.js', 'useProducts.js'],
        utils: ['formatting.js', 'validation.js', 'helpers.js'],
      },
      public: ['index.html', 'favicon.ico'],
    },
    detectedFramework: {
      name: 'React 18',
      version: '18.2.0',
      confidence: 99,
      additionalLibs: ['React Router v6', 'Axios', 'Tailwind CSS', 'Framer Motion'],
    },
    apiEndpoints: [
      { method: 'GET', path: '/api/products', description: 'Fetch all products' },
      { method: 'GET', path: '/api/products/:id', description: 'Get product details' },
      { method: 'POST', path: '/api/orders', description: 'Create order' },
      { method: 'POST', path: '/api/auth/login', description: 'User login' },
      { method: 'POST', path: '/api/auth/register', description: 'User registration' },
      { method: 'GET', path: '/api/cart', description: 'Get cart items' },
      { method: 'POST', path: '/api/cart/add', description: 'Add item to cart' },
    ],
    components: [
      { name: 'Header', path: 'src/components/Header.jsx', lines: 145, complexity: 'Medium' },
      { name: 'ProductCard', path: 'src/components/ProductCard.jsx', lines: 89, complexity: 'Low' },
      { name: 'Cart', path: 'src/pages/Cart.jsx', lines: 267, complexity: 'High' },
      { name: 'Checkout', path: 'src/pages/Checkout.jsx', lines: 312, complexity: 'High' },
    ],
    databases: [
      { type: 'MongoDB', url: 'mongodb://localhost:27017', databases: ['ecommerce', 'test'] },
      { type: 'Redis', url: 'redis://localhost:6379', purpose: 'Caching' },
    ],
    dependencies: [
      { name: 'react', version: '18.2.0', type: 'runtime' },
      { name: 'react-dom', version: '18.2.0', type: 'runtime' },
      { name: 'react-router-dom', version: '6.8.0', type: 'runtime' },
      { name: 'axios', version: '1.3.0', type: 'runtime' },
      { name: 'tailwindcss', version: '3.2.4', type: 'dev' },
      { name: 'jest', version: '29.4.0', type: 'dev' },
      { name: 'playwright', version: '1.40.0', type: 'dev' },
    ],
  };

  const toggleExpand = (section) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const Section = ({ title, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
    >
      <button
        onClick={() => toggleExpand(title)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Icon className="text-indigo-400 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <ChevronDown
          className={`text-white/40 transition-transform ${expanded[title] ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded[title] && <div className="mt-4">{children}</div>}
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{analysis.project}</h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-emerald-400">
            <HiOutlineCheckCircle />
            {analysis.status}
          </div>
          <span className="text-white/40">{analysis.analyzedAt}</span>
          <span className="text-white/40">{analysis.totalFiles} files • {analysis.totalLines.toLocaleString()} lines</span>
        </div>
      </div>

      {/* Framework Detection */}
      <Section title="Detected Framework" icon={Code}>
        <div className="space-y-4">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white">{analysis.detectedFramework.name}</span>
              <span className="text-sm text-emerald-400 font-medium">{analysis.detectedFramework.confidence}% match</span>
            </div>
            <p className="text-sm text-white/60 mb-3">Additional Libraries:</p>
            <div className="flex flex-wrap gap-2">
              {analysis.detectedFramework.additionalLibs.map((lib, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white/80">
                  {lib}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* API Endpoints */}
      <Section title="API Endpoints" icon={HiOutlineLightningBolt}>
        <div className="space-y-2">
          {analysis.apiEndpoints.map((api, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                api.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                api.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                api.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {api.method}
              </span>
              <div className="flex-1">
                <p className="text-sm font-mono text-white/80">{api.path}</p>
                <p className="text-xs text-white/40">{api.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Components */}
      <Section title="Components Detected" icon={Code}>
        <div className="space-y-2">
          {analysis.components.map((comp, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{comp.name}</p>
                <p className="text-xs text-white/40 font-mono">{comp.path}</p>
              </div>
              <div className="flex gap-4 text-sm text-white/60">
                <span>{comp.lines} lines</span>
                <span className={comp.complexity === 'High' ? 'text-rose-400' : comp.complexity === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}>
                  {comp.complexity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Dependencies */}
      <Section title="Dependencies" icon={Settings}>
        <div className="space-y-4">
          {['runtime', 'dev'].map((type) => (
            <div key={type}>
              <p className="text-sm font-medium text-white/60 mb-2 capitalize">{type} Dependencies</p>
              <div className="space-y-2">
                {analysis.dependencies
                  .filter((dep) => dep.type === type)
                  .map((dep, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-white/80">{dep.name}</span>
                      <span className="text-xs text-white/40">{dep.version}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Databases */}
      <Section title="Database Configurations" icon={Database}>
        <div className="space-y-3">
          {analysis.databases.map((db, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{db.type}</span>
                <span className="text-xs text-white/40 font-mono">{db.url}</span>
              </div>
              {db.databases && (
                <div className="text-sm text-white/60">
                  Databases: {db.databases.join(', ')}
                </div>
              )}
              {db.purpose && (
                <div className="text-sm text-white/60">
                  Purpose: {db.purpose}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
