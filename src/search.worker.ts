// This is the main logic for the Isogram Finder, designed to run in a Web Worker.
// It's a self-contained script with no direct access to the DOM or the main React app.

// --- TYPES & INTERFACES ---
// Make sure these are exported so the main thread can use them for type safety.
export type IsogramEntry = {
  word: string;
  length: number;
  chars: Set<string>;
  prefix2: string;
  prefix3: string;
  suffix2: string;
  suffix3: string;
};

export type Solution = {
  words: IsogramEntry[];
  len: number;
  score: number;
};

export type ProgressState = {
  longest: Solution | null;
  bestScore: Solution | null;
  solutionsFound: number;
  wordsScanned: number;
};

export type SearchSettings = {
  minLen: number;
  maxLen: number;
  topN: number;
  searchMode: 'classic' | 'split' | 'high-low';
  startSize: number; // For 'split' mode
  highLowTopPercent: number; // For 'high-low' mode
  highLowBottomPercent: number; // For 'high-low' mode
};

// --- MESSAGE STRUCTURE for communication between worker and main thread ---
export type WorkerMessage = {
  type: 'start-search' | 'cancel-search' | 'solution' | 'progress' | 'done' | 'error';
  payload?: any;
};


// --- GLOBAL STATE for the worker ---
let isSearching = false;
let solutionsFound = 0;
let topByScore: Solution[] = [];
let topByLength: Solution[] = [];

let progressState: ProgressState = {
  longest: null,
  bestScore: null,
  solutionsFound: 0,
  wordsScanned: 0,
};
// Timestamps for throttling updates
let lastProgressUpdate = 0;
let lastSolutionUpdate = 0;
let hasSentFirstSolutions = false;

// --- CONSTANTS ---
const PROGRESS_THROTTLE_MS = 100; // Send progress updates at most every 100ms
const INITIAL_SOLUTION_THROTTLE_MS = 500; // First update after 500ms
const REGULAR_SOLUTION_THROTTLE_MS = 3000; // Subsequent updates every 3s
const MIN_WORD_LEN_FOR_HIGH_LOW = 4; // For high-low mode, ignore words shorter than this

// --- HELPER FUNCTIONS ---

const getUtf8Slice = (word: string, n: number, fromEnd = false): string => {
  const chars = [...word];
  if (fromEnd) {
    return chars.slice(Math.max(0, chars.length - n)).join('');
  }
  return chars.slice(0, n).join('');
};

const isIsogram = (word: string): boolean => {
  const chars = [...word];
  const uniqueChars = new Set(chars);
  return chars.length === uniqueChars.size;
};

const cleanAndCheckIsogram = (word: string): string | null => {
  const cleanedWord = word.toLowerCase().replace(/[^a-zäöüß]/g, '').trim();
  if (cleanedWord.length > 0 && isIsogram(cleanedWord)) {
    return cleanedWord;
  }
  return null;
};

const SUFFIXES = [
    "ung", "keit", "heit", "schaft", "tum", "ion", "ismus", "ist", "ling", "erei",
    "ler", "ner", "chen", "lein", "nis", "sal", "in", "enz", "anz", "or", "ör", "ität", "ment", "age", "ur",
    "tät", "ik", "loge", "iker", "graph", "gramm", "tion", "eur", "eurin", "euren", "ation",
    "logie", "phie", "är", "ärin", "ärchen", "sel", "er", "erin"
];
const PREFIXES = [
    "un", "ver", "be", "ent", "er", "ab", "auf", "aus", "an", "ein", "mit", "nach",
    "über", "um", "unter", "vor", "wider", "zer", "zurück", "zu", "bei", "fort",
    "gegen", "her", "hin", "los", "miss", "wieder", "ur", "voll", "zwischen",
    "durch", "ober", "nieder", "heim", "fern", "manch", "viel", "wenig", "hoch",
    "fehl", "ge", "trans", "auto", "anti", "ex", "prä", "post", "sub", "super",
    "inter", "infra", "hyper", "para", "mono", "poly", "tri", "multi", "bi", "semi",
    "ko", "kontra", "re", "pseudo", "quasi", "neo", "sozio"
];
const LINKING_ELEMENTS = [
    "s", "es", "n", "en", "er", "e"
];

const computeScore = (combo: IsogramEntry[]): number => {
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

const sendUpdate = () => {
    const combined = new Map<string, Solution>();
    for (const s of topByScore) combined.set(s.words.map(w => w.word).join(''), s);
    for (const s of topByLength) combined.set(s.words.map(w => w.word).join(''), s);

    if (combined.size > 0) {
        postMessage({ type: 'solution', payload: Array.from(combined.values()) });
        if (!hasSentFirstSolutions) {
            hasSentFirstSolutions = true;
        }
    }
    lastSolutionUpdate = Date.now();
}

// --- CORE BACKTRACKING ALGORITHM ---

const backtrack = (
  list: IsogramEntry[],
  index: number,
  currentCombo: IsogramEntry[],
  currentChars: Set<string>,
  currentLen: number,
  settings: SearchSettings
) => {
  if (!isSearching) return; // Stop if a cancel message was received

  const now = Date.now();
  // Throttle progress updates
  if (now - lastProgressUpdate > PROGRESS_THROTTLE_MS) {
    postMessage({ type: 'progress', payload: { ...progressState } });
    lastProgressUpdate = now;
  }

  // Two-stage solution throttling
  const solutionThrottle = hasSentFirstSolutions ? REGULAR_SOLUTION_THROTTLE_MS : INITIAL_SOLUTION_THROTTLE_MS;
  if (now - lastSolutionUpdate > solutionThrottle) {
      sendUpdate();
  }


  // Check if the current combination is a valid solution
  if (currentCombo.length > 0 && currentLen >= settings.minLen && (settings.maxLen === 0 || currentLen <= settings.maxLen)) {
    const score = computeScore(currentCombo);
    const candidate: Solution = { words: [...currentCombo], len: currentLen, score };

    solutionsFound++;
    progressState.solutionsFound = solutionsFound;

    // Update best/longest trackers for progress display
    if (!progressState.longest || candidate.len > progressState.longest.len) {
      progressState.longest = candidate;
    }
    if (!progressState.bestScore || candidate.score > progressState.bestScore.score) {
      progressState.bestScore = candidate;
    }

    // Add to top lists if it qualifies
    if (settings.topN > 0) {
        // Top by Score
        if (topByScore.length < settings.topN || candidate.score > topByScore[topByScore.length - 1].score) {
            topByScore.push(candidate);
            topByScore.sort((a, b) => b.score - a.score);
            if (topByScore.length > settings.topN) topByScore.pop();
        }
        // Top by Length
        if (topByLength.length < settings.topN || candidate.len > topByLength[topByLength.length - 1].len) {
            topByLength.push(candidate);
            topByLength.sort((a, b) => b.len - a.len || b.score - a.score);
            if (topByLength.length > settings.topN) topByLength.pop();
        }
    } else {
        // If topN is 0, we collect all solutions (though this can be memory intensive)
        topByScore.push(candidate);
        topByLength.push(candidate);
    }
  }

  // Pruning: Stop if the max length is reached
  if (settings.maxLen > 0 && currentLen >= settings.maxLen) return;

  // Explore next candidates
  for (let i = index; i < list.length; i++) {
    if (!isSearching) return; // Check for cancellation signal

    const nextWord = list[i];
    progressState.wordsScanned++;

    // Check for character conflicts
    let hasConflict = false;
    for (const char of nextWord.chars) {
      if (currentChars.has(char)) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      // Recurse
      currentCombo.push(nextWord);
      for (const char of nextWord.chars) currentChars.add(char);

      backtrack(list, i + 1, currentCombo, currentChars, currentLen + nextWord.length, settings);

      // Backtrack
      for (const char of nextWord.chars) currentChars.delete(char);
      currentCombo.pop();
    }
  }
};

// --- MAIN SEARCH FUNCTION ---

const performSearch = (wordList: string, settings: SearchSettings) => {
  try {
    // 1. Reset state
    isSearching = true;
    solutionsFound = 0;
    topByScore = [];
    topByLength = [];
    progressState = {
      longest: null,
      bestScore: null,
      solutionsFound: 0,
      wordsScanned: 0,
    };
    const now = Date.now();
    lastProgressUpdate = now;
    lastSolutionUpdate = now;
    hasSentFirstSolutions = false;


    // 2. Prepare word list
    const rawWords = wordList.split(/\n/).map(l => l.trim()).filter(Boolean);
    const uniqueIsograms = new Set<string>();
    rawWords.forEach(word => {
      const cleaned = cleanAndCheckIsogram(word);
      if (cleaned) {
        uniqueIsograms.add(cleaned);
      }
    });

    const parsedEntries: IsogramEntry[] = Array.from(uniqueIsograms).map(line => ({
      word: line,
      length: [...line].length,
      chars: new Set([...line]),
      prefix2: getUtf8Slice(line, 2),
      prefix3: getUtf8Slice(line, 3),
      suffix2: getUtf8Slice(line, 2, true),
      suffix3: getUtf8Slice(line, 3, true),
    })).sort((a, b) => b.length - a.length);

    // 3. Run backtracking algorithm based on selected mode
    if (settings.searchMode === 'classic') {
      backtrack(parsedEntries, 0, [], new Set(), 0, settings);
    } else if (settings.searchMode === 'split') {
      // Corrected 'split' mode logic:
      // Iterate through the top 'startSize' words as starting points.
      const startEntries = parsedEntries.slice(0, Math.min(settings.startSize, parsedEntries.length));

      for (let i = 0; i < startEntries.length; i++) {
        if (!isSearching) break;
        const startWord = startEntries[i];
        const initialCombo = [startWord];
        const initialChars = new Set(startWord.chars);
        const initialLen = startWord.length;
        
        // For each start word, run a backtrack search on the *rest* of the main list
        // to avoid duplicate combinations and ensure correctness.
        backtrack(parsedEntries, i + 1, initialCombo, initialChars, initialLen, settings);
      }
    } else if (settings.searchMode === 'high-low') {
        const topCount = Math.floor(parsedEntries.length * (settings.highLowTopPercent / 100));
        const bottomCount = Math.floor(parsedEntries.length * (settings.highLowBottomPercent / 100));

        const topWords = parsedEntries.slice(0, topCount);
        
        // For bottom words, we reverse the list to get the shortest, then filter by min length
        const bottomWords = parsedEntries.slice().reverse()
            .filter(w => w.length >= MIN_WORD_LEN_FOR_HIGH_LOW)
            .slice(0, bottomCount);

        const highLowList = [...topWords, ...bottomWords]
            // Remove duplicates in case of overlap
            .filter((word, index, self) => self.findIndex(w => w.word === word.word) === index)
            // Re-sort by length, as backtrack expects it
            .sort((a, b) => b.length - a.length);
        
        backtrack(highLowList, 0, [], new Set(), 0, settings);
    }

    // 4. Final sort and send results
    if (isSearching) { // Check if it wasn't cancelled
        const combined = new Map<string, Solution>();
        // If topN was 0, the lists might be huge. Sort them once here.
        if (settings.topN === 0) {
            topByScore.sort((a, b) => b.score - a.score);
        }
        for (const s of topByScore) combined.set(s.words.map(w => w.word).join(''), s);
        for (const s of topByLength) combined.set(s.words.map(w => w.word).join(''), s);
        postMessage({ type: 'done', payload: Array.from(combined.values()) });
    }
  } catch (e: any) {
    postMessage({ type: 'error', payload: { message: e.message } });
  } finally {
    isSearching = false;
  }
};

// --- WORKER MESSAGE HANDLER ---

// eslint-disable-next-line no-restricted-globals
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'start-search':
      if (isSearching) return; // Ignore if a search is already running
      const { wordList, settings } = payload;
      performSearch(wordList, settings);
      break;

    case 'cancel-search':
      if (isSearching) {
        isSearching = false;
        // Optionally send a confirmation that cancellation was received
      }
      break;
  }
};