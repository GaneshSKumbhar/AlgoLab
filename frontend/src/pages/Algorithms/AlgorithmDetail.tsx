import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitBranch, Clock, HardDrive, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { fetchAlgorithm } from '../../services/api';
import type { AlgorithmMeta } from '../../services/api';
import { Badge, Breadcrumb, ComplexityBadge, Spinner } from '../../components/ui';

const PARADIGM_COLORS: Record<string, 'indigo' | 'green' | 'amber' | 'red' | 'gray'> = {
  'Divide & Conquer': 'indigo',
  'Greedy': 'green',
  'Greedy / Graph': 'green',
  'Dynamic Programming': 'amber',
  'Backtracking': 'red',
};

export default function AlgorithmDetail() {
  const { id } = useParams<{ id: string }>();
  const [algo, setAlgo] = useState<AlgorithmMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAlgorithm(id)
      .then(setAlgo)
      .catch(() => setError('Algorithm not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3">
      <Spinner size={24} /><span className="text-gray-400">Loading...</span>
    </div>
  );

  if (error || !algo) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <p className="text-red-400">{error ?? 'Algorithm not found.'}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumb items={[
        { label: 'Algorithms', href: '/algorithms' },
        { label: algo.name },
      ]} />

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <Badge variant={PARADIGM_COLORS[algo.paradigm] ?? 'gray'} className="mb-2">
            {algo.paradigm}
          </Badge>
          <h1 className="text-3xl font-bold text-white">{algo.name}</h1>
          <p className="text-gray-400 mt-2">{algo.description}</p>
        </div>
        <Link to={`/visualizer/${algo.id}`} className="btn-primary flex-shrink-0">
          <GitBranch size={16} /> Visualize <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Complexity Table */}
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-primary-400" /> Complexity Analysis
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Complexity</h3>
              {[
                { label: 'Best Case', value: algo.complexity.time_best },
                { label: 'Average Case', value: algo.complexity.time_avg },
                { label: 'Worst Case', value: algo.complexity.time_worst },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-surface-700">
                  <span className="text-sm text-gray-400">{label}</span>
                  <ComplexityBadge value={value} />
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Space Complexity</h3>
              <div className="flex items-center gap-3 py-3 bg-surface-700 rounded-lg px-4">
                <HardDrive size={18} className="text-gray-400" />
                <ComplexityBadge value={algo.complexity.space} />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</h3>
                <Badge variant="gray" className="capitalize">{algo.category}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* When to Use */}
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-3">When to Use</h2>
          <p className="text-gray-300 leading-relaxed">{algo.when_to_use}</p>
        </div>

        {/* Advantages & Limitations */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass p-5">
            <h2 className="text-base font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle size={16} /> Advantages
            </h2>
            <ul className="space-y-2">
              {algo.advantages.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span> {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass p-5">
            <h2 className="text-base font-semibold text-rose-400 mb-3 flex items-center gap-2">
              <XCircle size={16} /> Limitations
            </h2>
            <ul className="space-y-2">
              {algo.limitations.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-rose-500 mt-0.5 flex-shrink-0">✗</span> {l}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Related Algorithms */}
        {algo.related.length > 0 && (
          <div className="glass p-5">
            <h2 className="text-base font-semibold text-white mb-3">Related Algorithms</h2>
            <div className="flex flex-wrap gap-2">
              {algo.related.map(r => (
                <Link key={r} to={`/algorithms/${r}`}
                  className="badge badge-indigo hover:bg-primary-700/50 transition-colors cursor-pointer">
                  {r.replace(/_/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-3 flex-wrap">
          <Link to={`/visualizer/${algo.id}`} className="btn-primary">
            <GitBranch size={16} /> Run Visualization
          </Link>
          <Link to="/benchmark" className="btn-secondary">
            Run Benchmark
          </Link>
        </div>
      </div>
    </div>
  );
}
