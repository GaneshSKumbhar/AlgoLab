import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Activity, ArrowRight, BarChart3, BookOpen, Brain, Code2, FileArchive, GitBranch, Layers, Network, RefreshCw, Search } from 'lucide-react';
import { Badge } from '../../components/ui';

const categories = [
  ['Shortest Path', 'Dijkstra, Bellman-Ford', GitBranch, 'text-indigo-400', 'bg-indigo-900/30', '/visualizer/dijkstra'],
  ['Minimum Spanning Tree', 'Kruskal, Prim', Network, 'text-emerald-400', 'bg-emerald-900/30', '/visualizer/kruskal'],
  ['Knapsack / Packing', '0/1 Knapsack, Fractional', Layers, 'text-purple-400', 'bg-purple-900/30', '/visualizer/knapsack_01'],
  ['Sorting', 'Merge Sort, Quick Sort', RefreshCw, 'text-blue-400', 'bg-blue-900/30', '/visualizer/merge_sort'],
  ['Searching', 'Binary Search, Linear Search', Search, 'text-cyan-400', 'bg-cyan-900/30', '/visualizer/binary_search'],
  ['String Problems', 'Longest Common Subsequence', Code2, 'text-amber-400', 'bg-amber-900/30', '/visualizer/lcs'],
  ['Backtracking', 'N-Queens', Activity, 'text-rose-400', 'bg-rose-900/30', '/visualizer/n_queens'],
  ['Compression', 'Huffman Coding', FileArchive, 'text-orange-400', 'bg-orange-900/30', '/visualizer/huffman'],
] as const;

const quickAlgorithms = [
  ['merge_sort', 'Merge Sort', 'Divide & Conquer', 'O(n log n)', 'indigo'],
  ['dijkstra', 'Dijkstra', 'Greedy / Graph', 'O((V+E) log V)', 'green'],
  ['knapsack_01', '0/1 Knapsack', 'Dynamic Programming', 'O(n·W)', 'amber'],
  ['n_queens', 'N-Queens', 'Backtracking', 'O(N!)', 'red'],
  ['kruskal', 'Kruskal MST', 'Greedy', 'O(E log E)', 'green'],
  ['lcs', 'LCS', 'Dynamic Programming', 'O(m·n)', 'amber'],
] as const;

const metrics: { label: string; value: string; icon: LucideIcon; color: string }[] = [
  { label: 'Algorithms', value: '20', icon: Code2, color: 'text-primary-400' },
  { label: 'Paradigms', value: '7', icon: Layers, color: 'text-emerald-400' },
  { label: 'Visualizations', value: 'Live', icon: Activity, color: 'text-amber-400' },
  { label: 'Benchmark Engine', value: 'Real', icon: BarChart3, color: 'text-rose-400' },
];

const features: { icon: LucideIcon; title: string; description: string; link: string; color: string }[] = [
  { icon: GitBranch, title: 'Live Visualizer', description: 'Test your own input and step through actual execution.', link: '/visualizer', color: 'text-indigo-400' },
  { icon: BarChart3, title: 'Benchmark Lab', description: 'Compare operation counts and runtime using real data.', link: '/benchmark', color: 'text-emerald-400' },
  { icon: Brain, title: 'Case Studies', description: 'Routing, scheduling, compression, and assignment examples.', link: '/case-studies', color: 'text-amber-400' },
];

export default function Dashboard() {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-900/60 via-surface-800 to-surface-900 border border-primary-700/30 p-8 sm:p-12 mb-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.15),_transparent_60%)]" />
      <div className="relative z-10 max-w-2xl"><Badge variant="indigo" className="mb-4">Problem-First DAA Platform</Badge><h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">What problem are you<br /><span className="gradient-text">trying to solve?</span></h1><p className="text-gray-300 text-lg mb-8 leading-relaxed">Describe your problem, get paradigm recommendations, test your own input, visualize execution, and compare algorithms empirically.</p><div className="flex flex-wrap gap-3"><Link to="/advisor" className="btn-primary px-6 py-3 text-base"><Brain size={18} />Ask the Paradigm Advisor<ArrowRight size={16} /></Link><Link to="/algorithms" className="btn-secondary px-6 py-3 text-base"><BookOpen size={18} />Browse Algorithms</Link></div></div>
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:grid grid-cols-3 gap-5 opacity-15">{Array.from({ length: 9 }, (_, index) => <span key={index} className="w-4 h-4 rounded-full bg-primary-300" />)}</div>
    </section>

    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">{metrics.map(({ label, value, icon: Icon, color }) => <div key={label} className="glass p-4 text-center"><Icon size={22} className={`${color} mx-auto mb-2`} /><div className={`text-2xl font-bold ${color} font-mono`}>{value}</div><div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{label}</div></div>)}</section>

    <section className="mb-10"><h2 className="text-xl font-bold text-white">Problem Categories</h2><p className="text-gray-400 text-sm mt-0.5 mb-5">Choose by problem type, not by algorithm name</p><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{categories.map(([label, description, Icon, color, background, link]) => <Link key={label} to={link} className="glass-hover p-4 group animate-fade-in"><div className={`w-10 h-10 rounded-xl ${background} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><Icon size={20} className={color} /></div><h3 className="text-sm font-semibold text-white mb-0.5">{label}</h3><p className="text-xs text-gray-500">{description}</p></Link>)}</div></section>

    <section className="grid lg:grid-cols-3 gap-6 mb-10"><div className="glass p-6 flex flex-col gap-4 border border-primary-700/30 bg-gradient-to-br from-primary-900/30 to-surface-800"><div className="w-12 h-12 rounded-2xl bg-primary-600/20 flex items-center justify-center border border-primary-600/30"><Brain size={24} className="text-primary-400" /></div><div><h2 className="text-lg font-bold text-white mb-1">Paradigm Advisor</h2><p className="text-gray-400 text-sm">Answer a few questions about your problem. The advisor recommends suitable paradigms and explains why.</p></div><Link to="/advisor" className="btn-primary mt-auto">Get Recommendation <ArrowRight size={16} /></Link></div><div className="lg:col-span-2 glass p-6"><h2 className="text-lg font-bold text-white">Quick Access</h2><p className="text-xs text-gray-500 mt-1 mb-4">Open an algorithm, replace its sample values with your own, then select Run My Input.</p><div className="space-y-2">{quickAlgorithms.map(([id, name, paradigm, complexity, color]) => <Link key={id} to={`/visualizer/${id}`} className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-700 hover:bg-surface-600 border border-surface-600 hover:border-primary-600/40 transition-all group"><div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary-500 group-hover:animate-pulse" /><span className="font-medium text-white text-sm">{name}</span><Badge variant={color as 'indigo' | 'green' | 'amber' | 'red'} className="hidden sm:inline-flex">{paradigm}</Badge></div><span className="text-xs font-mono text-gray-400 group-hover:text-primary-400">{complexity}</span></Link>)}</div><div className="mt-4 pt-4 border-t border-surface-600"><Link to="/algorithms" className="btn-secondary w-full justify-center"><BookOpen size={16} />View All Algorithms</Link></div></div></section>

    <section className="grid sm:grid-cols-3 gap-4">{features.map(({ icon: Icon, title, description, link, color }) => <Link key={title} to={link} className="glass-hover p-5 group"><Icon size={24} className={`${color} mb-3 group-hover:scale-110 transition-transform`} /><h3 className="font-semibold text-white mb-1">{title}</h3><p className="text-sm text-gray-400">{description}</p></Link>)}</section>
  </div>;
}
