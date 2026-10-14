import type { TraceEvent } from './api';

export interface NarrationContext {
  algorithmId: string;
  algorithmName: string;
}

export interface NarrationResult {
  text: string;
  source: 'algorithm' | 'event' | 'message' | 'fallback';
}

type Narrator = (event: TraceEvent) => string | null;

const value = (event: TraceEvent, key: string): string | number | undefined => {
  const item = event.data[key];
  return typeof item === 'string' || typeof item === 'number' ? item : undefined;
};

const algorithmNarrators: Record<string, Narrator> = {
  merge_sort: event => {
    if (event.type === 'comparison') return `Compare ${value(event, 'a')} and ${value(event, 'b')}.`;
    if (event.type === 'recursive_call') return 'Divide the current subarray into two smaller halves.';
    if (event.type === 'state_change' && value(event, 'value') !== undefined) return `Place ${value(event, 'value')} into the merged subarray.`;
    if (event.type === 'mark_sorted') return 'This subarray is now sorted and merged.';
    return null;
  },
  quick_sort: event => quickSortNarration(event),
  randomized_quick_sort: event => quickSortNarration(event),
  binary_search: event => {
    if (event.type === 'comparison') return `Compare the target with the middle value ${value(event, 'mid_value')}.`;
    if (event.type === 'decision') return value(event, 'direction') === 'left' ? 'The target is smaller, so search the left half.' : 'The target is larger, so search the right half.';
    if (event.type === 'solution_found') return `The target was found at index ${value(event, 'index')}.`;
    return null;
  },
  linear_search: event => event.type === 'comparison' ? 'Compare the target with the current element.' : null,
  bfs: event => traversalNarration(event, 'Breadth-First Search'),
  dfs: event => traversalNarration(event, 'Depth-First Search'),
  dijkstra: event => {
    if (event.type === 'selection') return `Select node ${value(event, 'node')} with the smallest tentative distance.`;
    if (event.type === 'relaxation') return `Relax the edge from ${value(event, 'from')} to ${value(event, 'to')}.`;
    if (event.type === 'state_change') return `Update the shortest known distance to ${value(event, 'node')}.`;
    return null;
  },
  bellman_ford: event => event.type === 'relaxation' ? 'Relax this edge and check whether the distance improves.' : null,
  kruskal: event => {
    if (event.type === 'selection') return 'Consider the next lowest-weight edge.';
    if (event.type === 'edge_selected') return 'Accept this edge because it does not create a cycle.';
    if (event.type === 'edge_rejected') return 'Reject this edge because it would create a cycle.';
    return null;
  },
  prim: event => event.type === 'edge_selected' ? 'Add the minimum connecting edge to the spanning tree.' : null,
  knapsack_01: event => dpNarration(event),
  lcs: event => dpNarration(event),
  coin_change: event => dpNarration(event),
  floyd_warshall: event => dpNarration(event),
  n_queens: event => {
    const row = value(event, 'row');
    const col = value(event, 'col');
    if (event.type === 'decision') return `Try a queen in row ${row}, column ${col}.`;
    if (event.type === 'include') return `That position is valid. Continue to the next row.`;
    if (event.type === 'backtrack') return 'That position conflicts with another queen, so backtrack.';
    if (event.type === 'solution_found') return 'A valid queen placement has been found.';
    return null;
  },
};

function quickSortNarration(event: TraceEvent): string | null {
  if (event.type === 'pivot_set') return `Select ${value(event, 'pivot')} as the pivot.`;
  if (event.type === 'comparison') return `Compare ${value(event, 'value')} with the pivot ${value(event, 'pivot')}.`;
  if (event.type === 'swap') return 'Swap the current elements to maintain the partition.';
  if (event.type === 'recursive_call') return 'Partition the current subarray around its pivot.';
  if (event.type === 'recursive_return') return `The pivot is now in its final position at index ${value(event, 'pivot_index')}.`;
  return null;
}

function traversalNarration(event: TraceEvent, label: string): string | null {
  if (event.type === 'initialize') return `Start ${label} from node ${value(event, 'start')}.`;
  if (event.type === 'enqueue') return `Add node ${value(event, 'neighbor') ?? value(event, 'queue')} to the queue.`;
  if (event.type === 'dequeue') return `Remove node ${value(event, 'node')} from the queue.`;
  if (event.type === 'visit') return `Visit node ${value(event, 'node')}.`;
  if (event.type === 'comparison' && value(event, 'neighbor') !== undefined) return `Check whether neighbor ${value(event, 'neighbor')} has already been visited.`;
  return null;
}

function dpNarration(event: TraceEvent): string | null {
  if (event.type === 'initialize') return 'Initialize the dynamic programming table.';
  if (event.type === 'comparison') return 'Compare the available choices using previously calculated states.';
  if (event.type === 'dp_update') return `Update the dynamic programming table${value(event, 'value') !== undefined ? ` with value ${value(event, 'value')}` : ''}.`;
  return null;
}

function genericNarration(event: TraceEvent): string | null {
  switch (event.type) {
    case 'initialize': return 'Initialize the algorithm state.';
    case 'comparison': return 'Compare the current values.';
    case 'swap': return 'Swap the selected elements.';
    case 'visit': return `Visit node ${value(event, 'node') ?? 'currently selected'}.`;
    case 'enqueue': return 'Add the next node to the queue.';
    case 'dequeue': return 'Remove the next node from the queue.';
    case 'relaxation': return 'Check whether this edge gives a shorter path.';
    case 'selection': return 'Select the next best candidate.';
    case 'partition': return 'Partition the current problem into smaller parts.';
    case 'recursive_call': return 'Solve the next subproblem recursively.';
    case 'recursive_return': return 'Combine the result from this subproblem.';
    case 'dp_update': return 'Update the dynamic programming table.';
    case 'decision': return 'Evaluate the next possible choice.';
    case 'backtrack': return 'Backtrack and try the next possible choice.';
    case 'include': return 'Include this choice in the current solution.';
    case 'exclude': return 'Exclude this choice and continue.';
    case 'edge_selected': return 'Add this edge to the solution.';
    case 'edge_rejected': return 'Reject this edge because it is not suitable.';
    case 'flow_update': return 'Update the flow and residual capacity.';
    case 'state_change': return 'Update the current algorithm state.';
    case 'solution_found': return 'A valid solution has been found.';
    case 'pivot_set': return 'Select the pivot for this partition.';
    case 'mark_sorted': return 'This part of the array is now sorted.';
    case 'complete': return 'The algorithm is complete.';
    default: return null;
  }
}

export function getNarration(event: TraceEvent, context: NarrationContext): NarrationResult {
  const algorithmText = algorithmNarrators[context.algorithmId]?.(event);
  if (algorithmText) return { text: algorithmText, source: 'algorithm' };

  const genericText = genericNarration(event);
  if (genericText) return { text: genericText, source: 'event' };

  if (event.message.trim()) return { text: event.message.replaceAll('[', '').replaceAll(']', '').replaceAll('{', '').replaceAll('}', '').trim(), source: 'message' };
  return { text: `Continue ${context.algorithmName}.`, source: 'fallback' };
}
