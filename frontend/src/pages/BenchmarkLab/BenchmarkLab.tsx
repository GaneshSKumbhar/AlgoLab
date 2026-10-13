import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Clock, Hash, BarChart3 } from 'lucide-react';
import { runBenchmark } from '../../services/api';
import type { BenchmarkResult } from '../../services/api';
import { Badge, SectionHeader, Spinner, Alert, Tabs } from '../../components/ui';

const ALGO_GROUPS = {
  sorting: {
    label: 'Sorting',
    algorithms: [
      { id: 'merge_sort', name: 'Merge Sort', color: '#6366f1' },
      { id: 'quick_sort', name: 'Quick Sort', color: '#10b981' },
      { id: 'randomized_quick_sort', name: 'Randomized Quick Sort', color: '#f59e0b' },
    ],
    sizes: [10, 20, 50, 100, 200, 500, 1000],
  },
  graph: {
    label: 'Graph',
    algorithms: [
      { id: 'bfs', name: 'BFS', color: '#6366f1' },
      { id: 'dfs', name: 'DFS', color: '#10b981' },
      { id: 'dijkstra', name: 'Dijkstra', color: '#f59e0b' },
      { id: 'bellman_ford', name: 'Bellman-Ford', color: '#ef4444' },
    ],
    sizes: [5, 10, 20, 50, 100],
  },
  dp: {
    label: 'Dynamic Programming',
    algorithms: [
      { id: 'knapsack_01', name: '0/1 Knapsack', color: '#6366f1' },
      { id: 'lcs', name: 'LCS', color: '#10b981' },
    ],
    sizes: [5, 10, 20, 50, 100],
  },
};

type GroupKey = keyof typeof ALGO_GROUPS;

const COLORS: Record<string, string> = Object.values(ALGO_GROUPS)
  .flatMap(g => g.algorithms)
  .reduce((acc, a) => ({ ...acc, [a.id]: a.color }), {});

const NAMES: Record<string, string> = Object.values(ALGO_GROUPS)
  .flatMap(g => g.algorithms)
  .reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {});

export default function BenchmarkLab() {
  const [group, setGroup] = useState<GroupKey>('sorting');
  const [selected, setSelected] = useState<string[]>(['merge_sort', 'quick_sort']);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<'avg_operations' | 'avg_time_ms'>('avg_operations');

  const cfg = ALGO_GROUPS[group];

  const toggleAlgo = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleRun = async () => {
    if (!selected.length) return;
    setLoading(true); setError(null);
    try {
      const res = await runBenchmark({
        algorithms: selected,
        input_sizes: cfg.sizes,
        category: group,
        trials: 3,
      });
      setResults(res.results);
    } catch (e: any) {
      setError(e.message ?? 'Benchmark failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Build recharts data
  const chartData = cfg.sizes.map(n => {
    const point: Record<string, unknown> = { n };
    results.forEach(r => {
      if (selected.includes(r.algorithm_id)) {
        const sizeData = r.sizes.find(s => s.n === n);
        if (sizeData) {
          point[r.algorithm_id] = Number(sizeData[metric].toFixed(4));
        }
      }
    });
    return point;
  });

  const hasData = results.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeader
        badge="Empirical Benchmarking"
        title="Benchmark Lab"
        subtitle="Measure real operation counts and runtime on increasing input sizes. All data from actual execution — no fabricated numbers."
      />

      <div className="glass p-4 mb-4 border border-amber-700/30 bg-amber-900/10">
        <p className="text-amber-300 text-sm">
          <strong>Note:</strong> Operation counts are machine-independent and mathematically meaningful.
          Wall-clock times depend on your hardware and system load.
        </p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* ── Config panel ── */}
        <div className="space-y-4">
          <div className="glass p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Algorithm Category</h3>
            <div className="space-y-1">
              {(Object.keys(ALGO_GROUPS) as GroupKey[]).map(k => (
                <button
                  key={k}
                  onClick={() => { setGroup(k); setSelected(ALGO_GROUPS[k].algorithms.slice(0, 2).map(a => a.id)); setResults([]); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    group === k ? 'bg-primary-600/20 text-primary-300 border border-primary-600/30' : 'text-gray-400 hover:bg-surface-700'
                  }`}
                >
                  {ALGO_GROUPS[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Select Algorithms</h3>
            <div className="space-y-2">
              {cfg.algorithms.map(a => (
                <label key={a.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.id)}
                    onChange={() => toggleAlgo(a.id)}
                    className="accent-primary-500"
                  />
                  <span className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: a.color }} />
                    {a.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="glass p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Input Sizes</h3>
            <div className="flex flex-wrap gap-1">
              {cfg.sizes.map(n => (
                <Badge key={n} variant="gray" className="font-mono text-xs">n={n}</Badge>
              ))}
            </div>
          </div>

          <button
            id="run-benchmark"
            onClick={handleRun}
            disabled={loading || selected.length === 0}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? <Spinner size={16} /> : <Play size={16} />}
            {loading ? 'Benchmarking...' : 'Run Benchmark'}
          </button>

          {error && <Alert type="error">{error}</Alert>}
        </div>

        {/* ── Charts panel ── */}
        <div className="space-y-4">
          {hasData && (
            <Tabs
              tabs={[
                { id: 'avg_operations', label: 'Operations', icon: Hash },
                { id: 'avg_time_ms', label: 'Time (ms)', icon: Clock },
              ]}
              active={metric}
              onChange={v => setMetric(v as any)}
            />
          )}

          {loading ? (
            <div className="glass p-20 flex flex-col items-center gap-4">
              <Spinner size={36} />
              <p className="text-gray-400">Running benchmarks on real inputs...</p>
              <p className="text-gray-500 text-sm">This may take a few seconds.</p>
            </div>
          ) : hasData ? (
            <>
              <div className="glass p-6">
                <h3 className="text-base font-semibold text-white mb-1">
                  {metric === 'avg_operations' ? 'Operations Count vs Input Size' : 'Runtime (ms) vs Input Size'}
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                  {metric === 'avg_operations'
                    ? 'Machine-independent — counts actual algorithm operations (comparisons, swaps, visits, etc.)'
                    : 'Wall-clock time in milliseconds (average of 3 trials)'}
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" />
                    <XAxis dataKey="n" tick={{ fill: '#9ca3af', fontSize: 12 }} label={{ value: 'n (input size)', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2e2e42', borderRadius: '8px' }}
                      labelStyle={{ color: '#f0f0ff' }}
                      itemStyle={{ color: '#d1d5db' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }} formatter={v => NAMES[v] ?? v} />
                    {selected.map(id => (
                      <Bar key={id} dataKey={id} name={NAMES[id]} fill={COLORS[id] ?? '#6366f1'} radius={[3, 3, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary table */}
              <div className="glass p-4 overflow-auto">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Summary Table</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-600">
                      <th className="text-left py-2 text-gray-400 font-medium">Algorithm</th>
                      {cfg.sizes.map(n => (
                        <th key={n} className="text-right py-2 text-gray-400 font-medium font-mono">n={n}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.filter(r => selected.includes(r.algorithm_id)).map(r => (
                      <tr key={r.algorithm_id} className="border-b border-surface-700">
                        <td className="py-2 font-medium" style={{ color: COLORS[r.algorithm_id] }}>
                          {NAMES[r.algorithm_id] ?? r.algorithm_id}
                        </td>
                        {cfg.sizes.map(n => {
                          const sizeData = r.sizes.find(s => s.n === n);
                          const val = sizeData ? sizeData[metric] : null;
                          return (
                            <td key={n} className="py-2 text-right font-mono text-gray-300 text-xs">
                              {val !== null ? (metric === 'avg_time_ms' ? `${val.toFixed(3)}ms` : Math.round(val as number).toLocaleString()) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="glass p-16 flex flex-col items-center gap-4 text-center">
              <BarChart3 size={40} className="text-gray-600" />
              <div>
                <h3 className="text-white font-semibold mb-1">Ready to Benchmark</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Select algorithms from the left panel and click <strong className="text-white">Run Benchmark</strong>.
                  All measurements come from real algorithm execution.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
