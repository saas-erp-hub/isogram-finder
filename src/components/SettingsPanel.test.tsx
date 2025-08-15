import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPanel from './SettingsPanel';
import { SearchSettings } from '../search.worker';

// A simple mock for the 'cn' utility function
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

describe('SettingsPanel', () => {
  it('should call setSettings when a search mode button is clicked', () => {
    const setSettingsMock = jest.fn();
    const initialSettings: SearchSettings = {
      minLen: 10,
      maxLen: 0,
      topN: 10,
      searchMode: 'classic',
      startSize: 40,
      highLowTopPercent: 20,
      highLowBottomPercent: 30,
    };

    render(
      <SettingsPanel
        settings={initialSettings}
        setSettings={setSettingsMock}
        isSearching={false}
        parsedEntriesCount={100}
        handleSearch={() => {}}
        handleCancelSearch={() => {}}
        cn={cn}
      />
    );

    const splitModeButton = screen.getByRole('button', { name: /split/i });
    userEvent.click(splitModeButton);

    expect(setSettingsMock).toHaveBeenCalledTimes(1);
  });

  it('should call handleSearch when the search button is clicked', () => {
    const handleSearchMock = jest.fn();
    const initialSettings: SearchSettings = {
      minLen: 10,
      maxLen: 0,
      topN: 10,
      searchMode: 'classic',
      startSize: 40,
      highLowTopPercent: 20,
      highLowBottomPercent: 30,
    };

    render(
      <SettingsPanel
        settings={initialSettings}
        setSettings={() => {}}
        isSearching={false}
        parsedEntriesCount={100}
        handleSearch={handleSearchMock}
        handleCancelSearch={() => {}}
        cn={cn}
      />
    );

    const searchButton = screen.getByRole('button', { name: /find isograms/i });
    userEvent.click(searchButton);

    expect(handleSearchMock).toHaveBeenCalledTimes(1);
  });
});
