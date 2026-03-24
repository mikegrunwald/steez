import type { OverridesMap } from '@/lib/tokens/types';

const MAX_HISTORY = 50;

export type HistoryState = {
  past: OverridesMap[];
  present: OverridesMap;
  future: OverridesMap[];
};

export function createHistory(initial: OverridesMap): HistoryState {
  return { past: [], present: initial, future: [] };
}

export function pushState(history: HistoryState, next: OverridesMap): HistoryState {
  const past = [...history.past, history.present].slice(-MAX_HISTORY);
  return { past, present: next, future: [] };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  const past = history.past.slice(0, -1);
  return { past, present: previous, future: [history.present, ...history.future] };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  const future = history.future.slice(1);
  return { past: [...history.past, history.present], present: next, future };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}
