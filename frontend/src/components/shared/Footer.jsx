import { Link } from 'react-router-dom';
import { RiGithubFill, RiTwitterXFill, RiLinkedinBoxFill } from 'react-icons/ri';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-black/40 backdrop-blur-md py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">QA Platform</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              AI-powered autonomous QA automation platform for modern development teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Product</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">Features</Link></li>
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">Pricing</Link></li>
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Company</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">About</Link></li>
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">Blog</Link></li>
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">Privacy</Link></li>
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">Terms</Link></li>
              <li><Link to="#" className="text-white/60 hover:text-white text-sm transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/40 text-sm">
              &copy; {currentYear} QA Platform. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/40 hover:text-indigo-400 transition-colors">
                <RiGithubFill className="text-xl" />
              </a>
              <a href="#" className="text-white/40 hover:text-indigo-400 transition-colors">
                <RiTwitterXFill className="text-xl" />
              </a>
              <a href="#" className="text-white/40 hover:text-indigo-400 transition-colors">
                <RiLinkedinBoxFill className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
