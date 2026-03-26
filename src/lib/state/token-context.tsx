'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { ColorSchemeMode, OverridesMap, PreviewMode } from '@/lib/tokens/types';
import { createHistory, pushState, undo, redo, type HistoryState } from './history';
import { loadOverrides, saveOverrides } from './persistence';

type State = {
  history: HistoryState;
  previewMode: PreviewMode;
  colorSchemeMode: ColorSchemeMode;
  expandedCategory: string | null;
  typeScaleUnlocked: boolean;
};

export type Action =
  | { type: 'SET_TOKEN'; key: string; value: string }
  | { type: 'RESET_TOKEN'; key: string }
  | { type: 'RESET_ALL' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_PREVIEW_MODE'; mode: PreviewMode }
  | { type: 'SET_COLOR_SCHEME_MODE'; mode: ColorSchemeMode }
  | { type: 'SET_EXPANDED_CATEGORY'; category: string | null }
  | { type: 'SET_TYPE_SCALE_UNLOCKED'; unlocked: boolean }
  | { type: 'HYDRATE'; overrides: OverridesMap };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TOKEN': {
      const next = { ...state.history.present, [action.key]: action.value };
      return { ...state, history: pushState(state.history, next) };
    }
    case 'RESET_TOKEN': {
      const { [action.key]: _, ...rest } = state.history.present;
      return { ...state, history: pushState(state.history, rest) };
    }
    case 'RESET_ALL':
      return { ...state, history: pushState(state.history, {}) };
    case 'UNDO':
      return { ...state, history: undo(state.history) };
    case 'REDO':
      return { ...state, history: redo(state.history) };
    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.mode };
    case 'SET_COLOR_SCHEME_MODE':
      return { ...state, colorSchemeMode: action.mode };
    case 'SET_EXPANDED_CATEGORY':
      return { ...state, expandedCategory: action.category };
    case 'SET_TYPE_SCALE_UNLOCKED':
      return { ...state, typeScaleUnlocked: action.unlocked };
    case 'HYDRATE':
      return { ...state, history: createHistory(action.overrides) };
    default:
      return state;
  }
}

const TokenContext = createContext<{
  overrides: OverridesMap;
  previewMode: PreviewMode;
  colorSchemeMode: ColorSchemeMode;
  expandedCategory: string | null;
  typeScaleUnlocked: boolean;
  changedCount: number;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    history: createHistory({}),
    previewMode: 'vignettes' as PreviewMode,
    colorSchemeMode: 'both' as ColorSchemeMode,
    expandedCategory: null,
    typeScaleUnlocked: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadOverrides();
    if (Object.keys(stored).length > 0) {
      dispatch({ type: 'HYDRATE', overrides: stored });
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    saveOverrides(state.history.present);
  }, [state.history.present]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch({ type: 'REDO' });
        } else {
          dispatch({ type: 'UNDO' });
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const overrides = state.history.present;
  const changedCount = Object.keys(overrides).length;

  const value = useMemo(
    () => ({
      overrides,
      previewMode: state.previewMode,
      colorSchemeMode: state.colorSchemeMode,
      expandedCategory: state.expandedCategory,
      typeScaleUnlocked: state.typeScaleUnlocked,
      changedCount,
      dispatch,
    }),
    [overrides, state.previewMode, state.colorSchemeMode, state.expandedCategory, state.typeScaleUnlocked, changedCount, dispatch]
  );

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useTokens must be used within TokenProvider');
  return context;
}
