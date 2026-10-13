/**
 * API service layer — all communication with the AlgoLab FastAPI backend.
 */
import axios from 'axios';

// In the deployment image FastAPI serves this SPA, so production requests stay
// same-origin. A separate API URL can still be supplied for other deployments.
const BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 minutes for large benchmarks
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('algolab_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface AuthSession {
  access_token: string;
  token_type: string;
  username: string;
}

export async function register(username: string, password: string): Promise<AuthSession> {
  const { data } = await api.post('/api/auth/register', { username, password });
  return data;
}

export async function login(username: string, password: string): Promise<AuthSession> {
  const { data } = await api.post('/api/auth/login', { username, password });
  return data;
}

// ── Algorithms ────────────────────────────────────────────────────────────────

export async function fetchAlgorithms() {
  const { data } = await api.get('/api/algorithms');
  return data.algorithms as AlgorithmMeta[];
}

export async function fetchAlgorithm(id: string) {
  const { data } = await api.get(`/api/algorithms/${id}`);
  return data as AlgorithmMeta;
}

// ── Visualize ─────────────────────────────────────────────────────────────────

export async function visualizeSort(payload: SortRequest): Promise<VisualizeResponse> {
  const { data } = await api.post('/api/visualize/sort', payload);
  return data;
}

export async function visualizeGraph(payload: GraphRequest): Promise<VisualizeResponse> {
  const { data } = await api.post('/api/visualize/graph', payload);
  return data;
}

export async function visualizeDP(payload: DPRequest): Promise<VisualizeResponse> {
  const { data } = await api.post('/api/visualize/dp', payload);
  return data;
}

export async function visualizeBacktrack(payload: BacktrackRequest): Promise<VisualizeResponse> {
  const { data } = await api.post('/api/visualize/backtrack', payload);
  return data;
}

export async function visualizeGreedy(payload: GreedyRequest): Promise<VisualizeResponse> {
  const { data } = await api.post('/api/visualize/greedy', payload);
  return data;
}

// ── Benchmark ─────────────────────────────────────────────────────────────────

export async function runBenchmark(payload: BenchmarkRequest): Promise<BenchmarkResponse> {
  const { data } = await api.post('/api/benchmark', payload);
  return data;
}

// ── Advisor ───────────────────────────────────────────────────────────────────

export async function getRecommendation(payload: AdvisorRequest): Promise<AdvisorResponse> {
  const { data } = await api.post('/api/advisor/recommend', payload);
  return data;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlgorithmMeta {
  id: string;
  name: string;
  paradigm: string;
  category: string;
  description: string;
  when_to_use: string;
  complexity: {
    time_best: string;
    time_avg: string;
    time_worst: string;
    space: string;
  };
  advantages: string[];
  limitations: string[];
  related: string[];
  visualizer_type: string;
  input_type: string;
}

export interface TraceEvent {
  step: number;
  type: string;
  message: string;
  data: Record<string, unknown>;
  highlight_indices: number[];
  highlight_nodes: string[];
  highlight_edges: [string, string][];
  snapshot: unknown[] | null;
  dp_table_snapshot: unknown[][] | null;
}

export interface VisualizeResponse {
  algorithm: string;
  events: TraceEvent[];
  result: unknown;
  metrics: Record<string, number>;
  success: boolean;
  error?: string;
}

export interface SortRequest {
  algorithm: string;
  array: number[];
  target?: number;
}

export interface GraphRequest {
  algorithm: string;
  nodes: string[];
  edges: [string, string, number][];
  adjacency: Record<string, string[]>;
  start: string;
  end?: string;
}

export interface DPRequest {
  algorithm: string;
  weights?: number[];
  values?: number[];
  capacity?: number;
  string1?: string;
  string2?: string;
  coins?: number[];
  amount?: number;
  nodes?: string[];
  edges?: [string, string, number][];
}

export interface BacktrackRequest {
  algorithm: string;
  n: number;
  max_solutions?: number;
}

export interface GreedyRequest {
  algorithm: string;
  activities?: [number, number, string][];
  weights?: number[];
  values?: number[];
  capacity?: number;
  text?: string;
}

export interface BenchmarkRequest {
  algorithms: string[];
  input_sizes: number[];
  category: string;
  trials?: number;
}

export interface BenchmarkResponse {
  results: BenchmarkResult[];
  category: string;
}

export interface BenchmarkResult {
  algorithm_id: string;
  category: string;
  sizes: {
    n: number;
    avg_operations: number;
    avg_time_ms: number;
    min_time_ms: number;
    max_time_ms: number;
  }[];
}

export interface AdvisorRequest {
  is_graph_problem?: boolean;
  is_optimization?: boolean;
  needs_exact_solution?: boolean;
  has_overlapping_subproblems?: boolean;
  has_optimal_substructure?: boolean;
  has_greedy_choice_property?: boolean;
  needs_exhaustive_search?: boolean;
  is_weighted_graph?: boolean;
  has_negative_weights?: boolean;
  is_directed?: boolean;
  is_dag?: boolean;
  is_bipartite?: boolean;
  needs_flow?: boolean;
  needs_mst?: boolean;
  needs_shortest_path?: boolean;
  needs_traversal?: boolean;
  needs_topological_order?: boolean;
  input_size?: string;
  num_variables?: number;
  has_constraints?: boolean;
  is_scheduling?: boolean;
  is_assignment?: boolean;
  is_tsp_like?: boolean;
  is_knapsack_like?: boolean;
  is_string_problem?: boolean;
  is_sorting?: boolean;
  is_searching?: boolean;
  suspected_np_hard?: boolean;
}

export interface AdvisorResponse {
  paradigm_scores: { paradigm: string; score: number; reasons: string[] }[];
  algorithm_recommendations: {
    name: string;
    paradigm: string;
    algorithm_id: string;
    score: number;
    reason: string;
    complexity: string;
    suitable: boolean;
  }[];
  top_paradigm: string | null;
  explanation: string;
}
