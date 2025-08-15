import { FC } from 'react';
import { AlertCircle, X, Cpu, ListOrdered, Star } from 'lucide-react';
import type { Solution, ProgressState } from '../search.worker';
import SolutionCard from './SolutionCard';

// A helper function to combine class names, passed as a prop.
type CnFunction = (...inputs: any[]) => string;

interface ResultsPanelProps {
  error: string | null;
  setError: (error: string | null) => void;
  message: string | null;
  setMessage: (message: string | null) => void;
  isSearching: boolean;
  progress: ProgressState;
  results: Solution[];
  activeTab: 'score' | 'length';
  setActiveTab: (tab: 'score' | 'length') => void;
  displayedResults: Solution[];
  cn: CnFunction;
}

const ResultsPanel: FC<ResultsPanelProps> = ({
  error,
  setError,
  message,
  setMessage,
  isSearching,
  progress,
  results,
  activeTab,
  setActiveTab,
  displayedResults,
  cn,
}) => {
  return (
    <div className="lg:col-span-3 flex flex-col space-y-6 [&>*]:w-full">
      {/* Error and Message displays - always visible at the top */}
      {error && (
        <div className="relative flex items-center gap-4 bg-red-100 border-l-4 border-red-600 text-red-800 p-4 rounded-r-xl mb-6">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Error</p>
            <p className="break-words">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {message && (
        <div className="relative flex items-center gap-4 bg-green-100 border-l-4 border-green-600 text-green-800 p-4 rounded-r-xl mb-6">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Message</p>
            <p className="break-words">{message}</p>
          </div>
          <button
            onClick={() => setMessage(null)}
            aria-label="Dismiss message"
            className="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {isSearching && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md mb-6">
          <div className="flex items-center text-xl font-bold text-indigo-900 mb-4">
            <Cpu className="w-6 h-6 mr-3 text-indigo-600 animate-pulse" />
            Search in Progress...
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-indigo-100 p-4 rounded-xl shadow-inner">
              <p className="text-indigo-600 font-semibold">Longest Found</p>
              <p className="font-semibold text-indigo-800 truncate mt-1" title={progress.longest ? progress.longest.words.map(w => w.word).join(' + ') : undefined}>
                {progress.longest ? `${progress.longest.words.map(w=>w.word).join('')} (${progress.longest.len})` : 'N/A'}
              </p>
            </div>
            <div className="bg-indigo-100 p-4 rounded-xl shadow-inner">
              <p className="text-indigo-600 font-semibold">Best Score</p>
              <p className="font-semibold text-indigo-800 truncate mt-1" title={progress.bestScore ? progress.bestScore.words.map(w => w.word).join(' + ') : undefined}>
                {progress.bestScore ? `${progress.bestScore.words.map(w=>w.word).join('')} (${progress.bestScore.score.toFixed(2)})` : 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-indigo-500">Scanned {progress.wordsScanned.toLocaleString()} combinations... Found {progress.solutionsFound} candidates.</div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div>
            <div className="flex border-b border-indigo-200">
              <button
                onClick={() => setActiveTab('score')}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-4 -mb-px cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-indigo-400',
                  activeTab === 'score'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-500 hover:text-indigo-700'
                )}
              >
                <Star className="w-4 h-4" /> Top by Score
              </button>
              <button
                onClick={() => setActiveTab('length')}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-4 -mb-px cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-indigo-400',
                  activeTab === 'length'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-500 hover:text-indigo-700'
                )}
              >
                <ListOrdered className="w-4 h-4" /> Top by Length
              </button>
            </div>
          </div>
          <div className="space-y-5">
            {displayedResults.map((sol, i) => (
              <SolutionCard key={sol.words.map(w=>w.word).join('-')} solution={sol} rank={i + 1} />
            ))}
          </div>
        </>
      )}

      {!isSearching && results.length === 0 && !error && !message && (
        <div className="flex flex-col items-center justify-center text-center bg-white p-12 rounded-2xl border-2 border-dashed border-indigo-300">
          <div className="bg-indigo-100 p-6 rounded-full">
            <ListOrdered className="w-14 h-14 text-indigo-600" />
          </div>
          <h3 className="mt-8 text-2xl font-semibold text-indigo-900">Results will appear here</h3>
          <p className="mt-3 max-w-md text-indigo-600">Configure your search and click <span className="font-semibold">"Find Isograms"</span> to begin exploring unique word combinations.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
