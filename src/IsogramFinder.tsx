import { useState, useMemo, useCallback, FC, useRef } from 'react';
import { FileText, Settings, Cpu, ListOrdered, Star, AlertCircle, Wand2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILITY: Combining Tailwind classes safely ---
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// --- TYPES & INTERFACES ---
type IsogramEntry = {
  word: string;
  length: number;
  chars: Set<string>;
  prefix2: string;
  prefix3: string;
  suffix2: string;
  suffix3: string;
};

type Solution = {
  words: IsogramEntry[];
  len: number;
  score: number;
};

type ProgressState = {
  longest: Solution | null;
  bestScore: Solution | null;
  solutionsFound: number;
  wordsScanned: number;
};

type SearchSettings = {
  minLen: number;
  maxLen: number;
  topN: number;
  searchMode: 'classic' | 'split';
  startSize: number;
  fillSize: number;
};

// --- CORE LOGIC (Exported for testing) ---

export const getUtf8Slice = (word: string, n: number, fromEnd = false): string => {
  const chars = [...word];
  if (fromEnd) {
    return chars.slice(Math.max(0, chars.length - n)).join('');
  }
  return chars.slice(0, n).join('');
};

export const SUFFIXES = [
    "ung", "keit", "heit", "schaft", "tum", "ion", "ismus", "ist", "ling", "erei",
    "ler", "ner", "chen", "lein", "nis", "sal", "in", "enz", "anz", "or", "ör", "ität", "ment", "age", "ur",
    "tät", "ik", "loge", "iker", "graph", "gramm", "tion", "eur", "eurin", "euren", "ation",
    "logie", "phie", "är", "ärin", "ärchen", "sel", "er", "erin"
];
export const PREFIXES = [
    "un", "ver", "be", "ent", "er", "ab", "auf", "aus", "an", "ein", "mit", "nach",
    "über", "um", "unter", "vor", "wider", "zer", "zurück", "zu", "bei", "fort",
    "gegen", "her", "hin", "los", "miss", "wieder", "ur", "voll", "zwischen",
    "durch", "ober", "nieder", "heim", "fern", "manch", "viel", "wenig", "hoch",
    "fehl", "ge", "trans", "auto", "anti", "ex", "prä", "post", "sub", "super",
    "inter", "infra", "hyper", "para", "mono", "poly", "tri", "multi", "bi", "semi",
    "ko", "kontra", "re", "pseudo", "quasi", "neo", "sozio"
];
export const LINKING_ELEMENTS = [
    "s", "es", "n", "en", "er", "e"
];

export const computeScore = (combo: IsogramEntry[]): number => {
  let score = 0.0;
  for (let i = 0; i < combo.length; ++i) {
    const w = combo[i];
    score += Math.pow(w.length, 1.3);
    if (w.length >= 8) score += 5;
    if (w.length <= 3) score -= 3;
    if (i > 0) {
      const prev = combo[i - 1];
      if (prev.suffix2 === w.prefix2) score += 3.5;
      if (prev.suffix3 === w.prefix3) score += 5.0;
      if (SUFFIXES.some(suf => prev.suffix3.endsWith(suf) || prev.suffix2.endsWith(suf))) score += 3.0;
      if (PREFIXES.some(pre => w.prefix3.startsWith(pre) || w.prefix2.startsWith(pre))) score += 5.0;
      for (const linkingElement of LINKING_ELEMENTS) {
        if (prev.word.endsWith(linkingElement) && w.word.startsWith(linkingElement)) {
          score += 4.0;
          break;
        }
        else if (prev.word.endsWith(linkingElement) && linkingElement.length > 0 && w.word.startsWith(linkingElement.slice(0, w.word.length - prev.word.length + linkingElement.length))) {
            score += 2.0;
            break;
        }
      }
    }
  }
  if (combo.length > 4) score -= (combo.length - 4) * 1.5;
  return score;
};

export const isIsogram = (word: string): boolean => {
  const chars = [...word];
  const uniqueChars = new Set(chars);
  return chars.length === uniqueChars.size;
};

export const cleanAndCheckIsogram = (word: string): string | null => {
  const cleanedWord = word.toLowerCase().replace(/[^a-zäöüß]/g, '').trim();
  if (cleanedWord.length > 0 && isIsogram(cleanedWord)) {
    return cleanedWord;
  }
  return null;
};


// --- UI COMPONENTS ---

const SettingsSlider: FC<{ label: string; value: number; min: number; max: number; step?: number; onChange: (val: number) => void; unit?: string; help?: string; }> =
({ label, value, min, max, step = 1, onChange, unit = '', help }) => (
  <div className="space-y-2">
    <label className="flex justify-between items-center text-sm font-medium text-slate-700">
      <span>{label}</span>
      <span className="text-indigo-700 font-semibold">{value}{unit}</span>
    </label>
    {help && <p className="text-xs text-slate-500 -mt-1">{help}</p>}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-3 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  </div>
);

const SolutionCard: FC<{ solution: Solution; rank: number }> = ({ solution, rank }) => (
  <div className="w-full bg-gradient-to-r from-indigo-50 to-white p-4 rounded-xl border border-indigo-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start">
      <p className="text-lg font-semibold text-indigo-900 break-words">
        <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-3 select-none">#{rank}</span>
        {solution.words.map(w => w.word).join('')}
      </p>
      <div className="flex flex-col items-end ml-4 flex-shrink-0">
        <span className="font-bold text-indigo-700 text-lg tabular-nums">{solution.len}</span>
        <span className="text-xs text-indigo-500">Length</span>
      </div>
    </div>
    <div className="flex justify-between items-end mt-3 pt-3 border-t border-indigo-100">
        <div className="text-sm text-indigo-700 font-medium truncate">
            {solution.words.map(w => w.word).join(' + ')}
        </div>
        <div className="flex flex-col items-end">
            <span className="font-bold text-amber-600 text-md tabular-nums">{solution.score.toFixed(2)}</span>
            <span className="text-xs text-indigo-500">Score</span>
        </div>
    </div>
  </div>
);

const IsogramFinderPage: FC = () => {
  const [wordListInput, setWordListInput] = useState(
    `haus
baum
katze
hund
vogel
fisch
maus
pferd
ziege
schaf
ente
gans
wolf
fuchs
bär
reh
elch
spinne
biene
ameise
käfer
schlange
eule
adler
falke
rabe
drossel
meise
sperling
star
kuckuck
lerche
schwan
kranich
reiher
storch
pinguin
robbe
wal
delfin
haifisch
krake
qual
jux
quiz
typ
gym
job
chef
mut`
  );
  const [settings, setSettings] = useState<SearchSettings>({
    minLen: 10,
    maxLen: 0,
    topN: 10,
    searchMode: 'classic',
    startSize: 40,
    fillSize: 80,
  });
  const [results, setResults] = useState<Solution[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchControllerRef = useRef<AbortController | null>(null);
  const allSolutionsRef = useRef<Solution[]>([]);
  const [progress, setProgress] = useState<ProgressState>({ longest: null, bestScore: null, solutionsFound: 0, wordsScanned: 0 });
  const [activeTab, setActiveTab] = useState<'score' | 'length'>('score');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveWordlistAs = useCallback(async () => {
    try {
      // @ts-ignore
      const fileHandle = await window.showSaveFilePicker({
        types: [{
          description: 'Text Files',
          accept: {
            'text/plain': ['.txt'],
          },
        }],
        suggestedName: 'isogram_wordlist.txt',
      });
      const writable = await fileHandle.createWritable();
      await writable.write(wordListInput);
      await writable.close();
      setMessage('Wordlist saved successfully!');
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setMessage('Save operation cancelled.');
      } else {
        setError(`Failed to save wordlist: ${e.message}`);
      }
    }
  }, [wordListInput]);

  const handleLoadWordlistFromFile = useCallback(async () => {
    try {
      // @ts-ignore
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'Text Files',
          accept: {
            'text/plain': ['.txt'],
          },
        }],
        multiple: false,
      });
      const file = await fileHandle.getFile();
      const contents = await file.text();
      setWordListInput(contents);
      setMessage('Wordlist loaded successfully!');
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setMessage('Load operation cancelled.');
      } else {
        setError(`Failed to load wordlist: ${e.message}`);
      }
    }
  }, []);

  const handlePrepareWordlist = useCallback(() => {
    const rawWords = wordListInput.split(/[^a-zA-ZäöüÄÖÜß]+/).map(w => w.trim()).filter(Boolean);
    const uniqueIsograms = new Set<string>();

    rawWords.forEach(word => {
      const cleaned = cleanAndCheckIsogram(word);
      if (cleaned) {
        uniqueIsograms.add(cleaned);
      }
    });

    const sortedIsograms = Array.from(uniqueIsograms).sort((a, b) => b.length - a.length);
    setWordListInput(sortedIsograms.join('\n'));
    setMessage(`Prepared wordlist: ${sortedIsograms.length} unique isograms found.`);
    setTimeout(() => setMessage(null), 3000);
  }, [wordListInput]);

  const parsedEntries = useMemo<IsogramEntry[]>(() => {
    const lines = wordListInput.split(/\n/).map(l => l.trim()).filter(Boolean);
    const entries: IsogramEntry[] = [];
    for (const line of lines) {
      const chars = [...line];
      const uniqueChars = new Set(chars);
      if (chars.length === uniqueChars.size) {
        entries.push({
          word: line,
          length: chars.length,
          chars: uniqueChars,
          prefix2: getUtf8Slice(line, 2),
          prefix3: getUtf8Slice(line, 3),
          suffix2: getUtf8Slice(line, 2, true),
          suffix3: getUtf8Slice(line, 3, true),
        });
      }
    }
    return entries.sort((a, b) => b.length - a.length);
  }, [wordListInput]);

  const handleSearch = useCallback(async () => {
    if (isSearching) return;
    setIsSearching(true);
    setError(null);
    setResults([]);
    setProgress({ longest: null, bestScore: null, solutionsFound: 0, wordsScanned: 0 });

    const controller = new AbortController();
    searchControllerRef.current = controller;
    const { signal } = controller;

    const { minLen, maxLen, searchMode, startSize, fillSize } = settings;
    allSolutionsRef.current = [];
    let progressState: ProgressState = { longest: null, bestScore: null, solutionsFound: 0, wordsScanned: 0 };

    const backtrack = async (list: IsogramEntry[], index: number, currentCombo: IsogramEntry[], currentChars: Set<string>, currentLen: number) => {
      if (signal.aborted) return;

      if (progressState.wordsScanned++ % 5000 === 0) {
        setProgress({ ...progressState });
        const currentSortedResults = [...allSolutionsRef.current].sort((a, b) => b.score - a.score || b.len - a.len);
        setResults(currentSortedResults.slice(0, settings.topN));
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      if (currentCombo.length > 0 && currentLen >= minLen && (maxLen === 0 || currentLen <= maxLen)) {
        const score = computeScore(currentCombo);
        const candidate: Solution = { words: [...currentCombo], len: currentLen, score };

        allSolutionsRef.current.push(candidate);

        const currentSortedResults = [...allSolutionsRef.current].sort((a, b) => b.score - a.score || b.len - a.len);
        setResults(currentSortedResults.slice(0, settings.topN));

        if (progressState.wordsScanned % 5000 === 0) {
          setProgress({ ...progressState });
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (!progressState.longest || candidate.len > progressState.longest.len) {
          progressState.longest = candidate;
        }
        if (!progressState.bestScore || candidate.score > progressState.bestScore.score) {
          progressState.bestScore = candidate;
        }
        progressState.solutionsFound = allSolutionsRef.current.length;
      }

      if (maxLen > 0 && currentLen >= maxLen) return;

      for (let i = index; i < list.length; i++) {
        if (signal.aborted) return;

        const nextWord = list[i];
        let hasConflict = false;
        for (const char of nextWord.chars) {
          if (currentChars.has(char)) {
            hasConflict = true;
            break;
          }
        }

        if (!hasConflict) {
          currentCombo.push(nextWord);
          for (const char of nextWord.chars) currentChars.add(char);
          progressState.wordsScanned++;
          await backtrack(list, i + 1, currentCombo, currentChars, currentLen + nextWord.length);
          for (const char of nextWord.chars) currentChars.delete(char);
          currentCombo.pop();
        }
      }
    };

    try {
      if (searchMode === 'classic') {
        await backtrack(parsedEntries, 0, [], new Set(), 0);
      } else {
        const startEntries = parsedEntries.slice(0, Math.min(startSize, parsedEntries.length));
        const fillEntries = parsedEntries.slice(0, Math.min(fillSize, parsedEntries.length));

        for (const startWord of startEntries) {
          if (signal.aborted) break;
          const initialCombo = [startWord];
          const initialChars = new Set(startWord.chars);
          const initialLen = startWord.length;
          await backtrack(fillEntries, 0, initialCombo, initialChars, initialLen);
        }
      }
    } catch (e) {
      if (signal.aborted) {
        setMessage('Search cancelled.');
      } else {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      }
    } finally {
      const finalSortedResults = [...allSolutionsRef.current].sort((a, b) => b.score - a.score || b.len - a.len);
      setResults(finalSortedResults.slice(0, settings.topN));
      setIsSearching(false);
      searchControllerRef.current = null;
    }
  }, [isSearching, settings, parsedEntries]);

  const handleCancelSearch = useCallback(() => {
    searchControllerRef.current?.abort();
  }, []);

  const sortedResults = useMemo(() => {
    if (activeTab === 'score') {
      return [...results].sort((a, b) => b.score - a.score);
    }
    return [...results].sort((a, b) => b.len - a.len || b.score - a.score);
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Controls */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md">
              <h2 className="flex items-center text-xl font-bold text-indigo-900 mb-4">
                <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                Wordlist
              </h2>
              <p className="text-sm text-indigo-600 mb-3">Paste your wordlist below, one word per line. Only isograms (words with unique letters) will be used.</p>
              <textarea
                value={wordListInput}
                onChange={(e) => setWordListInput(e.target.value)}
                disabled={isSearching}
                rows={12}
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:bg-indigo-100 disabled:cursor-not-allowed resize-none text-indigo-900 font-medium"
                placeholder="Donaudampfschiff...\nHeizöl...\nBoxkampf..."
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-indigo-500">Loaded {parsedEntries.length} valid isograms.</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSaveWordlistAs}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    Save Wordlist As...
                  </button>
                  <button
                    onClick={handleLoadWordlistFromFile}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    Load Wordlist From File...
                  </button>
                  <button
                    onClick={handlePrepareWordlist}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    Prepare Wordlist
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md">
              <h2 className="flex items-center text-xl font-bold text-indigo-900 mb-6">
                <Settings className="w-6 h-6 mr-3 text-indigo-600" />
                Configuration
              </h2>
              <div className="space-y-6">
                <SettingsSlider label="Minimum Length" value={settings.minLen} min={10} max={50} onChange={val => setSettings(s => ({...s, minLen: val}))} />
                <SettingsSlider label="Maximum Length" value={settings.maxLen} min={0} max={50} onChange={val => setSettings(s => ({...s, maxLen: val}))} help="0 for unlimited" />
                <SettingsSlider label="Top N Results" value={settings.topN} min={0} max={50} onChange={val => setSettings(s => ({...s, topN: val}))} help="0 for all" />
                
                <div>
                  <label className="text-sm font-medium text-indigo-700">Search Mode</label>
                  <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-indigo-100 p-1">
                    <button
                      onClick={() => setSettings(s => ({...s, searchMode: 'classic'}))}
                      className={cn(
                        'px-3 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400',
                        settings.searchMode === 'classic'
                          ? 'bg-white text-indigo-700 shadow-md'
                          : 'text-indigo-500 hover:bg-indigo-200'
                      )}
                    >Classic</button>
                    <button
                      onClick={() => setSettings(s => ({...s, searchMode: 'split'}))}
                      className={cn(
                        'px-3 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400',
                        settings.searchMode === 'split'
                          ? 'bg-white text-indigo-700 shadow-md'
                          : 'text-indigo-500 hover:bg-indigo-200'
                      )}
                    >Split</button>
                  </div>
                </div>
                <div className="mt-6">
                  {!isSearching ? (
                    <button
                      onClick={handleSearch}
                      disabled={parsedEntries.length === 0}
                      className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Wand2 className="w-5 h-5 mr-3" />
                      Find Isograms
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSearch}
                      className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <X className="w-5 h-5 mr-3" />
                      Cancel Search
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
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
        </div>
      </main>
    </div>
  );
};

export default IsogramFinderPage;