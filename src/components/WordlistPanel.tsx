import { FC, useRef, useCallback } from 'react';
import { FileText } from 'lucide-react';

type CnFunction = (...inputs: any[]) => string;

interface WordlistPanelProps {
  selectedLanguage: 'de' | 'en';
  setSelectedLanguage: (lang: 'de' | 'en') => void;
  wordListInput: string;
  setWordListInput: (text: string) => void;
  isSearching: boolean;
  parsedEntriesCount: number;
  handlePrepareWordlist: () => void;
  setMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  cn: CnFunction;
}

const WordlistPanel: FC<WordlistPanelProps> = ({
  selectedLanguage,
  setSelectedLanguage,
  wordListInput,
  setWordListInput,
  isSearching,
  parsedEntriesCount,
  handlePrepareWordlist,
  setMessage,
  setError,
  cn,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveWordlist = useCallback(() => {
    try {
      const blob = new Blob([wordListInput], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'isogram_wordlist.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setMessage('Wordlist saved successfully!');
    } catch (e: any) {
      setError(`Failed to save wordlist: ${e.message}`);
    }
  }, [wordListInput, setMessage, setError]);

  const handleLoadWordlist = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result as string;
      setWordListInput(contents);
      setMessage('Wordlist loaded successfully!');
    };
    reader.onerror = (event) => {
      setError(`Failed to read file: ${event.target?.error?.message || 'Unknown error'}`);
    };
    reader.readAsText(file);
    // Reset the input value so the same file can be loaded again
    e.target.value = '';
  };


  return (
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".txt,text/plain"
        className="hidden"
      />
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-indigo-500">Loaded {parsedEntriesCount} valid isograms.</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSaveWordlist}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Save Wordlist As...
          </button>
          <button
            onClick={handleLoadWordlist}
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
  );
};

export default WordlistPanel;
