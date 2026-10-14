import type { AlgorithmMeta, TraceEvent } from './api';

export interface ExamNotesRun {
  input: Record<string, unknown>;
  events: TraceEvent[];
  metrics: Record<string, number>;
  result: unknown;
}

interface StudyProfile {
  coreIdea: string;
  pseudocode: string[];
  properties: string[];
  reasoning: string;
  questions: Array<[string, string]>;
}

const profiles: Record<string, StudyProfile> = {
  merge_sort: profile('Divide the array recursively, then merge each pair of sorted halves.', ['MergeSort(A):', '  if length(A) <= 1: return A', '  split A into left and right halves', '  return Merge(MergeSort(left), MergeSort(right))'], ['Stable', 'Not in-place', 'Divide and conquer'], 'Every level merges n elements and there are log n levels.', [['Why is Merge Sort stable?', 'Equal elements keep their relative order during merging.'], ['Why does Merge Sort use O(n) space?', 'The merge operation stores temporary subarrays.']]),
  quick_sort: profile('Partition around a final-element pivot, then recursively sort both partitions.', ['QuickSort(A, low, high):', '  if low < high:', '    p = Partition(A, low, high)', '    QuickSort(A, low, p - 1)', '    QuickSort(A, p + 1, high)'], ['In-place', 'Not stable', 'Divide and conquer'], 'Balanced partitions give log n recursion levels; a bad pivot can create n levels.', [['What is the role of a pivot?', 'It partitions values into lower and higher groups.'], ['Why can Quick Sort be O(n squared)?', 'Repeatedly unbalanced partitions cause deep recursion.']]),
  randomized_quick_sort: profile('Use a randomly selected pivot before the same partition-and-recurse strategy as Quick Sort.', ['RandomizedQuickSort(A, low, high):', '  randomly choose pivot index', '  swap it with A[high]', '  partition around A[high]', '  recursively sort both partitions'], ['In-place', 'Not stable', 'Randomized'], 'Random pivots make balanced partitions likely, giving expected O(n log n) time.', [['Why randomize the pivot?', 'It reduces the chance of adversarial input causing poor partitions.'], ['Is randomized Quick Sort deterministic?', 'No. Its pivot choices can differ each run.']]),
  binary_search: profile('Compare the target with the middle value and discard one sorted half each iteration.', ['BinarySearch(A, target):', '  low = 0; high = length(A) - 1', '  while low <= high:', '    mid = (low + high) // 2', '    compare A[mid] with target and keep one half'], ['Requires sorted input', 'In-place', 'Iterative'], 'The remaining search interval is halved each iteration.', [['What condition is required?', 'The input must be sorted.'], ['Why is Binary Search O(log n)?', 'It removes half of the remaining candidates each step.']]),
  linear_search: profile('Check elements from left to right until the target is found or the array ends.', ['LinearSearch(A, target):', '  for each index i in A:', '    if A[i] equals target: return i', '  return not found'], ['Works on unsorted input', 'In-place', 'Sequential'], 'In the worst case every element must be inspected.', [['When is Linear Search useful?', 'For small or unsorted collections.'], ['What is its worst-case time?', 'O(n).']]),
  bfs: profile('Use a queue to explore graph vertices level by level from the start vertex.', ['BFS(G, start):', '  mark start visited; enqueue start', '  while queue is not empty:', '    u = dequeue()', '    enqueue every unvisited neighbor of u'], ['Queue-based', 'Finds unweighted shortest paths', 'Visits each reachable vertex once'], 'Each vertex and edge is processed at most once.', [['Which data structure does BFS use?', 'A queue.'], ['When does BFS find shortest paths?', 'In an unweighted graph.']]),
  dfs: profile('Visit a vertex, then recursively explore an unvisited neighbor as deeply as possible.', ['DFS(u):', '  mark u visited', '  for each neighbor v of u:', '    if v is unvisited: DFS(v)'], ['Stack or recursion', 'Depth-first traversal', 'Does not guarantee shortest paths'], 'Each vertex and edge is visited at most once.', [['Which structure models DFS?', 'A stack, often through recursion.'], ['Does DFS find unweighted shortest paths?', 'No; use BFS for that.']]),
  topological_sort: profile('Repeatedly explore dependencies and place each vertex after all of its outgoing dependencies are processed.', ['TopologicalSort(G):', '  run DFS from each unvisited vertex', '  add a vertex after visiting its neighbors', '  reverse the finishing order'], ['Only for DAGs', 'Dependency ordering', 'DFS-based implementation'], 'DFS visits every vertex and edge once.', [['What graph is required?', 'A directed acyclic graph.'], ['What does the order guarantee?', 'For every edge u to v, u appears before v.']]),
  dijkstra: profile('Repeatedly choose the unsettled vertex with the smallest tentative distance and relax its outgoing edges.', ['Dijkstra(G, source):', '  set source distance to 0', '  while heap is not empty:', '    choose minimum-distance vertex u', '    relax every edge from u'], ['Greedy', 'Min-heap implementation', 'Non-negative weights only'], 'Heap operations for vertices and edges give O((V + E) log V).', [['Why no negative edges?', 'A finalized shortest distance could later become smaller.'], ['What does relaxation do?', 'It improves a neighbor distance when a shorter route is found.']]),
  bellman_ford: profile('Relax every edge repeatedly and use one extra pass to detect a negative cycle.', ['BellmanFord(G, source):', '  set source distance to 0', '  repeat V - 1 times:', '    relax every edge', '  check once more for a negative cycle'], ['Handles negative weights', 'Detects negative cycles', 'Single-source shortest path'], 'Up to V - 1 rounds over E edges are required.', [['What extra feature does Bellman-Ford provide?', 'Negative-cycle detection.'], ['Why V - 1 relaxation rounds?', 'A shortest simple path has at most V - 1 edges.']]),
  kruskal: profile('Sort edges by weight and add an edge only when Union-Find confirms it does not create a cycle.', ['Kruskal(G):', '  sort edges by increasing weight', '  for each edge (u, v):', '    if Find(u) differs from Find(v):', '      add edge and Union(u, v)'], ['Greedy', 'Union-Find', 'Minimum spanning tree'], 'Sorting edges dominates the running time.', [['How does Kruskal avoid cycles?', 'It checks components with Union-Find.'], ['When is Kruskal especially useful?', 'For sparse graphs.']]),
  prim: profile('Grow one tree by repeatedly choosing the lightest edge from the tree to an unvisited vertex.', ['Prim(G, start):', '  add start to the tree', '  push its edges into a min-heap', '  repeatedly select the lightest connecting edge', '  add its new endpoint to the tree'], ['Greedy', 'Min-heap', 'Minimum spanning tree'], 'Each edge can enter the heap and each selection is logarithmic.', [['How is Prim different from Kruskal?', 'Prim grows one connected tree; Kruskal joins components.'], ['What does Prim produce?', 'A minimum spanning tree.']]),
  knapsack_01: profile('Fill a table that chooses the better value of including or excluding each indivisible item.', ['Knapsack(weights, values, W):', '  create dp table for items and capacities', '  for each item and capacity:', '    dp[i][w] = max(exclude, include if it fits)', '  return dp[n][W]'], ['0/1 items', 'Optimal DP solution', 'Pseudo-polynomial'], 'The table has n times W states, each filled once.', [['Why is it called 0/1?', 'Each item is either fully taken or not taken.'], ['What does dp[i][w] represent?', 'Best value using first i items within capacity w.']]),
  lcs: profile('Build a table of the best common subsequence for every pair of string prefixes.', ['LCS(X, Y):', '  create a table for prefix pairs', '  if characters match: use diagonal + 1', '  otherwise: take max of top and left', '  return final table entry'], ['Dynamic programming', 'Order preserved', 'Not necessarily contiguous'], 'There are m times n prefix pairs to evaluate.', [['Is an LCS a substring?', 'No; characters need not be contiguous.'], ['What happens on a character match?', 'The diagonal value is increased by one.']]),
  coin_change: profile('Compute the smallest number of coins for each amount using prior smaller amounts.', ['CoinChange(coins, amount):', '  dp[0] = 0; others = infinity', '  for each amount:', '    try every coin not exceeding amount', '    keep the minimum dp[amount - coin] + 1'], ['Unbounded coins', 'Dynamic programming', 'Minimum-count optimization'], 'Each amount considers every coin denomination.', [['What does dp[a] store?', 'The minimum coins needed to make amount a.'], ['Can one coin be reused?', 'Yes, this implementation permits repeated use.']]),
  floyd_warshall: profile('Use every vertex in turn as an allowed intermediate vertex for all-pairs shortest paths.', ['FloydWarshall(D):', '  for each intermediate k:', '    for every pair i, j:', '      D[i][j] = min(D[i][j], D[i][k] + D[k][j])'], ['All-pairs shortest paths', 'Handles negative weights', 'Matrix DP'], 'Three nested vertex loops yield O(V cubed).', [['What does the outer loop represent?', 'The next allowed intermediate vertex.'], ['Can it handle negative edges?', 'Yes, unless a negative cycle makes paths undefined.']]),
  n_queens: profile('Try each column in a row, recurse after safe placements, and backtrack after conflicts.', ['Solve(row):', '  if row equals N: record solution', '  for each column:', '    if placement is safe:', '      place queen; Solve(row + 1); remove queen'], ['Backtracking', 'Constraint satisfaction', 'Prunes conflicting placements'], 'The search can explore factorially many placements in the worst case.', [['What makes a queen placement unsafe?', 'A queen shares a column or diagonal with another queen.'], ['What is backtracking?', 'Undoing a choice after it cannot lead to a solution.']]),
  activity_selection: profile('Sort activities by finish time and greedily select the next compatible activity.', ['ActivitySelection(A):', '  sort activities by finish time', '  select the first activity', '  select each later activity whose start is after the last finish'], ['Greedy', 'Optimal for fixed intervals', 'Finish-time ordering'], 'Sorting is O(n log n); the selection scan is linear.', [['Why choose earliest finish time?', 'It leaves maximum room for remaining activities.'], ['Is the greedy result optimal?', 'Yes, for the standard activity-selection problem.']]),
  fractional_knapsack: profile('Sort items by value-to-weight ratio and take the highest ratios first, including a final fraction if needed.', ['FractionalKnapsack(items, W):', '  sort by value / weight ratio descending', '  take each whole fitting item', '  take the needed fraction of the next item', '  stop when capacity is full'], ['Greedy', 'Divisible items', 'Optimal for fractions'], 'Sorting by ratio dominates the work.', [['Why is greedy optimal here?', 'Items can be divided, so the best ratio should be used first.'], ['How is this different from 0/1 Knapsack?', 'Items may be split into fractions.']]),
  huffman: profile('Repeatedly combine the two least-frequent nodes into a binary tree to build a prefix-free code.', ['Huffman(freq):', '  put characters in a min-heap', '  while more than one node remains:', '    remove two minimum-frequency nodes', '    combine them and insert the parent', '  traverse tree to assign codes'], ['Greedy', 'Prefix-free codes', 'Lossless compression'], 'Heap operations for n symbols give O(n log n).', [['Why are Huffman codes prefix-free?', 'No encoded symbol is an ancestor of another leaf.'], ['What gets shorter codes?', 'More frequent symbols.']]),
};

function profile(coreIdea: string, pseudocode: string[], properties: string[], reasoning: string, questions: Array<[string, string]>): StudyProfile {
  return { coreIdea, pseudocode, properties, reasoning, questions };
}

function fallbackProfile(meta: AlgorithmMeta): StudyProfile {
  return profile(meta.description, ['Algorithm(input):', '  initialize the required state', '  process each trace event according to the algorithm rule', '  return the computed result'], [meta.paradigm], 'The exact implementation follows the complexity listed below.', [['What problem does this algorithm solve?', meta.description], ['When should it be used?', meta.when_to_use]]);
}

function inputSize(input: Record<string, unknown>): number | null {
  if (Array.isArray(input.array)) return input.array.length;
  if (Array.isArray(input.nodes)) return input.nodes.length;
  if (Array.isArray(input.weights)) return input.weights.length;
  if (Array.isArray(input.coins)) return input.coins.length;
  if (Array.isArray(input.activities)) return input.activities.length;
  if (typeof input.text === 'string') return input.text.length;
  if (typeof input.string1 === 'string' && typeof input.string2 === 'string') return Math.max(input.string1.length, input.string2.length);
  if (typeof input.n === 'number') return input.n;
  return null;
}

function format(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? 'Not available';
}

function dryRun(events: TraceEvent[]): string[] {
  if (!events.length) return [];
  const candidates = events.filter(event => event.snapshot !== null || ['initialize', 'comparison', 'swap', 'state_change', 'visit', 'relaxation', 'dp_update', 'solution_found', 'complete'].includes(event.type));
  const selected = candidates.length <= 10 ? candidates : Array.from({ length: 10 }, (_, index) => candidates[Math.floor(index * (candidates.length - 1) / 9)]);
  const seen = new Set<string>();
  return selected.flatMap(event => {
    const state = event.snapshot ? ` State: ${format(event.snapshot).replace(/\s+/g, ' ')}` : '';
    const line = `Step ${event.step}: ${event.message}.${state}`.replace('..', '.');
    if (seen.has(line)) return [];
    seen.add(line);
    return [line];
  });
}

function fileName(name: string): string {
  return `AlgoLab_${name.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}_Exam_Notes.pdf`;
}

export async function downloadExamNotes(meta: AlgorithmMeta, run: ExamNotesRun): Promise<void> {
  // Keep the sizeable PDF renderer out of the initial visualizer bundle.
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const profile = profiles[meta.id] ?? fallbackProfile(meta);
  const margin = 16;
  const pageWidth = 210;
  let y = 18;
  let page = 1;

  const footer = () => {
    pdf.setFontSize(8);
    pdf.setTextColor(115, 115, 115);
    pdf.text(`AlgoLab Exam Notes - Page ${page}`, pageWidth - margin, 289, { align: 'right' });
  };
  const nextPage = () => { footer(); pdf.addPage(); page += 1; y = 18; };
  const ensure = (height: number) => { if (y + height > 278) nextPage(); };
  const heading = (text: string) => {
    ensure(12);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.setTextColor(35, 45, 85);
    pdf.text(text.toUpperCase(), margin, y); y += 6;
    pdf.setDrawColor(99, 102, 241); pdf.line(margin, y, pageWidth - margin, y); y += 5;
  };
  const body = (text: string, mono = false) => {
    pdf.setFont(mono ? 'courier' : 'helvetica', 'normal'); pdf.setFontSize(mono ? 8.5 : 10); pdf.setTextColor(45, 45, 50);
    const lines = pdf.splitTextToSize(text, pageWidth - margin * 2) as string[];
    const lineHeight = 4.7;
    let offset = 0;
    while (offset < lines.length) {
      const availableLines = Math.max(1, Math.floor((278 - y) / lineHeight));
      const chunk = lines.slice(offset, offset + availableLines);
      pdf.text(chunk, margin, y);
      y += chunk.length * lineHeight;
      offset += chunk.length;
      if (offset < lines.length) nextPage();
    }
    y += 3;
  };
  const bullets = (items: string[]) => items.forEach(item => body(`- ${item}`));

  pdf.setFillColor(31, 41, 85); pdf.rect(0, 0, pageWidth, 32, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.setTextColor(255, 255, 255); pdf.text('ALGOLAB - EXAM NOTES', margin, 15);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.text('Personalized from your completed visualization run', margin, 23);
  y = 42;
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16); pdf.setTextColor(35, 45, 85); pdf.text(meta.name, margin, y); y += 8;
  body(`Paradigm: ${meta.paradigm}`);
  body(`Your input: ${format(run.input)}`);
  const size = inputSize(run.input); if (size !== null) body(`Input size: ${size}`);

  heading('Definition and core idea'); body(meta.description); body(`Core idea: ${profile.coreIdea}`);
  heading('Pseudocode'); body(profile.pseudocode.join('\n'), true);
  heading('Your actual dry run');
  const runLines = dryRun(run.events);
  if (runLines.length) bullets(runLines); else body('No trace snapshots were available for this run. The remaining run information is shown below.');
  body(`Final result: ${format(run.result)}`);
  heading('Time and space complexity');
  body(`Best: ${meta.complexity.time_best}\nAverage: ${meta.complexity.time_avg}\nWorst: ${meta.complexity.time_worst}\nSpace: ${meta.complexity.space}`);
  body(`Why: ${profile.reasoning}`);
  heading('Your run statistics');
  if (size !== null) body(`Input size: ${size}`);
  const metricLines = Object.entries(run.metrics).filter(([, amount]) => Number.isFinite(amount)).map(([label, amount]) => `${label.replace(/_/g, ' ')}: ${amount}`);
  if (metricLines.length) bullets(metricLines); else body('No additional tracer metrics were recorded for this run.');
  body(`Trace steps: ${run.events.length}`);
  heading('Properties'); bullets(profile.properties);
  heading('Advantages'); bullets(meta.advantages);
  heading('Limitations'); bullets(meta.limitations);
  heading('When to use'); body(meta.when_to_use);
  heading('Exam questions');
  profile.questions.forEach(([question, answer], index) => { body(`Q${index + 1}. ${question}`); body(`Answer: ${answer}`); });
  footer();
  pdf.save(fileName(meta.name));
}
