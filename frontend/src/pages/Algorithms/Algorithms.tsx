import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import { fetchAlgorithms } from '../../services/api';
import type { AlgorithmMeta } from '../../services/api';
import { Badge, Card, ComplexityBadge, Spinner, SectionHeader, EmptyState } from '../../components/ui';

const CATEGORIES = ['all', 'sorting', 'searching', 'graph', 'dp', 'greedy', 'backtracking'];
const PARADIGM_COLORS: Record<string, 'indigo' | 'green' | 'amber' | 'red' | 'gray'> = {
  'Divide & Conquer': 'indigo',
  'Greedy': 'green',
  'Greedy / Graph': 'green',
  'Dynamic Programming': 'amber',
  'Backtracking': 'red',
  'Graph Traversal': 'gray',
  'Brute Force': 'gray',
  'Randomized / Divide & Conquer': 'indigo',
  'Network Flow': 'indigo',
  'Dynamic Programming / Graph': 'amber',
};

export default function Algorithms() {
  const [algorithms, setAlgorithms] = useState<AlgorithmMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchAlgorithms()
      .then(setAlgorithms)
      .catch(() => setError('Failed to load algorithms. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = algorithms.filter(a => {
    const matchCat = category === 'all' || a.category === category;
    const q = query.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.paradigm.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeader
        badge="Algorithm Library"
        title="All Algorithms"
        subtitle="Browse 20 implementations with complexity analysis, visualizations, and benchmarks"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            id="algorithm-search"
            type="text"
            placeholder="Search algorithms..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-150 ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:bg-surface-600 hover:text-gray-200 border border-surface-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <Spinner size={24} /> <span className="text-gray-400">Loading algorithms...</span>
        </div>
      ) : error ? (
        <div className="glass p-6 text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-gray-500 text-sm">Start the backend: <code className="code-block inline px-2 py-0.5">uvicorn app.main:app --reload</code></p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No algorithms found" description="Try a different search or filter." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(algo => (
            <Link key={algo.id} to={`/algorithms/${algo.id}`} className="block">
              <Card hover className="p-5 h-full flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white text-base leading-snug">{algo.name}</h3>
                  <Badge variant={PARADIGM_COLORS[algo.paradigm] ?? 'gray'} className="flex-shrink-0 text-xs">
                    {algo.paradigm}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{algo.description}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-600">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Best</div>
                    <ComplexityBadge value={algo.complexity.time_best} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Avg</div>
                    <ComplexityBadge value={algo.complexity.time_avg} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Space</div>
                    <ComplexityBadge value={algo.complexity.space} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary-400 font-medium">
                  <span>View details →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
