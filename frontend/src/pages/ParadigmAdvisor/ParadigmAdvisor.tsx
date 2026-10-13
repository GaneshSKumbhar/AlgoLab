import { useState } from 'react';
import { Brain, CheckSquare, Square, ArrowRight, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getRecommendation } from '../../services/api';
import type { AdvisorRequest, AdvisorResponse } from '../../services/api';
import { Badge, SectionHeader, Spinner, Alert } from '../../components/ui';
import { Link } from 'react-router-dom';

// Problem templates for quick-start
const PROBLEM_TEMPLATES: { label: string; desc: string; chars: Partial<AdvisorRequest> }[] = [
  {
    label: 'Shortest Route Between Cities',
    desc: 'Find the cheapest or fastest path through a road network.',
    chars: { is_graph_problem: true, is_weighted_graph: true, needs_shortest_path: true, is_optimization: true, input_size: 'medium' },
  },
  {
    label: 'Travelling Salesman Problem',
    desc: 'Visit all cities exactly once and return to start with minimum cost.',
    chars: { is_graph_problem: true, is_weighted_graph: true, is_tsp_like: true, is_optimization: true, suspected_np_hard: true, input_size: 'small' },
  },
  {
    label: 'Packing Items into a Knapsack',
    desc: 'Maximize value of items while staying within weight capacity.',
    chars: { is_optimization: true, is_knapsack_like: true, has_overlapping_subproblems: true, has_optimal_substructure: true, input_size: 'medium' },
  },
  {
    label: 'Sort a List of Records',
    desc: 'Order a large dataset by a key field efficiently.',
    chars: { is_sorting: true, is_optimization: false, input_size: 'large' },
  },
  {
    label: 'Find Element in Database',
    desc: 'Search for a specific value in a sorted or unsorted dataset.',
    chars: { is_searching: true, input_size: 'large' },
  },
  {
    label: 'Network Maximum Throughput',
    desc: 'Find maximum flow through a network (pipes, traffic, data).',
    chars: { is_graph_problem: true, needs_flow: true, is_weighted_graph: true, is_directed: true, input_size: 'medium' },
  },
  {
    label: 'Schedule Exams Without Conflicts',
    desc: 'Assign exams to time slots such that conflicting exams are separated.',
    chars: { is_scheduling: true, has_constraints: true, needs_exhaustive_search: false, input_size: 'medium' },
  },
  {
    label: 'Assign Workers to Tasks',
    desc: 'Match workers to tasks optimally (bipartite matching).',
    chars: { is_graph_problem: true, is_bipartite: true, is_assignment: true, needs_flow: true, input_size: 'medium' },
  },
  {
    label: 'N-Queens Placement',
    desc: 'Place N queens on a chessboard with no conflicts.',
    chars: { has_constraints: true, needs_exhaustive_search: true, input_size: 'small' },
  },
  {
    label: 'Minimum Spanning Network',
    desc: 'Connect all cities with minimum total cable/road length.',
    chars: { is_graph_problem: true, is_weighted_graph: true, needs_mst: true, is_optimization: true, input_size: 'medium' },
  },
];

const CHARACTERISTICS: { key: keyof AdvisorRequest; label: string; description: string; group: string }[] = [
  // Problem type
  { key: 'is_graph_problem', label: 'Graph Problem', description: 'Involves nodes and edges', group: 'Problem Type' },
  { key: 'is_optimization', label: 'Optimization Problem', description: 'Maximize or minimize an objective', group: 'Problem Type' },
  { key: 'is_sorting', label: 'Sorting Problem', description: 'Need to order a collection', group: 'Problem Type' },
  { key: 'is_searching', label: 'Searching Problem', description: 'Need to find a specific element', group: 'Problem Type' },
  { key: 'is_scheduling', label: 'Scheduling Problem', description: 'Assign tasks to time slots', group: 'Problem Type' },
  { key: 'is_string_problem', label: 'String Problem', description: 'Comparing, aligning, or transforming strings', group: 'Problem Type' },
  // Structure
  { key: 'has_overlapping_subproblems', label: 'Overlapping Subproblems', description: 'Same subproblems solved repeatedly', group: 'Structure' },
  { key: 'has_optimal_substructure', label: 'Optimal Substructure', description: 'Optimal solution built from subproblems', group: 'Structure' },
  { key: 'has_greedy_choice_property', label: 'Greedy Choice Property', description: 'Local optimal choice leads to global optimum', group: 'Structure' },
  { key: 'needs_exhaustive_search', label: 'Requires Exhaustive Search', description: 'Must explore all possibilities', group: 'Structure' },
  { key: 'has_constraints', label: 'Hard Constraints', description: 'Solutions must satisfy strict constraints', group: 'Structure' },
  // Graph properties
  { key: 'is_weighted_graph', label: 'Weighted Graph', description: 'Edges have weights/costs', group: 'Graph' },
  { key: 'has_negative_weights', label: 'Negative Edge Weights', description: 'Some edge weights may be negative', group: 'Graph' },
  { key: 'is_directed', label: 'Directed Graph', description: 'Edges are one-directional', group: 'Graph' },
  { key: 'is_dag', label: 'DAG (Directed Acyclic)', description: 'Directed graph with no cycles', group: 'Graph' },
  { key: 'is_bipartite', label: 'Bipartite Graph', description: 'Nodes split into two disjoint sets', group: 'Graph' },
  { key: 'needs_shortest_path', label: 'Shortest Path Needed', description: 'Find minimum cost path between nodes', group: 'Graph' },
  { key: 'needs_mst', label: 'Minimum Spanning Tree', description: 'Connect all nodes with minimum total cost', group: 'Graph' },
  { key: 'needs_flow', label: 'Network Flow', description: 'Find maximum flow through the network', group: 'Graph' },
  { key: 'needs_traversal', label: 'Graph Traversal', description: 'Visit all or certain nodes', group: 'Graph' },
  { key: 'needs_topological_order', label: 'Topological Ordering', description: 'Order nodes respecting dependencies', group: 'Graph' },
  // Special
  { key: 'is_tsp_like', label: 'TSP-like', description: 'Visit all nodes in a tour with minimum cost', group: 'Special' },
  { key: 'is_knapsack_like', label: 'Knapsack-like', description: 'Select items to maximize value within constraint', group: 'Special' },
  { key: 'is_assignment', label: 'Assignment Problem', description: 'Match items from two sets optimally', group: 'Special' },
  { key: 'suspected_np_hard', label: 'Suspected NP-Hard', description: 'No known polynomial-time exact solution', group: 'Special' },
  { key: 'needs_exact_solution', label: 'Exact Solution Required', description: 'Approximations are not acceptable', group: 'Special' },
];

const INPUT_SIZES = ['tiny', 'small', 'medium', 'large', 'huge'];

const paradigmColors: Record<string, 'indigo' | 'green' | 'amber' | 'red' | 'gray'> = {
  'Dynamic Programming': 'amber',
  'Greedy': 'green',
  'Divide & Conquer': 'indigo',
  'Backtracking': 'red',
  'Graph Traversal': 'indigo',
  'Network Flow': 'indigo',
  'Brute Force': 'gray',
  'Approximation': 'amber',
};

const ALGO_VISUALIZER_MAP: Record<string, string> = {
  dijkstra: 'dijkstra', bellman_ford: 'bellman_ford', bfs: 'bfs', dfs: 'dfs',
  topological_sort: 'topological_sort', kruskal: 'kruskal', prim: 'prim',
  merge_sort: 'merge_sort', quick_sort: 'quick_sort', binary_search: 'binary_search',
  linear_search: 'linear_search', knapsack_01: 'knapsack_01', lcs: 'lcs',
  coin_change: 'coin_change', floyd_warshall: 'floyd_warshall', n_queens: 'n_queens',
  activity_selection: 'activity_selection', huffman: 'huffman', fractional_knapsack: 'fractional_knapsack',
};

export default function ParadigmAdvisor() {
  const [chars, setChars] = useState<AdvisorRequest>({ input_size: 'medium', needs_exact_solution: true });
  const [response, setResponse] = useState<AdvisorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Problem Type');

  const toggle = (key: keyof AdvisorRequest) => setChars(c => ({ ...c, [key]: !c[key] }));

  const applyTemplate = (t: typeof PROBLEM_TEMPLATES[0]) => {
    setChars({ input_size: 'medium', needs_exact_solution: true, ...t.chars });
    setResponse(null);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getRecommendation(chars);
      setResponse(res);
    } catch (e: any) {
      setError(e.message ?? 'Failed to get recommendation. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const groups = [...new Set(CHARACTERISTICS.map(c => c.group))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeader
        badge="Rule-Based Recommendation"
        title="Paradigm Advisor"
        subtitle="Describe your problem characteristics. Our explainable rule engine recommends the best algorithmic paradigms and algorithms — no AI, no black box."
      />

      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        {/* ── Left: Input ── */}
        <div className="space-y-4">
          {/* Templates */}
          <div className="glass p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary-400" />
              Quick Start — Try an Example Problem
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {PROBLEM_TEMPLATES.map(t => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t)}
                  className="text-left px-3 py-2.5 rounded-lg bg-surface-700 hover:bg-surface-600 border border-surface-600 hover:border-primary-600/40 transition-all text-sm"
                >
                  <div className="font-medium text-white text-xs mb-0.5">{t.label}</div>
                  <div className="text-gray-500 text-xs leading-snug">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Characteristics */}
          <div className="glass p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Problem Characteristics</h2>

            {/* Input size */}
            <div className="mb-5">
              <label className="text-xs text-gray-400 block mb-2">Input Size</label>
              <div className="flex gap-2 flex-wrap">
                {INPUT_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setChars(c => ({ ...c, input_size: s }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      chars.input_size === s
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-700 text-gray-400 hover:bg-surface-600 border border-surface-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {chars.input_size === 'tiny' && 'n < 10'} {chars.input_size === 'small' && 'n < 50'}
                {chars.input_size === 'medium' && '50 < n < 1000'} {chars.input_size === 'large' && 'n > 1000'}
                {chars.input_size === 'huge' && 'n > 100,000+'}
              </div>
            </div>

            {/* Grouped toggles */}
            {groups.map(groupName => {
              const groupChars = CHARACTERISTICS.filter(c => c.group === groupName);
              const isOpen = expandedGroup === groupName;
              const activeCount = groupChars.filter(c => chars[c.key]).length;
              return (
                <div key={groupName} className="border border-surface-600 rounded-xl mb-3 overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-200 hover:bg-surface-700 transition-colors"
                    onClick={() => setExpandedGroup(isOpen ? null : groupName)}
                  >
                    <span className="flex items-center gap-2">
                      {groupName}
                      {activeCount > 0 && (
                        <span className="badge badge-indigo text-xs">{activeCount} active</span>
                      )}
                    </span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 space-y-2 border-t border-surface-600">
                      {groupChars.map(({ key, label, description }) => {
                        const active = !!chars[key];
                        return (
                          <label key={key} className="flex items-start gap-3 cursor-pointer py-1.5">
                            <button
                              onClick={() => toggle(key)}
                              className={`mt-0.5 flex-shrink-0 transition-colors ${active ? 'text-primary-400' : 'text-gray-600'}`}
                            >
                              {active ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                            <div>
                              <div className="text-sm text-gray-200 font-medium">{label}</div>
                              <div className="text-xs text-gray-500">{description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            id="advisor-submit"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {loading ? <Spinner size={18} /> : <Brain size={18} />}
            {loading ? 'Analyzing...' : 'Get Recommendation'}
          </button>

          {error && <Alert type="error">{error}</Alert>}
        </div>

        {/* ── Right: Results ── */}
        <div className="space-y-4">
          {!response && !loading && (
            <div className="glass p-12 text-center">
              <Brain size={40} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Your Recommendation</h3>
              <p className="text-gray-400 text-sm">
                Select a template or manually check characteristics, then click <strong className="text-white">Get Recommendation</strong>.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass p-16 flex flex-col items-center gap-3">
              <Spinner size={32} />
              <p className="text-gray-400">Analyzing problem characteristics...</p>
            </div>
          )}

          {response && (
            <>
              {/* Top Paradigm */}
              {response.top_paradigm && (
                <div className="glass p-5 border border-primary-700/40 bg-primary-900/20">
                  <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-2">Primary Recommendation</p>
                  <div className="flex items-center gap-3 mb-3">
                    <Brain size={24} className="text-primary-400" />
                    <span className="text-xl font-bold text-white">{response.top_paradigm}</span>
                    <Badge variant={paradigmColors[response.top_paradigm] ?? 'indigo'}>{response.top_paradigm}</Badge>
                  </div>
                  <div className="prose prose-sm text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {response.explanation}
                  </div>
                </div>
              )}

              {/* Paradigm Scores */}
              <div className="glass p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Paradigm Scores</h3>
                <div className="space-y-3">
                  {response.paradigm_scores.map(p => {
                    const maxScore = response.paradigm_scores[0]?.score ?? 1;
                    const pct = Math.max(0, (p.score / (maxScore || 1)) * 100);
                    return (
                      <div key={p.paradigm}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={paradigmColors[p.paradigm] ?? 'gray'} className="text-xs">{p.paradigm}</Badge>
                          </div>
                          <span className="text-xs font-mono text-gray-400">{p.score.toFixed(1)} pts</span>
                        </div>
                        <div className="w-full bg-surface-700 rounded-full h-1.5">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {p.reasons.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">{p.reasons[0]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Algorithm Recommendations */}
              <div className="glass p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Recommended Algorithms</h3>
                <div className="space-y-3">
                  {response.algorithm_recommendations.map((a, i) => (
                    <div key={a.algorithm_id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                      i === 0 ? 'border-primary-600/40 bg-primary-900/20' : 'border-surface-600 bg-surface-700/50'
                    }`}>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-600 flex items-center justify-center text-xs font-bold text-gray-300">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-white">{a.name}</span>
                          <Badge variant={paradigmColors[a.paradigm] ?? 'gray'} className="text-xs">{a.paradigm}</Badge>
                          <span className="font-mono text-xs text-gray-400">{a.complexity}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{a.reason}</p>
                      </div>
                      {ALGO_VISUALIZER_MAP[a.algorithm_id] && (
                        <Link
                          to={`/visualizer/${a.algorithm_id}`}
                          className="btn-secondary text-xs flex-shrink-0 py-1.5"
                        >
                          Visualize <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
