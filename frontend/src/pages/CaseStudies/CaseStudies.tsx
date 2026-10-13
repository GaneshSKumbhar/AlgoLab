import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Calendar, FileArchive, UserCheck, ArrowRight,
  Play, TrendingUp, Hash
} from 'lucide-react';
import { Badge, SectionHeader } from '../../components/ui';

const CASE_STUDIES = [
  {
    id: 'delivery',
    icon: MapPin,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-900/30',
    title: 'Smart Delivery Routing',
    subtitle: 'TSP / Shortest Path',
    problem: 'Find an efficient route for delivering packages to multiple cities, minimizing total distance.',
    paradigms: ['Dynamic Programming', 'Greedy', 'Approximation'],
    algorithms: [
      { name: 'Brute Force', complexity: 'O(n!)', quality: 'Optimal', note: 'Only feasible for n ≤ 12' },
      { name: 'Dijkstra (Pairwise)', complexity: 'O(n² log n)', quality: 'Exact pairs', note: 'Shortest between each pair' },
      { name: 'Greedy (Nearest Neighbor)', complexity: 'O(n²)', quality: '~25% suboptimal', note: 'Fast heuristic' },
    ],
    insight: 'For small n (≤ 12), DP (Held-Karp) gives an exact O(2ⁿn²) solution. For large n, use greedy heuristics or approximation algorithms.',
    visualizerAlgo: 'dijkstra',
  },
  {
    id: 'timetabling',
    icon: Calendar,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-900/30',
    title: 'Exam Timetabling',
    subtitle: 'Graph Coloring / Scheduling',
    problem: 'Assign exams to time slots such that no student has two exams at the same time (no conflicts).',
    paradigms: ['Greedy', 'Backtracking'],
    algorithms: [
      { name: 'Greedy Coloring', complexity: 'O(V + E)', quality: 'Near-optimal', note: 'Fast, good in practice' },
      { name: 'Backtracking', complexity: 'O(k^V)', quality: 'Optimal', note: 'Finds minimum chromatic number' },
    ],
    insight: 'Model exams as nodes and conflicts as edges. Graph coloring assigns colors (time slots). Greedy works well; backtracking finds the true minimum.',
    visualizerAlgo: 'dfs',
  },
  {
    id: 'compression',
    icon: FileArchive,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-900/30',
    title: 'File Compression',
    subtitle: 'Huffman Coding',
    problem: 'Compress a file to reduce storage without losing any information (lossless compression).',
    paradigms: ['Greedy'],
    algorithms: [
      { name: 'Huffman Coding', complexity: 'O(n log n)', quality: 'Optimal prefix-free', note: 'Used in ZIP, JPEG, MP3' },
    ],
    insight: 'Huffman greedily assigns shorter codes to more frequent characters. Mathematically proven to produce the optimal prefix-free code for a given frequency distribution.',
    visualizerAlgo: 'huffman',
  },
  {
    id: 'assignment',
    icon: UserCheck,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-900/30',
    title: 'Task Assignment',
    subtitle: 'Bipartite Matching / Max-Flow',
    problem: 'Assign workers to tasks efficiently, maximizing the number of task-worker pairs.',
    paradigms: ['Network Flow'],
    algorithms: [
      { name: 'Bipartite Matching (via Max-Flow)', complexity: 'O(V·E)', quality: 'Optimal', note: 'Uses Edmonds-Karp' },
      { name: 'Greedy Assignment', complexity: 'O(n²)', quality: 'Suboptimal', note: 'Simple but may miss optimal' },
    ],
    insight: 'Reduce to maximum bipartite matching. Add source/sink, run max-flow. Optimal matching found in polynomial time.',
    visualizerAlgo: 'bfs',
  },
];

export default function CaseStudies() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeader
        badge="Real-World Applications"
        title="Case Studies"
        subtitle="See how DAA paradigms apply to real-world problems — with complexity comparison and algorithm selection rationale."
      />

      <div className="space-y-6">
        {CASE_STUDIES.map(cs => {
          const Icon = cs.icon;
          const isOpen = active === cs.id;
          return (
            <div key={cs.id} className="glass overflow-hidden">
              <button
                className="w-full text-left px-6 py-5 flex items-center gap-4 hover:bg-surface-700/30 transition-colors"
                onClick={() => setActive(isOpen ? null : cs.id)}
              >
                <div className={`w-12 h-12 rounded-xl ${cs.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={24} className={cs.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-lg font-bold text-white">{cs.title}</h2>
                    <Badge variant="gray">{cs.subtitle}</Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{cs.problem}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex gap-2 flex-wrap">
                    {cs.paradigms.map(p => (
                      <Badge key={p} variant="indigo" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                  <span className="text-gray-400 text-lg">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-surface-600 px-6 py-6 animate-fade-in">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Algorithm Comparison */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary-400" /> Algorithm Comparison
                      </h3>
                      <div className="space-y-3">
                        {cs.algorithms.map((a, i) => (
                          <div key={i} className={`p-4 rounded-xl border ${
                            i === 0 ? 'border-primary-600/40 bg-primary-900/20' : 'border-surface-600 bg-surface-700/50'
                          }`}>
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                              <span className="font-semibold text-white text-sm">{a.name}</span>
                              <div className="flex gap-2">
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-600 text-gray-300">{a.complexity}</span>
                                <Badge variant="green" className="text-xs">{a.quality}</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400">{a.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insight & Actions */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <Hash size={16} className="text-emerald-400" /> Key Insight
                        </h3>
                        <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4">
                          <p className="text-emerald-200 text-sm leading-relaxed">{cs.insight}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Link
                          to={`/visualizer/${cs.visualizerAlgo}`}
                          className="btn-primary justify-center"
                        >
                          <Play size={16} /> Visualize Core Algorithm
                        </Link>
                        <Link
                          to="/advisor"
                          className="btn-secondary justify-center"
                        >
                          Analyze with Paradigm Advisor <ArrowRight size={14} />
                        </Link>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Applicable Paradigms</h3>
                        <div className="flex flex-wrap gap-2">
                          {cs.paradigms.map(p => (
                            <Badge key={p} variant="indigo">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 glass p-8 text-center border border-primary-700/30 bg-primary-900/10">
        <h2 className="text-xl font-bold text-white mb-2">Have a different problem?</h2>
        <p className="text-gray-400 mb-4">Use the Paradigm Advisor to analyze your specific problem and get tailored algorithm recommendations.</p>
        <Link to="/advisor" className="btn-primary px-8 py-3 text-base">
          Open Paradigm Advisor <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
