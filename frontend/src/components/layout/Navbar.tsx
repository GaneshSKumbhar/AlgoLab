import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, GitBranch, BarChart3,
  Brain, FlaskConical, Info, Menu, X, Cpu
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/advisor', label: 'Paradigm Advisor', icon: Brain },
  { to: '/algorithms', label: 'Algorithms', icon: BookOpen },
  { to: '/visualizer', label: 'Visualizer', icon: GitBranch },
  { to: '/benchmark', label: 'Benchmark Lab', icon: BarChart3 },
  { to: '/case-studies', label: 'Case Studies', icon: FlaskConical },
  { to: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { authenticated, username, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-900/90 backdrop-blur-md border-b border-surface-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center glow-primary">
              <Cpu size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AlgoLab</span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
            {authenticated ? <button onClick={() => { signOut(); navigate('/'); }} className="ml-2 text-xs text-gray-400 hover:text-white">Sign out {username}</button> : <NavLink to="/login" className="ml-2 btn-secondary text-sm">Sign in</NavLink>}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden btn-icon"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-surface-600/50 bg-surface-900/95 backdrop-blur-md animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
