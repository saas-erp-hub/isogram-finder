import { useReducer, useMemo, useCallback, FC, useRef, useEffect } from 'react';
import { Settings, Cpu, ListOrdered, Star, AlertCircle, Wand2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import workerLoader from './worker-loader';
import SettingsSlider from './components/SettingsSlider';
import SolutionCard from './components/SolutionCard';
import WordlistPanel from './components/WordlistPanel';
import SettingsPanel from './components/SettingsPanel';
import ResultsPanel from './components/ResultsPanel';
import { isIsogram, cleanAndCheckIsogram } from './utils/isogramUtils';
import type { Solution, ProgressState, SearchSettings, WorkerMessage } from './search.worker';

// --- UTILITY: Combining Tailwind classes safely ---
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}



// --- STATE MANAGEMENT (Reducer) ---

interface AppState {
  selectedLanguage: 'de' | 'en';
  wordListInput: string;
  settings: SearchSettings;
  results: Solution[];
  isSearching: boolean;
  progress: ProgressState;
  activeTab: 'score' | 'length';
  error: string | null;
  message: string | null;
  showDisclaimer: boolean;
}

type AppAction =
  | { type: 'SET_LANGUAGE'; payload: 'de' | 'en' }
  | { type: 'SET_WORD_LIST'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Partial<SearchSettings> }
  | { type: 'START_SEARCH' }
  | { type: 'CANCEL_SEARCH' }
  | { type: 'DISMISS_DISCLAIMER' }
  | { type: 'SET_ACTIVE_TAB'; payload: 'score' | 'length' }
  | { type: 'WORKER_SOLUTION'; payload: Solution[] }
  | { type: 'WORKER_PROGRESS'; payload: ProgressState }
  | { type: 'WORKER_DONE'; payload: Solution[] }
  | { type: 'WORKER_ERROR'; payload: string }
  | { type: 'SET_MESSAGE'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null };


const initialState: AppState = {
  selectedLanguage: 'de',
  wordListInput: '',
  settings: {
    minLen: 10,
    maxLen: 0,
    topN: 10,
    searchMode: 'classic',
    startSize: 40,
    highLowTopPercent: 20,
    highLowBottomPercent: 30,
  },
  results: [],
  isSearching: false,
  progress: { longest: null, bestScore: null, solutionsFound: 0, wordsScanned: 0 },
  activeTab: 'score',
  error: null,
  message: null,
  showDisclaimer: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, selectedLanguage: action.payload };
    case 'SET_WORD_LIST':
      return { ...state, wordListInput: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'START_SEARCH':
      return {
        ...state,
        isSearching: true,
        error: null,
        message: null,
        results: [],
        progress: { longest: null, bestScore: null, solutionsFound: 0, wordsScanned: 0 },
      };
    case 'CANCEL_SEARCH':
      return { ...state, isSearching: false, message: 'Search cancelled by user.' };
    case 'DISMISS_DISCLAIMER':
        localStorage.setItem('disclaimerDismissed', 'true');
        return { ...state, showDisclaimer: false };
    case 'SET_ACTIVE_TAB':
        return { ...state, activeTab: action.payload };
    case 'WORKER_SOLUTION':
        return { ...state, results: action.payload };
    case 'WORKER_PROGRESS':
        return { ...state, progress: action.payload };
    case 'WORKER_DONE':
        return { ...state, isSearching: false, message: 'Search finished!', results: action.payload };
    case 'WORKER_ERROR':
        return { ...state, isSearching: false, error: action.payload };
    case 'SET_MESSAGE':
        return { ...state, message: action.payload };
    case 'SET_ERROR':
        return { ...state, error: action.payload };
    default:
      return state;
  }
}


const IsogramFinderPage: FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    selectedLanguage,
    wordListInput,
    settings,
    results,
    isSearching,
    progress,
    activeTab,
    error,
    message,
    showDisclaimer,
  } = state;
  const workerRef = useRef<Worker | null>(null);


  useEffect(() => {
    const dismissed = localStorage.getItem('disclaimerDismissed');
    if (dismissed === 'true') {
        dispatch({ type: 'DISMISS_DISCLAIMER' });
    }

    const worker = workerLoader();
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { type, payload } = event.data;
      switch (type) {
        case 'solution':
          dispatch({ type: 'WORKER_SOLUTION', payload: payload as Solution[] });
          break;
        case 'progress':
          dispatch({ type: 'WORKER_PROGRESS', payload: payload as ProgressState });
          break;
        case 'done':
          dispatch({ type: 'WORKER_DONE', payload: payload as Solution[] });
          setTimeout(() => dispatch({ type: 'SET_MESSAGE', payload: null }), 3000);
          break;
        case 'error':
          dispatch({ type: 'WORKER_ERROR', payload: (payload as { message: string }).message });
          break;
      }
    };

    const loadWordlist = async () => {
      try {
        const response = await fetch(`/wordlists/${selectedLanguage}.txt`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        dispatch({ type: 'SET_WORD_LIST', payload: text });
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', payload: `Failed to load default wordlist: ${e.message}` });
        dispatch({ type: 'SET_WORD_LIST', payload: '' });
      }
    };

    loadWordlist();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [selectedLanguage]);


  const handlePrepareWordlist = useCallback(() => {
    const rawWords = wordListInput.split(/[^a-zA-ZäöüÄÖÜß]+/).map(w => w.trim()).filter(Boolean);
    const uniqueIsograms = new Set<string>();
    rawWords.forEach(word => {
      const cleaned = cleanAndCheckIsogram(word);
      if (cleaned) uniqueIsograms.add(cleaned);
    });
    const sortedIsograms = Array.from(uniqueIsograms).sort((a, b) => b.length - a.length);
    dispatch({ type: 'SET_WORD_LIST', payload: sortedIsograms.join('\n') });
    dispatch({ type: 'SET_MESSAGE', payload: `Prepared wordlist: ${sortedIsograms.length} unique isograms found.` });
    setTimeout(() => dispatch({ type: 'SET_MESSAGE', payload: null }), 3000);
  }, [wordListInput]);

  const parsedEntriesCount = useMemo<number>(() => {
    return wordListInput.split(/\n/).map(l => l.trim()).filter(Boolean).filter(isIsogram).length;
  }, [wordListInput]);

  const handleSearch = useCallback(() => {
    if (isSearching || !workerRef.current) return;
    dispatch({ type: 'START_SEARCH' });
    workerRef.current.postMessage({
      type: 'start-search',
      payload: { wordList: wordListInput, settings: settings },
    });
  }, [isSearching, wordListInput, settings]);

  const handleCancelSearch = useCallback(() => {
    if (!isSearching || !workerRef.current) return;
    workerRef.current.postMessage({ type: 'cancel-search' });
    dispatch({ type: 'CANCEL_SEARCH' });
    setTimeout(() => dispatch({ type: 'SET_MESSAGE', payload: null }), 3000);
  }, [isSearching]);

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    if (activeTab === 'score') {
      return sorted.sort((a, b) => b.score - a.score);
    }
    return sorted.sort((a, b) => b.len - a.len || b.score - a.score);
  }, [results, activeTab]);

  const { topN } = settings;
  const displayedResults = topN > 0 ? sortedResults.slice(0, topN) : sortedResults;

  return (
    <div className="min-h-screen bg-indigo-50 text-indigo-900 font-sans">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">Interactive Isogram Finder</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-indigo-700">A web-based tool to find meaningful combinations of unique-character words.</p>
        </div>

        {/* Disclaimer for generated content */}
        {showDisclaimer && (
            <div className="relative flex items-center gap-4 bg-amber-100 border-l-4 border-amber-600 text-amber-800 p-4 rounded-r-xl mb-6">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                    <p className="font-bold">Important Note on Generated Content</p>
                    <p className="break-words">Please note: This tool algorithmically combines words from the text files you provide. The results are automatically generated and not editorially reviewed. Therefore, it is possible that random word combinations may unintentionally appear offensive, insulting, or inappropriate. Use at your own risk.</p>
                </div>
                <button
                    onClick={handleDismissDisclaimer}
                    aria-label="Dismiss disclaimer"
                    className="text-amber-600 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-600 rounded"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Controls */}
          <div className="lg:col-span-2 space-y-8">
            <WordlistPanel
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={(lang) => dispatch({ type: 'SET_LANGUAGE', payload: lang })}
              wordListInput={wordListInput}
              setWordListInput={(text) => dispatch({ type: 'SET_WORD_LIST', payload: text })}
              isSearching={isSearching}
              parsedEntriesCount={parsedEntriesCount}
              handlePrepareWordlist={handlePrepareWordlist}
              setMessage={(msg) => dispatch({ type: 'SET_MESSAGE', payload: msg })}
              setError={(err) => dispatch({ type: 'SET_ERROR', payload: err })}
              cn={cn}
            />

            <SettingsPanel
              settings={settings}
              setSettings={(update) => dispatch({ type: 'SET_SETTINGS', payload: update })}
              isSearching={isSearching}
              parsedEntriesCount={parsedEntriesCount}
              handleSearch={handleSearch}
              handleCancelSearch={handleCancelSearch}
              cn={cn}
            />
          </div>

          {/* Right Column: Results */}
          <ResultsPanel
            error={error}
            setError={setError}
            message={message}
            setMessage={setMessage}
            isSearching={isSearching}
            progress={progress}
            results={results}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            displayedResults={displayedResults}
            cn={cn}
          />
        </div>
      </main>
    </div>
  );
};

export default IsogramFinderPage;