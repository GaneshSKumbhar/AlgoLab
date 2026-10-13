import { Link } from 'react-router-dom';
import { Cpu, BookOpen, Brain, GitBranch, BarChart3, FlaskConical } from 'lucide-react';
import { Badge } from '../../components/ui';

const TECH_STACK = [
  { layer: 'Frontend', tech: 'React + TypeScript + Vite', color: 'text-blue-400' },
  { layer: 'Styling', tech: 'Tailwind CSS v3 + Custom Design System', color: 'text-cyan-400' },
  { layer: 'Charts', tech: 'Recharts', color: 'text-indigo-400' },
  { layer: 'Icons', tech: 'Lucide React', color: 'text-purple-400' },
  { layer: 'Backend', tech: 'Python + FastAPI + Uvicorn', color: 'text-emerald-400' },
  { layer: 'API', tech: 'REST (JSON) — Axios client', color: 'text-amber-400' },
  { layer: 'Testing', tech: 'pytest (backend) + Vitest (frontend)', color: 'text-rose-400' },
];

const FEATURES = [
  { icon: Brain, title: 'Paradigm Advisor', desc: 'Rule-based algorithm recommendation from problem characteristics. Fully explainable, no ML/AI.' },
  { icon: GitBranch, title: 'Live Visualizer', desc: 'Step through actual algorithm execution. Play, pause, step forward/back. 8 visualizer types.' },
  { icon: BarChart3, title: 'Benchmark Lab', desc: 'Empirical benchmarking at increasing input sizes. Real operation counts, not fabricated data.' },
  { icon: BookOpen, title: 'Algorithm Library', desc: '20 algorithms with complexity analysis, advantages, limitations, and related algorithms.' },
  { icon: FlaskConical, title: 'Case Studies', desc: '4 real-world scenarios demonstrating how DAA paradigms apply to practical problems.' },
  { icon: Cpu, title: 'Tracer System', desc: 'Standardized event system — every algorithm emits typed events for visualization and metrics.' },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 glow-primary">
          <Cpu size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-3">AlgoLab</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          An Interactive Algorithmic Problem Solver, Paradigm Advisor &amp; Empirical Benchmarking Platform
          aligned with Design and Analysis of Algorithms (DAA).
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Badge variant="indigo">Problem-First</Badge>
          <Badge variant="green">Open Source</Badge>
          <Badge variant="amber">Academic</Badge>
        </div>
      </div>

      {/* Core Principle */}
      <div className="glass p-6 mb-8 border border-primary-700/30 bg-primary-900/10">
        <h2 className="text-lg font-bold text-white mb-3">Core Philosophy</h2>
        <blockquote className="border-l-4 border-primary-500 pl-4">
          <p className="text-gray-300 text-base italic leading-relaxed">
            "A normal algorithm visualizer asks: <strong className="text-white">Which algorithm do you want to run?</strong>"
          </p>
          <p className="text-gray-300 text-base italic leading-relaxed mt-2">
            "AlgoLab asks: <strong className="text-primary-300">What problem are you trying to solve?</strong>"
          </p>
        </blockquote>
      </div>

      {/* Features */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-5">Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass p-5">
              <Icon size={20} className="text-primary-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-5">Architecture</h2>
        <div className="glass p-5">
          <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto">
{`USER PROBLEM
      ↓
PROBLEM FORMALIZATION
      ↓
PARADIGM ADVISOR (Rule-Based)
      ↓
CANDIDATE ALGORITHMS
      ↓
ALGORITHM EXECUTION (Python/FastAPI)
      ↓
TRACER EVENTS (JSON)
      ↓
┌─────────────────┬────────────────┬──────────────┐
│  Visualization  │  Benchmarking  │  Explanation │
│  (React canvas) │  (real data)   │  (metrics)   │
└─────────────────┴────────────────┴──────────────┘
      ↓
COMPARISON + FINAL RECOMMENDATION`}
          </pre>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-5">Technology Stack</h2>
        <div className="glass divide-y divide-surface-600">
          {TECH_STACK.map(({ layer, tech, color }) => (
            <div key={layer} className="flex items-center gap-4 px-5 py-3">
              <span className="text-sm text-gray-500 w-28 flex-shrink-0">{layer}</span>
              <span className={`text-sm font-medium ${color}`}>{tech}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tracer System */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Tracer System</h2>
        <p className="text-gray-400 text-sm mb-4">
          Every algorithm receives a <code className="text-primary-300 font-mono">Tracer</code> instance.
          It emits structured <code className="text-primary-300 font-mono">TraceEvent</code> objects during execution.
          The frontend replays these events step-by-step — visualization is always derived from real execution.
        </p>
        <div className="glass p-4">
          <p className="text-xs text-gray-500 mb-2">Event types emitted by algorithms:</p>
          <div className="flex flex-wrap gap-1.5">
            {['comparison', 'swap', 'visit', 'enqueue', 'dequeue', 'relaxation', 'selection',
              'partition', 'recursive_call', 'recursive_return', 'dp_update', 'decision',
              'backtrack', 'include', 'exclude', 'edge_selected', 'edge_rejected',
              'flow_update', 'solution_found', 'pivot_set', 'mark_sorted'].map(e => (
              <span key={e} className="badge badge-indigo font-mono text-xs">{e}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/" className="btn-primary px-6 py-3">
          Explore AlgoLab
        </Link>
        <Link to="/advisor" className="btn-secondary px-6 py-3">
          Try Paradigm Advisor
        </Link>
      </div>
    </div>
  );
}
