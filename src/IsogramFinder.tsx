import { useState, useMemo, useCallback, FC, useRef, useEffect } from 'react';
import { FileText, Settings, Cpu, ListOrdered, Star, AlertCircle, Wand2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import workerLoader from './worker-loader';
import type { Solution, ProgressState, SearchSettings, WorkerMessage } from './search.worker';

// --- UTILITY: Combining Tailwind classes safely ---
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// --- CORE LOGIC (Exported for testing) ---
// These functions are now only used for UI preparation/display, not for the core search.
export const getUtf8Slice = (word: string, n: number, fromEnd = false): string => {
  const chars = [...word];
  if (fromEnd) {
    return chars.slice(Math.max(0, chars.length - n)).join('');
  }
  return chars.slice(0, n).join('');
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

const DEFAULT_GERMAN_WORDLIST = `qual
jux
quiz
typ
gym
job
chef
mut
fuchs
wolf
ente
gans
maus
fisch
vogel
hund
katze
baum
haus
wald
berg
fluss
wind
regen
wolke
blume
licht
leben
musik
stern
mond
sonne
stadt
dorf
land
meer
see
insel
strand
feld
wiese
biene
ameise
käfer
eule
adler
falke
rabe
star
lerche
schwan
kranich
reiher
storch
robbe
wal
delfin
krake
pinguin
haifisch
ziege
schaf
pferd
reh
elch
spinne
drossel
meise
sperling
kuckuck
typisch
schwarz
gelb
grün
blau
braun
weiß
rot
grau
rosa
lila
türkis
orange
silber
gold
bronze
kupfer
zink
blei
eisen
stahl
titan
nickel
chrom
kobalt
mangan
silizium
bor
fluor
neon
natrium
magnesium
aluminium
phosphor
schwefel
chlor
argon
kalium
kalzium
skandium
vanadium
gallium
germanium
arsen
selen
brom
krypton
rubidium
strontium
yttrium
zirkonium
niobium
molybdän
technetium
ruthenium
rhodium
palladium
indium
zinn
antimon
tellur
iod
xenon
cäsium
barium
lanthan
cer
praseodym
neodym
promethium
samarium
europium
gadolinium
terbium
dysprosium
holmium
erbium
thulium
ytterbium
lutetium
hafnium
tantal
wolfram
rhenium
osmium
iridium
platin
quecksilber
thallium
bismut
polonium
astat
radon
francium
radium
aktinium
thorium
protaktinium
uran
neptunium
plutonium
americium
curium
berkelium
californium
einsteinium
fermium
mendelevium
nobelium
lawrencium
rutherfordium
dubnium
seaborgium
bohrium
hassium
meitnerium
darmstadtium
röntgenium
copernicium
nihonium
flerovium
moscovium
livermorium
tennessine
oganesson
heizölrückstoßabdämpfung
rechtschreibreform
wissenschaft
unabhängig
gleichberechtigt
verantwortung
umweltschutz
nachhaltigkeit
demokratie
transparenz
kommunikation
integration
kooperation
innovation
digitalisierung
globalisierung
international
multikulturell
interdisziplinär
komplexität
flexibilität
produktivität
effizienz
optimierung
automatisierung
standardisierung
qualitätskontrolle
sicherheitskonzept
datenschutz
privatsphäre
urheberrecht
markenrecht
patentrecht
lizenzierung
zertifizierung
akkreditierung
evaluierung
dokumentation
visualisierung
analyse
synthese
hypothese
theorie
praxis
methode
strategie
taktik
konzept
modell
system
struktur
funktion
prozess
entwicklung
forschung
bildung
erziehung
gesundheit
ernährung
sport
kunst
kultur
geschichte
philosophie
psychologie
soziologie
ökonomie
politik
recht
ethik
moral
religion
spiritualität
philosophisch
psychologisch
soziologisch
ökonomisch
politisch
rechtlich
ethisch
moralisch
religiös
spirituell
`;

const DEFAULT_ENGLISH_WORDLIST = `qual
jux
quiz
typ
gym
job
chef
mut
fox
wolf
duck
goose
mouse
fish
bird
dog
cat
tree
house
forest
river
wind
rain
cloud
flower
light
life
music
star
moon
sun
city
town
land
sea
lake
island
beach
field
meadow
bee
ant
beetle
owl
eagle
falcon
raven
robin
tit
sparrow
starling
cuckoo
lark
swan
crane
heron
stork
penguin
seal
whale
dolphin
shark
octopus
goat
sheep
horse
deer
moose
spider
thrush
finch
wren
typical
black
yellow
green
blue
brown
white
red
gray
pink
purple
turquoise
orange
silver
gold
bronze
copper
zinc
lead
iron
steel
titanium
nickel
chromium
cobalt
manganese
silicon
boron
carbon
nitrogen
oxygen
fluorine
neon
sodium
magnesium
aluminum
phosphorus
sulfur
chlorine
argon
potassium
calcium
scandium
vanadium
gallium
germanium
arsenic
selenium
bromine
krypton
rubidium
strontium
yttrium
zirconium
niobium
molybdenum
technetium
ruthenium
rhodium
palladium
indium
tin
antimony
tellurium
iodine
xenon
cesium
barium
lanthanum
cerium
praseodymium
neodymium
promethium
samarium
europium
gadolinium
terbium
dysprosium
holmium
erbium
thulium
ytterbium
lutetium
hafnium
tantalum
tungsten
rhenium
osmium
iridium
platinum
mercury
thallium
bismuth
polonium
astatine
radon
francium
radium
actinium
thorium
protactinium
uranium
neptunium
plutonium
americium
curium
berkelium
californium
einsteinium
fermium
mendelevium
nobelium
lawrencium
rutherfordium
dubnium
seaborgium
bohrium
hassium
meitnerium
darmstadtium
roentgenium
copernicium
nihonium
flerovium
moscovium
livermorium
tennessine
oganesson
ambidextrous
uncopyrightable
subdermatoglyphic
hydroxyde
floccinaucinihilipilification
strengths
rhythms
lynx
jinx
quartz
boxcar
blacksmith
bricklayer
carpenter
dentist
engineer
fireman
gardener
handyman
inspector
jeweler
knight
lawyer
manager
nurse
officer
painter
quarterback
reporter
sailor
teacher
umbrella
violinist
watchmaker
xylophone
yachtsman
zeppelin
responsibility
environmental
sustainability
democracy
transparency
communication
integration
cooperation
innovation
digitalization
globalization
international
multicultural
interdisciplinary
complexity
flexibility
productivity
efficiency
optimization
automation
standardization
qualitycontrol
securityconcept
dataprotection
privacy
copyright
trademark
patentlaw
licensing
certification
accreditation
evaluation
documentation
visualization
analysis
synthesis
hypothesis
theory
practice
method
strategy
tactic
concept
model
system
structure
function
process
development
research
education
upbringing
health
nutrition
sport
art
culture
history
philosophy
psychology
sociology
economy
politics
law
ethics
morality
religion
spirituality
philosophical
psychological
sociological
economic
political
legal
ethical
moral
religious
spiritual
`;

const IsogramFinderPage: FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'de' | 'en'>('de'); // New state for language selection
  const [wordListInput, setWordListInput] = useState(DEFAULT_GERMAN_WORDLIST);
  const [settings, setSettings] = useState<SearchSettings>({
    minLen: 10,
    maxLen: 0,
    topN: 10,
    searchMode: 'classic',
    startSize: 40,
    highLowTopPercent: 20,
    highLowBottomPercent: 30,
  });
  const [results, setResults] = useState<Solution[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState<ProgressState>({ longest: null, bestScore: null, solutionsFound: 0, wordsScanned: 0 });
  const [activeTab, setActiveTab] = useState<'score' | 'length'>('score');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true); // Initial state

  useEffect(() => {
    // Check localStorage for disclaimer dismissal
    const dismissed = localStorage.getItem('disclaimerDismissed');
    if (dismissed === 'true') {
      setShowDisclaimer(false);
    }

    const worker = workerLoader();
    workerRef.current = worker;

    // Update wordlist when language changes
    if (selectedLanguage === 'de') {
      setWordListInput(DEFAULT_GERMAN_WORDLIST);
    } else {
      setWordListInput(DEFAULT_ENGLISH_WORDLIST);
    }

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { type, payload } = event.data;
      switch (type) {
        case 'solution':
          // In the new architecture, solutions are sent in batches.
          // We replace the current results with the new batch.
          setResults(payload as Solution[]);
          break;
        case 'progress':
          setProgress(payload as ProgressState);
          break;
        case 'done':
          setIsSearching(false);
          setMessage('Search finished!');
          // Final results are sent with the 'done' message
          setResults(payload as Solution[]);
          setTimeout(() => setMessage(null), 3000);
          break;
        case 'error':
          setError((payload as { message: string }).message);
          setIsSearching(false);
          break;
      }
    };

    // Cleanup function to terminate the worker when the component unmounts
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [selectedLanguage]); // Add selectedLanguage to dependency array

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

  const parsedEntriesCount = useMemo<number>(() => {
    return wordListInput.split(/\n/).map(l => l.trim()).filter(Boolean).filter(isIsogram).length;
  }, [wordListInput]);

  const handleSearch = useCallback(() => {
    if (isSearching || !workerRef.current) return;

    setIsSearching(true);
    setError(null);
    setMessage(null);
    setResults([]);
    setProgress({ longest: null, bestScore: null, solutionsFound: 0, wordsScanned: 0 });

    workerRef.current.postMessage({
      type: 'start-search',
      payload: {
        wordList: wordListInput,
        settings: settings,
      },
    });
  }, [isSearching, wordListInput, settings]);

  const handleCancelSearch = useCallback(() => {
    if (!isSearching || !workerRef.current) return;

    workerRef.current.postMessage({ type: 'cancel-search' });
    setIsSearching(false);
    setMessage('Search cancelled by user.');
    setTimeout(() => setMessage(null), 3000);
  }, [isSearching]);

  const handleDismissDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
    localStorage.setItem('disclaimerDismissed', 'true');
  }, []);

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    if (activeTab === 'score') {
      return sorted.sort((a, b) => b.score - a.score);
    } else {
      return sorted.sort((a, b) => b.len - a.len || b.score - a.score);
    }
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
            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md">
              <h2 className="flex items-center text-xl font-bold text-indigo-900 mb-4">
                <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                Wordlist
              </h2>
              <div className="flex justify-end mb-4">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-200",
                      selectedLanguage === 'de' ? "bg-indigo-600 text-white" : "bg-white text-gray-900 hover:bg-gray-100"
                    )}
                    onClick={() => setSelectedLanguage('de')}
                  >
                    Deutsch
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-200",
                      selectedLanguage === 'en' ? "bg-indigo-600 text-white" : "bg-white-white text-gray-900 hover:bg-gray-100"
                    )}
                    onClick={() => setSelectedLanguage('en')}
                  >
                    English
                  </button>
                </div>
              </div>
              <p className="text-sm text-indigo-600 mb-3">Paste your text here. Use the "Prepare Wordlist" button to extract and clean isograms from your input.</p>
              <textarea
                value={wordListInput}
                onChange={(e) => setWordListInput(e.target.value)}
                disabled={isSearching}
                rows={12}
                className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:bg-indigo-100 disabled:cursor-not-allowed resize-none text-indigo-900 font-medium"
                placeholder="Paste your text here. Use 'Prepare Wordlist' to extract isograms."
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-indigo-500">Loaded {parsedEntriesCount} valid isograms.</p>
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
                  <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-indigo-100 p-1">
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
                    <button
                      onClick={() => setSettings(s => ({...s, searchMode: 'high-low'}))}
                      className={cn(
                        'px-3 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400',
                        settings.searchMode === 'high-low'
                          ? 'bg-white text-indigo-700 shadow-md'
                          : 'text-indigo-500 hover:bg-indigo-200'
                      )}
                    >High-Low</button>
                  </div>
                </div>

                {settings.searchMode === 'split' && (
                  <SettingsSlider label="Start Size" value={settings.startSize} min={10} max={200} onChange={val => setSettings(s => ({...s, startSize: val}))} help="Number of longest words to use as starting points." />
                )}

                {settings.searchMode === 'high-low' && (
                  <>
                    <SettingsSlider label="Top Words %" value={settings.highLowTopPercent} min={5} max={50} onChange={val => setSettings(s => ({...s, highLowTopPercent: val}))} unit="%" help="Use the longest x% of words." />
                    <SettingsSlider label="Bottom Words %" value={settings.highLowBottomPercent} min={5} max={50} onChange={val => setSettings(s => ({...s, highLowBottomPercent: val}))} unit="%" help="Combine with the shortest x% of words (min 4 chars)." />
                  </>
                )}

                <div className="mt-6">
                  {!isSearching ? (
                    <button
                      onClick={handleSearch}
                      disabled={parsedEntriesCount === 0}
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