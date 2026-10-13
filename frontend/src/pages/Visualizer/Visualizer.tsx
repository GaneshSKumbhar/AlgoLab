import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, SkipBack, SkipForward, RefreshCw,
  ChevronLeft, ChevronRight, Gauge, List, GitBranch
} from 'lucide-react';
import {
  visualizeSort, visualizeGraph, visualizeDP,
  visualizeBacktrack, visualizeGreedy
} from '../../services/api';
import type { TraceEvent } from '../../services/api';
import { Badge, Spinner, Tabs, MetricCard, Alert } from '../../components/ui';
import { clsx } from '../../utils/clsx';

// ── Algorithm config registry ──────────────────────────────────────────────────
const ALGO_CONFIG: Record<string, {
  name: string; category: string; inputType: string; paradigm: string;
  defaultInput: Record<string, unknown>;
}> = {
  merge_sort: { name: 'Merge Sort', category: 'sorting', inputType: 'array', paradigm: 'Divide & Conquer', defaultInput: { array: [38, 27, 43, 3, 9, 82, 10] } },
  quick_sort: { name: 'Quick Sort', category: 'sorting', inputType: 'array', paradigm: 'Divide & Conquer', defaultInput: { array: [10, 7, 8, 9, 1, 5] } },
  randomized_quick_sort: { name: 'Randomized Quick Sort', category: 'sorting', inputType: 'array', paradigm: 'Randomized', defaultInput: { array: [10, 7, 8, 9, 1, 5] } },
  binary_search: { name: 'Binary Search', category: 'search', inputType: 'array_target', paradigm: 'Divide & Conquer', defaultInput: { array: [2, 3, 4, 10, 40], target: 10 } },
  linear_search: { name: 'Linear Search', category: 'search', inputType: 'array_target', paradigm: 'Brute Force', defaultInput: { array: [10, 20, 30, 40, 50], target: 30 } },
  bfs: { name: 'BFS', category: 'graph', inputType: 'graph', paradigm: 'Graph Traversal', defaultInput: { nodes: ['A','B','C','D','E'], adjacency: { A:['B','C'], B:['A','D','E'], C:['A','F'], D:['B'], E:['B','F'], F:['C','E'] }, start: 'A' } },
  dfs: { name: 'DFS', category: 'graph', inputType: 'graph', paradigm: 'Graph Traversal', defaultInput: { nodes: ['A','B','C','D','E'], adjacency: { A:['B','C'], B:['A','D','E'], C:['A','F'], D:['B'], E:['B','F'], F:['C','E'] }, start: 'A' } },
  topological_sort: { name: 'Topological Sort', category: 'graph', inputType: 'dag', paradigm: 'Graph Traversal', defaultInput: { nodes: ['A','B','C','D','E','F'], adjacency: { A:['C'], B:['C','D'], C:['E'], D:['F'], E:['F'], F:[] }, start: 'A' } },
  dijkstra: { name: 'Dijkstra', category: 'graph', inputType: 'graph_weighted', paradigm: 'Greedy', defaultInput: { nodes:['A','B','C','D','E'], edges:[['A','B',4],['A','C',2],['B','C',1],['B','D',5],['C','D',8],['C','E',10],['D','E',2]], start:'A', end:'E' } },
  bellman_ford: { name: 'Bellman-Ford', category: 'graph', inputType: 'graph_weighted', paradigm: 'Dynamic Programming', defaultInput: { nodes:['A','B','C','D'], edges:[['A','B',1],['B','C',2],['A','C',10],['C','D',-1]], start:'A' } },
  kruskal: { name: 'Kruskal', category: 'graph', inputType: 'graph_weighted', paradigm: 'Greedy', defaultInput: { nodes:['A','B','C','D','E'], edges:[['A','B',2],['A','C',3],['B','C',1],['B','D',4],['C','D',5],['D','E',1]] } },
  prim: { name: "Prim's MST", category: 'graph', inputType: 'graph_weighted', paradigm: 'Greedy', defaultInput: { nodes:['A','B','C','D','E'], edges:[['A','B',2],['A','C',3],['B','C',1],['B','D',4],['C','D',5],['D','E',1]], start:'A' } },
  knapsack_01: { name: '0/1 Knapsack', category: 'dp', inputType: 'knapsack', paradigm: 'Dynamic Programming', defaultInput: { weights:[2,3,4,5], values:[3,4,5,6], capacity:5 } },
  lcs: { name: 'LCS', category: 'dp', inputType: 'strings', paradigm: 'Dynamic Programming', defaultInput: { string1:'ABCBDAB', string2:'BDCABA' } },
  coin_change: { name: 'Coin Change', category: 'dp', inputType: 'coins', paradigm: 'Dynamic Programming', defaultInput: { coins:[1,5,10,25], amount:36 } },
  floyd_warshall: { name: 'Floyd-Warshall', category: 'dp', inputType: 'graph_weighted', paradigm: 'Dynamic Programming', defaultInput: { nodes:['A','B','C','D'], edges:[['A','B',3],['B','C',2],['A','C',10],['C','D',1]] } },
  n_queens: { name: 'N-Queens', category: 'backtracking', inputType: 'n_val', paradigm: 'Backtracking', defaultInput: { n: 6, max_solutions: 5 } },
  activity_selection: { name: 'Activity Selection', category: 'greedy', inputType: 'activities', paradigm: 'Greedy', defaultInput: { activities:[[1,4,'A'],[3,5,'B'],[0,6,'C'],[5,7,'D'],[3,9,'E'],[5,9,'F'],[6,10,'G'],[8,11,'H']] } },
  huffman: { name: 'Huffman Coding', category: 'greedy', inputType: 'text', paradigm: 'Greedy', defaultInput: { text:'abracadabra' } },
  fractional_knapsack: { name: 'Fractional Knapsack', category: 'greedy', inputType: 'knapsack', paradigm: 'Greedy', defaultInput: { weights:[10,20,30], values:[60,100,120], capacity:50 } },
};

// ── Execute on backend ─────────────────────────────────────────────────────────
async function executeAlgorithm(id: string, input: Record<string, unknown>) {
  const cfg = ALGO_CONFIG[id];
  if (!cfg) throw new Error(`Unknown algorithm: ${id}`);

  const cat = cfg.category;
  if (cat === 'sorting' || cat === 'search') {
    return visualizeSort({ algorithm: id, ...(input as any) });
  } else if (cat === 'graph') {
    return visualizeGraph({ algorithm: id, nodes: [], edges: [], adjacency: {}, start: '', ...(input as any) });
  } else if (cat === 'dp') {
    return visualizeDP({ algorithm: id, ...(input as any) });
  } else if (cat === 'backtracking') {
    return visualizeBacktrack({ algorithm: id, n: 8, ...(input as any) });
  } else if (cat === 'greedy') {
    return visualizeGreedy({ algorithm: id, ...(input as any) });
  }
  throw new Error(`No executor for category: ${cat}`);
}

// ── Event type → color ─────────────────────────────────────────────────────────
const eventColors: Record<string, string> = {
  comparison: '#f59e0b',
  swap: '#ef4444',
  visit: '#6366f1',
  relaxation: '#10b981',
  dp_update: '#8b5cf6',
  solution_found: '#10b981',
  backtrack: '#ef4444',
  include: '#10b981',
  exclude: '#6b7280',
  edge_selected: '#10b981',
  edge_rejected: '#ef4444',
  pivot_set: '#f97316',
  mark_sorted: '#10b981',
  enqueue: '#6366f1',
  dequeue: '#a78bfa',
  selection: '#06b6d4',
  initialize: '#6366f1',
  complete: '#10b981',
};

export default function Visualizer() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [algoId, setAlgoId] = useState(id ?? 'merge_sort');
  const [input, setInput] = useState<Record<string, unknown>>({});
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(60); // ms per animation tick
  const [activeTab, setActiveTab] = useState('visualizer');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cfg = ALGO_CONFIG[algoId] ?? ALGO_CONFIG['merge_sort'];
  const currentEvent = events[step] ?? null;
  const stepsPerTick = Math.max(1, Math.ceil(events.length / 300));

  // Sync URL param
  useEffect(() => {
    if (id && ALGO_CONFIG[id]) {
      setAlgoId(id);
      setInput(ALGO_CONFIG[id].defaultInput);
      setEvents([]); setStep(0); setPlaying(false);
    }
  }, [id]);

  useEffect(() => {
    setInput(cfg.defaultInput);
  }, [algoId]);

  // Play/pause logic
  useEffect(() => {
    if (playing && events.length > 0) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s >= events.length - 1) { setPlaying(false); return s; }
          return Math.min(events.length - 1, s + stepsPerTick);
        });
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, events.length, stepsPerTick]);

  const run = useCallback(async () => {
    setLoading(true); setError(null); setPlaying(false); setStep(0);
    try {
      const res = await executeAlgorithm(algoId, input);
      if (!res.success) throw new Error(res.error ?? 'Execution failed');
      setEvents(res.events);
      setMetrics(res.metrics);
      setResult(res.result);
    } catch (e: any) {
      setError(e.message ?? 'Backend error');
    } finally {
      setLoading(false);
    }
  }, [algoId, input]);

  const handleAlgoChange = (newId: string) => {
    setAlgoId(newId);
    setEvents([]); setStep(0); setPlaying(false); setError(null);
    navigate(`/visualizer/${newId}`, { replace: true });
  };

  const progress = events.length > 0 ? ((step + 1) / events.length) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest mb-1">Algorithm Visualizer</p>
          <h1 className="text-2xl font-bold text-white">{cfg.name}</h1>
        </div>
        <Badge variant="indigo">{cfg.paradigm}</Badge>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* ── Left panel: Algorithm picker + Input ── */}
        <div className="space-y-4">
          {/* Algorithm selector */}
          <div className="glass p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Select Algorithm</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {Object.entries(ALGO_CONFIG).map(([key, { name, paradigm }]) => (
                <button
                  key={key}
                  onClick={() => handleAlgoChange(key)}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    algoId === key
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-600/40'
                      : 'text-gray-400 hover:bg-surface-700 hover:text-gray-200'
                  )}
                >
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-gray-500">{paradigm}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Input editor */}
          <div className="glass p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Input Configuration</h3>
            <p className="text-xs text-gray-500 mb-3">Enter your own test case below. Interactive traces are limited to safe sizes so results stay fast.</p>
            <InputEditor algoId={algoId} input={input} onChange={setInput} />
          </div>

          {/* Run button */}
          <button
            id="run-visualizer"
            onClick={run}
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? <Spinner size={16} /> : <Play size={16} />}
            {loading ? 'Running your input...' : 'Run My Input'}
          </button>

          {error && <Alert type="error">{error}</Alert>}
        </div>

        {/* ── Right panel: Visualization + Controls ── */}
        <div className="space-y-4">
          <Tabs
            tabs={[
              { id: 'visualizer', label: 'Visualizer', icon: GitBranchIcon },
              { id: 'trace', label: 'Event Trace', icon: List },
              { id: 'metrics', label: 'Metrics', icon: Gauge },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === 'visualizer' && (
            <div className="space-y-4">
              <VisualizationCanvas
                algoId={algoId}
                events={events}
                step={step}
                cfg={cfg}
              />

              {events.length > 0 && (
                <div className="glass p-4 space-y-3">
                  {/* Progress */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">Step</span>
                    <span className="text-white font-mono font-bold">{step + 1}</span>
                    <span className="text-gray-500">/ {events.length}</span>
                    <div className="flex-1 bg-surface-700 rounded-full h-1.5 ml-2">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Event message */}
                  {currentEvent && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-surface-700 border border-surface-600">
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: eventColors[currentEvent.type] ?? '#6366f1' }}
                      />
                      <div>
                        <span className="text-xs text-gray-500 font-mono">[{currentEvent.type}]</span>
                        <p className="text-sm text-gray-200 leading-relaxed">{currentEvent.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center gap-2 justify-center">
                    <button className="btn-icon" onClick={() => { setPlaying(false); setStep(0); }} title="Restart">
                      <SkipBack size={16} />
                    </button>
                    <button className="btn-icon" onClick={() => setStep(s => Math.max(0, s - 1))} title="Previous">
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      className="btn-primary px-5"
                      onClick={() => setPlaying(p => !p)}
                    >
                      {playing ? <Pause size={16} /> : <Play size={16} />}
                      {playing ? 'Pause' : 'Play'}
                    </button>
                    <button className="btn-icon" onClick={() => setStep(s => Math.min(events.length - 1, s + 1))} title="Next">
                      <ChevronRight size={16} />
                    </button>
                    <button className="btn-icon" onClick={() => { setPlaying(false); setStep(events.length - 1); }} title="End">
                      <SkipForward size={16} />
                    </button>
                  </div>

                  {/* Speed */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Playback</span>
                    <input
                      type="range"
                      min={20} max={500} step={20}
                      value={520 - speed}
                      onChange={e => setSpeed(520 - Number(e.target.value))}
                      className="flex-1 accent-primary-500"
                    />
                    <span className="text-xs text-gray-400 w-20 text-right">{stepsPerTick} step/tick</span>
                  </div>
                </div>
              )}

              {events.length === 0 && !loading && (
                <div className="glass p-10 text-center">
                  <Play size={32} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Configure your test case and click <strong className="text-white">Run My Input</strong> to start visualization.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trace' && (
            <TracePanel events={events} currentStep={step} onJump={setStep} />
          )}

          {activeTab === 'metrics' && (
            <MetricsPanel metrics={metrics} result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Visualization Canvas ───────────────────────────────────────────────────────
function VisualizationCanvas({ algoId, events, step, cfg }: {
  algoId: string; events: TraceEvent[]; step: number; cfg: typeof ALGO_CONFIG[string];
}) {
  const event = events[step];
  const cat = cfg.category;

  if (events.length === 0) return null;

  if (cat === 'sorting' || cat === 'search') {
    return <ArrayVisualizer events={events} step={step} />;
  }
  if (cat === 'graph') {
    return <GraphVisualizer events={events} step={step} algoId={algoId} />;
  }
  if (cat === 'dp') {
    return <DPVisualizer events={events} step={step} />;
  }
  if (cat === 'backtracking') {
    return <GridVisualizer events={events} step={step} />;
  }
  if (cat === 'greedy' && algoId === 'huffman') {
    return <HuffmanVisualizer events={events} step={step} />;
  }

  // Fallback: show current event data as JSON
  return (
    <div className="glass p-4">
      <pre className="code-block text-xs overflow-auto max-h-64">
        {JSON.stringify(event?.data ?? {}, null, 2)}
      </pre>
    </div>
  );
}

// ── Array Visualizer (Sorting & Searching) ────────────────────────────────────
function ArrayVisualizer({ events, step }: { events: TraceEvent[]; step: number }) {
  const event = events[step];
  const arr = (event?.snapshot ?? events[0]?.snapshot ?? []) as number[];
  const highlighted = new Set(event?.highlight_indices ?? []);
  const eventType = event?.type ?? '';

  const barColor = (i: number) => {
    if (!highlighted.has(i)) return '#4f46e5';
    if (eventType === 'swap') return '#ef4444';
    if (eventType === 'comparison') return '#f59e0b';
    if (eventType === 'mark_sorted') return '#10b981';
    if (eventType === 'pivot_set') return '#f97316';
    if (eventType === 'solution_found') return '#10b981';
    return '#6366f1';
  };

  const maxVal = Math.max(...arr.map(Number), 1);

  return (
    <div className="glass p-4">
      <div className="flex items-end justify-center gap-1 h-48">
        {arr.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-xs text-gray-400 font-mono">{val}</span>
            <div
              className="w-full rounded-t-sm transition-all duration-200"
              style={{
                height: `${(Number(val) / maxVal) * 140}px`,
                backgroundColor: barColor(i),
                boxShadow: highlighted.has(i) ? `0 0 8px ${barColor(i)}88` : 'none',
              }}
            />
            <span className="text-xs text-gray-600">{i}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center mt-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-primary-600" />Default
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-amber-500" />Comparing
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-red-500" />Swapping
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-emerald-500" />Sorted/Found
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-orange-500" />Pivot
        </div>
      </div>
    </div>
  );
}

// ── Graph Visualizer ──────────────────────────────────────────────────────────
function GraphVisualizer({ events, step, algoId }: { events: TraceEvent[]; step: number; algoId: string }) {
  const event = events[step];
  const cfg = ALGO_CONFIG[algoId];
  const input = cfg.defaultInput as any;

  // Collect all nodes seen across events
  const allNodes = new Set<string>();
  events.forEach(e => {
    e.highlight_nodes.forEach(n => allNodes.add(n));
    e.highlight_edges.forEach(([a, b]) => { allNodes.add(a); allNodes.add(b); });
  });

  // Use input nodes if available
  const nodeList = (input.nodes as string[] | undefined) ?? [...allNodes];
  const edges = (input.edges as [string, string, number][] | undefined) ?? [];
  const adjacency = (input.adjacency as Record<string, string[]> | undefined) ?? {};

  const highlightedNodes = new Set(event?.highlight_nodes ?? []);
  const highlightedEdges = new Set((event?.highlight_edges ?? []).map(([a, b]) => `${a}-${b}`));

  // Simple circular layout
  const N = nodeList.length;
  const cx = 200, cy = 150, r = 110;
  const positions: Record<string, { x: number; y: number }> = {};
  nodeList.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / N - Math.PI / 2;
    positions[n] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const nodeColor = (n: string) => {
    if (!highlightedNodes.has(n)) return '#242433';
    const t = event?.type ?? '';
    if (t === 'visit' || t === 'complete') return '#10b981';
    if (t === 'enqueue') return '#6366f1';
    if (t === 'selection') return '#06b6d4';
    if (t === 'relaxation') return '#f59e0b';
    if (t === 'edge_selected') return '#10b981';
    return '#6366f1';
  };

  const edgeColor = (a: string, b: string) => {
    const key1 = `${a}-${b}`, key2 = `${b}-${a}`;
    if (highlightedEdges.has(key1) || highlightedEdges.has(key2)) {
      const t = event?.type ?? '';
      if (t === 'edge_selected') return '#10b981';
      if (t === 'edge_rejected') return '#ef4444';
      return '#f59e0b';
    }
    return '#2e2e42';
  };

  // Build edge set
  const edgePairs: { a: string; b: string; w?: number }[] = [];
  if (edges.length) {
    edges.forEach(([a, b, w]) => edgePairs.push({ a, b, w }));
  } else {
    Object.entries(adjacency).forEach(([a, neighbors]) => {
      neighbors.forEach(b => edgePairs.push({ a, b }));
    });
  }

  return (
    <div className="glass p-4">
      <svg viewBox="0 0 400 300" className="w-full h-56">
        {/* Edges */}
        {edgePairs.map(({ a, b, w }, i) => {
          const pa = positions[a], pb = positions[b];
          if (!pa || !pb) return null;
          const color = edgeColor(a, b);
          return (
            <g key={i}>
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={color} strokeWidth={color !== '#2e2e42' ? 2.5 : 1.5}
                opacity={color !== '#2e2e42' ? 1 : 0.5}
              />
              {w !== undefined && (
                <text x={(pa.x + pb.x) / 2} y={(pa.y + pb.y) / 2 - 4}
                  fill="#9ca3af" fontSize="10" textAnchor="middle">
                  {w}
                </text>
              )}
            </g>
          );
        })}
        {/* Nodes */}
        {nodeList.map(n => {
          const p = positions[n];
          if (!p) return null;
          const fill = nodeColor(n);
          const isHighlighted = highlightedNodes.has(n);
          return (
            <g key={n}>
              <circle cx={p.x} cy={p.y} r={22}
                fill={fill} stroke={isHighlighted ? '#6366f1' : '#3a3a52'}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
              />
              <text x={p.x} y={p.y + 4} fill="white"
                fontSize="12" fontWeight="600" textAnchor="middle">
                {n}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex gap-3 justify-center mt-2 flex-wrap">
        {[
          { color: '#242433', label: 'Unvisited', border: '#3a3a52' },
          { color: '#6366f1', label: 'Active' },
          { color: '#10b981', label: 'Visited/Selected' },
          { color: '#f59e0b', label: 'Relaxing' },
        ].map(({ color, label, border }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color, border: border ? `1px solid ${border}` : 'none' }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DP Table Visualizer ───────────────────────────────────────────────────────
function DPVisualizer({ events, step }: { events: TraceEvent[]; step: number }) {
  const event = events[step];
  const table = event?.dp_table_snapshot;

  if (!table) {
    const snap = event?.snapshot;
    if (snap) {
      // 1D array DP (coin change)
      const arr = snap as (number | string)[];
      return (
        <div className="glass p-4">
          <p className="text-xs text-gray-500 mb-3">DP Array (Coin Change)</p>
          <div className="flex gap-1 flex-wrap">
            {arr.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-10 rounded bg-primary-900/50 border border-primary-700/40 flex items-center justify-center text-xs font-mono text-primary-300">
                  {typeof v === 'number' && isFinite(v) ? v : '∞'}
                </div>
                <span className="text-xs text-gray-600">{i}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="glass p-6 text-center">
        <p className="text-gray-500 text-sm">DP table will appear here during execution</p>
      </div>
    );
  }

  const data = event?.data as any;
  const hi = data?.i as number | undefined;
  const hj = data?.j as number | undefined;

  return (
    <div className="glass p-4 overflow-auto">
      <p className="text-xs text-gray-500 mb-3">DP Table — highlighted cell is being computed</p>
      <div className="overflow-auto max-h-64">
        <table className="border-collapse text-xs font-mono">
          <tbody>
            {(table as number[][]).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                  const isActive = i === hi && j === hj;
                  const isInfinite = typeof cell === 'number' && !isFinite(cell);
                  return (
                    <td key={j} className={clsx(
                      'w-10 h-9 text-center border transition-colors duration-150',
                      isActive
                        ? 'bg-primary-600 text-white border-primary-400'
                        : 'bg-surface-700 text-gray-300 border-surface-600'
                    )}>
                      {isInfinite ? '∞' : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── N-Queens Grid Visualizer ──────────────────────────────────────────────────
function GridVisualizer({ events, step }: { events: TraceEvent[]; step: number }) {
  const event = events[step];
  const board = (event?.snapshot ?? []) as number[];
  const n = board.length || 8;
  const eventType = event?.type ?? '';

  return (
    <div className="glass p-4">
      <p className="text-xs text-gray-500 mb-3">
        N-Queens Board (N={n}) — {eventType === 'backtrack' ? '⬅ Backtracking' : eventType === 'solution_found' ? '✓ Solution Found' : 'Placing queens...'}
      </p>
      <div className="overflow-auto flex justify-center">
        <div
          className="grid border border-surface-600"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, width: `${n * 40}px` }}
        >
          {Array.from({ length: n * n }, (_, idx) => {
            const row = Math.floor(idx / n);
            const col = idx % n;
            const isLight = (row + col) % 2 === 0;
            const hasQueen = board[row] === col;
            const isBacktracking = eventType === 'backtrack' && event?.data?.row === row && event?.data?.col === col;
            const isSolution = eventType === 'solution_found';

            return (
              <div
                key={idx}
                className={clsx(
                  'w-10 h-10 flex items-center justify-center text-lg transition-colors duration-150',
                  isLight ? 'bg-surface-700' : 'bg-surface-800',
                  hasQueen && isSolution && 'bg-emerald-700/60',
                  isBacktracking && 'bg-red-700/60',
                )}
              >
                {hasQueen && (
                  <span className={clsx(
                    'select-none transition-transform duration-150',
                    isSolution ? 'text-emerald-300' : isBacktracking ? 'text-red-300' : 'text-indigo-300'
                  )}>
                    ♛
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3 justify-center mt-3 text-xs text-gray-400">
        <span><span className="text-indigo-300">♛</span> Active</span>
        <span><span className="text-red-300">♛</span> Backtrack</span>
        <span><span className="text-emerald-300">♛</span> Solution</span>
      </div>
    </div>
  );
}

// ── Huffman Visualizer ────────────────────────────────────────────────────────
function HuffmanVisualizer({ events, step }: { events: TraceEvent[]; step: number }) {
  const event = events[step];
  const data = event?.data as any;

  return (
    <div className="glass p-4 space-y-3">
      <p className="text-sm font-medium text-gray-300">{event?.message}</p>
      {data?.codes && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Huffman Codes</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(data.codes as Record<string, string>).map(([ch, code]) => (
              <div key={ch} className="bg-surface-700 rounded p-2 text-center">
                <div className="text-white font-bold text-lg">'{ch}'</div>
                <div className="font-mono text-xs text-primary-300">{code}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {data?.compression_ratio !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Compression Ratio:</span>
          <span className="text-emerald-400 font-bold">{data.compression_ratio}%</span>
        </div>
      )}
      {!data?.codes && (
        <pre className="code-block text-xs overflow-auto max-h-40">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Trace Panel ───────────────────────────────────────────────────────────────
function TracePanel({ events, currentStep, onJump }: {
  events: TraceEvent[]; currentStep: number; onJump: (s: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.children[currentStep] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentStep]);

  if (events.length === 0) return (
    <div className="glass p-8 text-center">
      <List size={28} className="text-gray-600 mx-auto mb-2" />
      <p className="text-gray-400 text-sm">Run an algorithm to see its event trace.</p>
    </div>
  );

  return (
    <div className="glass p-4">
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">
        {events.length} events
      </p>
      <div ref={listRef} className="space-y-1 max-h-96 overflow-y-auto">
        {events.map((e, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-lg flex items-start gap-2 text-xs transition-all duration-100',
              i === currentStep
                ? 'bg-primary-600/20 border border-primary-600/30'
                : 'hover:bg-surface-700'
            )}
          >
            <span
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: eventColors[e.type] ?? '#6366f1' }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-mono text-gray-500 mr-1">[{e.type}]</span>
              <span className="text-gray-300 break-words">{e.message}</span>
            </div>
            <span className="text-gray-600 flex-shrink-0">#{e.step}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Metrics Panel ─────────────────────────────────────────────────────────────
function MetricsPanel({ metrics, result }: {
  metrics: Record<string, number>; result: unknown;
}) {
  const nonZero = Object.entries(metrics).filter(([, v]) => v > 0);

  return (
    <div className="space-y-4">
      {nonZero.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {nonZero.map(([key, val]) => (
            <MetricCard
              key={key}
              label={key.replace(/_/g, ' ')}
              value={val.toLocaleString()}
            />
          ))}
        </div>
      ) : (
        <div className="glass p-6 text-center text-gray-500 text-sm">
          Run an algorithm to see metrics.
        </div>
      )}

      {result !== null && result !== undefined && (
        <div className="glass p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Result</h3>
          <pre className="code-block text-xs overflow-auto max-h-48">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function NumericListField({ id, label, value, onChange, integerOnly = true }: {
  id?: string; label: string; value: number[]; onChange: (values: number[]) => void; integerOnly?: boolean;
}) {
  const formattedValue = value.join(', ');
  const [draft, setDraft] = useState(formattedValue);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => { setDraft(formattedValue); }, [formattedValue]);

  const commit = () => {
    const tokens = draft.trim().split(/[\s,;]+/).filter(Boolean);
    const values = tokens.map(Number);
    const isValid = tokens.length > 0 && values.every(number => Number.isFinite(number) && (!integerOnly || Number.isInteger(number)));
    setInvalid(!isValid);
    if (isValid) onChange(values);
  };

  return (
    <div>
      <label htmlFor={id} className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input id={id} className={`input-field font-mono ${invalid ? 'border-red-500 focus:ring-red-500' : ''}`}
        value={draft} onChange={event => { setDraft(event.target.value); setInvalid(false); }} onBlur={commit}
        placeholder="e.g. 38, 27, 43 or 38 27 43" aria-invalid={invalid} />
      <p className={`mt-1 text-xs ${invalid ? 'text-red-400' : 'text-gray-500'}`}>
        {invalid
          ? `Enter ${integerOnly ? 'whole ' : ''}numbers separated by spaces, commas, semicolons, or new lines.`
          : `Separate ${integerOnly ? 'whole ' : ''}numbers with spaces, commas, semicolons, or pasted lines.`}
      </p>
    </div>
  );
}

// ── Input Editor ──────────────────────────────────────────────────────────────
function InputEditor({ algoId, input, onChange }: {
  algoId: string; input: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void;
}) {
  const cfg = ALGO_CONFIG[algoId];
  const type = cfg?.inputType ?? 'array';

  const update = (key: string, val: unknown) => onChange({ ...input, [key]: val });

  if (type === 'array' || type === 'array_target') {
    return (
      <div className="space-y-3">
        <div>
          <NumericListField id="array-input" label="Array" value={(input.array as number[]) ?? []} onChange={value => update('array', value)} />
        </div>
        {type === 'array_target' && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Target</label>
            <input
              id="target-input"
              type="number"
              className="input-field font-mono"
              value={(input.target as number) ?? ''}
              onChange={e => update('target', e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </div>
        )}
        <button
          className="btn-secondary w-full text-xs"
          onClick={() => {
            const arr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 99) + 1);
            onChange({ ...input, array: arr, target: arr[Math.floor(Math.random() * arr.length)] });
          }}
        >
          <RefreshCw size={12} /> Random Input
        </button>
      </div>
    );
  }

  if (type === 'knapsack') {
    return (
      <div className="space-y-3">
        <div>
          <NumericListField label="Weights" value={(input.weights as number[]) ?? []} onChange={value => update('weights', value)} integerOnly={algoId !== 'fractional_knapsack'} />
        </div>
        <div>
          <NumericListField label="Values" value={(input.values as number[]) ?? []} onChange={value => update('values', value)} integerOnly={algoId !== 'fractional_knapsack'} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Capacity</label>
          <input type="number" className="input-field font-mono"
            value={(input.capacity as number) ?? 0}
            onChange={e => update('capacity', e.target.value === '' ? 0 : Number(e.target.value))} />
        </div>
      </div>
    );
  }

  if (type === 'strings') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">String 1</label>
          <input className="input-field font-mono" value={(input.string1 as string) ?? ''}
            onChange={e => update('string1', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">String 2</label>
          <input className="input-field font-mono" value={(input.string2 as string) ?? ''}
            onChange={e => update('string2', e.target.value)} />
        </div>
      </div>
    );
  }

  if (type === 'n_val') {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">N (board size, 1–10)</label>
          <input type="number" min={1} max={10} className="input-field font-mono"
            value={(input.n as number) ?? 8}
            onChange={e => update('n', parseInt(e.target.value, 10))} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Max solutions (1–10)</label>
          <input type="number" min={1} max={10} className="input-field font-mono"
            value={(input.max_solutions as number) ?? 5}
            onChange={e => update('max_solutions', parseInt(e.target.value, 10))} />
        </div>
      </div>
    );
  }

  if (type === 'coins') {
    return (
      <div className="space-y-3">
        <div>
          <NumericListField label="Coin values" value={(input.coins as number[]) ?? []} onChange={value => update('coins', value)} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Amount</label>
          <input type="number" className="input-field font-mono"
            value={(input.amount as number) ?? 0}
            onChange={e => update('amount', e.target.value === '' ? 0 : Number(e.target.value))} />
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Text</label>
        <input className="input-field font-mono" value={(input.text as string) ?? ''}
          onChange={e => update('text', e.target.value)} />
      </div>
    );
  }

  // graph, graph_weighted, dag
  return (
    <div className="space-y-3">
      {input.start !== undefined && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Start Node</label>
          <input className="input-field font-mono" value={(input.start as string) ?? ''}
            onChange={e => update('start', e.target.value)} />
        </div>
      )}
      {input.end !== undefined && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">End Node</label>
          <input className="input-field font-mono" value={(input.end as string) ?? ''}
            onChange={e => update('end', e.target.value)} />
        </div>
      )}
      <p className="text-xs text-gray-500">Graph uses built-in default topology. Full graph editor coming in next release.</p>
    </div>
  );
}

// ── Icon alias (GitBranch imported at top) ───────────────────────────────────
function GitBranchIcon(props: any) {
  return <GitBranch {...props} />;
}
