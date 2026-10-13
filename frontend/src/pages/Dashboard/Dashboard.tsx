import { Link } from 'react-router-dom';
import {
  Brain, BarChart3, GitBranch, BookOpen, ArrowRight,
  Zap, Network, Layers, Search, RefreshCw, Code2, Activity
} from 'lucide-react';
import { Badge } from '../../components/ui';

const problemCategories = [
  { icon: GitBranch, label: 'Shortest Path', desc: 'Dijkstra, Bellman-Ford', color: 'text-indigo-400', bg: 'bg-indigo-900/30', link: '/visualizer/dijkstra' },
  { icon: Network, label: 'Minimum Spanning Tree', desc: 'Kruskal, Prim', color: 'text-emerald-400', bg: 'bg-emerald-900/30', link: '/visualizer/kruskal' },
  { icon: Layers, label: 'Knapsack / Packing', desc: '0/1 Knapsack, Fractional', color: 'text-purple-400', bg: 'bg-purple-900/30', link: '/visualizer/knapsack_01' },
  { icon: RefreshCw, label: 'Sorting', desc: 'Merge Sort, Quick Sort', color: 'text-blue-400', bg: 'bg-blue-900/30', link: '/visualizer/merge_sort' },
  { icon: Search, label: 'Searching', desc: 'Binary Search, Linear Search', color: 'text-cyan-400', bg: 'bg-cyan-900/30', link: '/visualizer/binary_search' },
  { icon: Code2, label: 'String Problems', desc: 'LCS, Edit Distance', color: 'text-amber-400', bg: 'bg-amber-900/30', link: '/visualizer/lcs' },
  { icon: Activity, label: 'Backtracking', desc: 'N-Queens, Graph Coloring', color: 'text-rose-400', bg: 'bg-rose-900/30', link: '/visualizer/n_queens' },
  { icon: Zap, label: 'Network Flow', desc: 'Max-Flow, Matching', color: 'text-orange-400', bg: 'bg-orange-900/30', link: '/visualizer/edmonds_karp' },
];

const quickAlgorithms = [
  { id: 'merge_sort', name: 'Merge Sort', paradigm: 'Divide & Conquer', complexity: 'O(n log n)' },
  { id: 'dijkstra', name: 'Dijkstra', paradigm: 'Greedy / Graph', complexity: 'O((V+E) log V)' },
  { id: 'knapsack_01', name: '0/1 Knapsack', paradigm: 'Dynamic Programming', complexity: 'O(n·W)' },
  { id: 'n_queens', name: 'N-Queens', paradigm: 'Backtracking', complexity: 'O(N!)' },
  { id: 'kruskal', name: 'Kruskal MST', paradigm: 'Greedy', complexity: 'O(E log E)' },
  { id: 'lcs', name: 'LCS', paradigm: 'Dynamic Programming', complexity: 'O(m·n)' },
];

const paradigmColors: Record<string, string> = {
  'Divide & Conquer': 'indigo',
  'Greedy': 'green',
  'Greedy / Graph': 'green',
  'Dynamic Programming': 'amber',
  'Backtracking': 'red',
  'Graph Traversal': 'gray',
};

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Hero ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-900/60 via-surface-800 to-surface-900 border border-primary-700/30 p-8 sm:p-12 mb-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.15),_transparent_60%)]" />
        <div className="relative z-10 max-w-2xl">
          <Badge variant="indigo" className="mb-4">Problem-First DAA Platform</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            What problem are you<br />
            <span className="gradient-text">trying to solve?</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            AlgoLab takes a <strong className="text-white">problem-first</strong> approach. Describe your problem,
            get paradigm recommendations, visualize execution, and compare algorithms empirically.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/advisor" className="btn-primary px-6 py-3 text-base">
              <Brain size={18} />
              Ask the Paradigm Advisor
              <ArrowRight size={16} />
            </Link>
            <Link to="/algorithms" className="btn-secondary px-6 py-3 text-base">
              <BookOpen size={18} />
              Browse Algorithms
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-64 hidden lg:flex items-center justify-center opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full text-primary-400" fill="currentColor">
            <circle cx="40" cy="40" r="6" /><circle cx="100" cy="20" r="6" /><circle cx="160" cy="40" r="6" />
            <circle cx="20" cy="100" r="6" /><circle cx="100" cy="100" r="8" /><circle cx="180" cy="100" r="6" />
            <circle cx="40" cy="160" r="6" /><circle cx="100" cy="180" r="6" /><circle cx="160" cy="160" r="6" />
            <line x1="40" y1="40" x2="100" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="100" y1="20" x2="160" y2="40" stroke="currentColor" strokeWidth="2" />
            <line x1="40" y1="40" x2="20" y2="100" stroke="currentColor" strokeWidth="2" />
            <line x1="40" y1="40" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
            <line x1="160" y1="40" x2="180" y2="100" stroke="currentColor" strokeWidth="2" />
            <line x1="160" y1="40" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="100" x2="40" y2="160" stroke="currentColor" strokeWidth="2" />
            <line x1="100" y1="100" x2="40" y2="160" stroke="currentColor" strokeWidth="2" />
            <line x1="100" y1="100" x2="160" y2="160" stroke="currentColor" strokeWidth="2" />
            <line x1="180" y1="100" x2="160" y2="160" stroke="currentColor" strokeWidth="2" />
            <line x1="40" y1="160" x2="100" y2="180" stroke="currentColor" strokeWidth="2" />
            <line x1="160" y1="160" x2="100" y2="180" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Algorithms', value: '20+', icon: Code2, color: 'text-primary-400' },
          { label: 'Paradigms', value: '7', icon: Layers, color: 'text-emerald-400' },
          { label: 'Visualizations', value: 'Live', icon: Activity, color: 'text-amber-400' },
          { label: 'Benchmark Engine', value: 'Real', icon: BarChart3, color: 'text-rose-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass p-4 text-center">
            <Icon size={22} className={`${color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${color} font-mono`}>{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Problem Categories ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Problem Categories</h2>
            <p className="text-gray-400 text-sm mt-0.5">Choose by problem type, not by algorithm name</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {problemCategories.map(({ icon: Icon, label, desc, color, bg, link }) => (
            <Link
              key={label}
              to={link}
              className="glass-hover p-4 group animate-fade-in"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-150`}>
                <Icon size={20} className={color} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-0.5">{label}</h3>
              <p className="text-xs text-gray-500">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Quick Access ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Paradigm Advisor CTA */}
        <div className="lg:col-span-1 glass p-6 flex flex-col gap-4 border border-primary-700/30 bg-gradient-to-br from-primary-900/30 to-surface-800">
          <div className="w-12 h-12 rounded-2xl bg-primary-600/20 flex items-center justify-center border border-primary-600/30">
            <Brain size={24} className="text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Paradigm Advisor</h2>
            <p className="text-gray-400 text-sm">
              Answer a few questions about your problem. Our rule-based engine recommends the best algorithmic paradigms and explains why.
            </p>
          </div>
          <Link to="/advisor" className="btn-primary mt-auto">
            Get Recommendation <ArrowRight size={16} />
          </Link>
        </div>

        {/* Quick Algorithm Access */}
        <div className="lg:col-span-2 glass p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Access</h2>
          <div className="space-y-2">
            {quickAlgorithms.map(({ id, name, paradigm, complexity }) => (
              <Link
                key={id}
                to={`/visualizer/${id}`}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-700 hover:bg-surface-600 border border-surface-600 hover:border-primary-600/40 transition-all duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 group-hover:animate-pulse" />
                  <span className="font-medium text-white text-sm">{name}</span>
                  <Badge variant={(paradigmColors[paradigm] as any) ?? 'gray'} className="hidden sm:inline-flex">
                    {paradigm}
                  </Badge>
                </div>
                <span className="text-xs font-mono text-gray-400 group-hover:text-primary-400 transition-colors">{complexity}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-surface-600">
            <Link to="/algorithms" className="btn-secondary w-full justify-center">
              <BookOpen size={16} /> View All Algorithms
            </Link>
          </div>
        </div>
      </div>

      {/* ── Feature row ── */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: GitBranch, title: 'Live Visualizer', desc: 'Step through actual algorithm execution — not fake animations.', link: '/visualizer', color: 'text-indigo-400' },
          { icon: BarChart3, title: 'Benchmark Lab', desc: 'Real operation counts and runtime on your inputs. No fabricated data.', link: '/benchmark', color: 'text-emerald-400' },
          { icon: Brain, title: 'Case Studies', desc: 'Real-world problems: routing, scheduling, compression, assignment.', link: '/case-studies', color: 'text-amber-400' },
        ].map(({ icon: Icon, title, desc, link, color }) => (
          <Link key={title} to={link} className="glass-hover p-5 group">
            <Icon size={24} className={`${color} mb-3 group-hover:scale-110 transition-transform duration-150`} />
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
