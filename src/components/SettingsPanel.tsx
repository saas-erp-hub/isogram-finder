import { FC } from 'react';
import { Settings, Wand2, X } from 'lucide-react';
import { SearchSettings } from '../search.worker';
import SettingsSlider from './SettingsSlider';

// A helper function to combine class names, passed as a prop.
type CnFunction = (...inputs: any[]) => string;

interface SettingsPanelProps {
  settings: SearchSettings;
  setSettings: (updater: (s: SearchSettings) => SearchSettings) => void;
  isSearching: boolean;
  parsedEntriesCount: number;
  handleSearch: () => void;
  handleCancelSearch: () => void;
  cn: CnFunction;
}

const SettingsPanel: FC<SettingsPanelProps> = ({
  settings,
  setSettings,
  isSearching,
  parsedEntriesCount,
  handleSearch,
  handleCancelSearch,
  cn,
}) => {
  return (
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
  );
};

export default SettingsPanel;
