import { performSearch, computeScore, getUtf8Slice, IsogramEntry, SearchSettings } from './search.worker';

// Helper to create IsogramEntry objects for testing
const createIsogramEntry = (word: string): IsogramEntry => ({
  word,
  length: [...word].length,
  chars: new Set([...word]),
  prefix2: getUtf8Slice(word, 2),
  prefix3: getUtf8Slice(word, 3),
  suffix2: getUtf8Slice(word, 2, true),
  suffix3: getUtf8Slice(word, 3, true),
});

describe('Search Worker Logic', () => {
  describe('computeScore', () => {
    it('should give a higher score for longer words', () => {
      const combo1 = [createIsogramEntry('kurz')];
      const combo2 = [createIsogramEntry('deutlichlänger')];
      expect(computeScore(combo2)).toBeGreaterThan(computeScore(combo1));
    });

    it('should apply a bonus for good prefix/suffix matches', () => {
      const combo = [createIsogramEntry('hinter'), createIsogramEntry('ergrund')];
      const baseScore = Math.pow(6, 1.3) + Math.pow(7, 1.3);
      // Expect a significant bonus for the "er" match
      expect(computeScore(combo)).toBeGreaterThan(baseScore + 3.0);
    });

    it('should apply a penalty for very short words', () => {
        const combo = [createIsogramEntry('abc')];
        expect(computeScore(combo)).toBeLessThan(Math.pow(3, 1.3));
    });
  });

  describe('performSearch', () => {
    // Mock postMessage, as it's not defined in the Jest/Node environment
    const postMessage = jest.fn();

    beforeEach(() => {
      // @ts-ignore
      global.postMessage = postMessage;
      postMessage.mockClear();
    });

    it('should find a valid two-word combination', () => {
      const wordList = 'wuchs\nbild\nform'; // wuchs + bild is a valid combo
      const settings: SearchSettings = {
        minLen: 9,
        maxLen: 0,
        topN: 10,
        searchMode: 'classic',
        startSize: 40,
        highLowTopPercent: 20,
        highLowBottomPercent: 30,
      };

      performSearch(wordList, settings);

      const doneCall = postMessage.mock.calls.find(call => call[0].type === 'done');
      expect(doneCall).toBeDefined();

      const results = doneCall[0].payload;
      const combinedWords = results.map((r: any) => r.words.map((w: IsogramEntry) => w.word).join(''));

      expect(results.length).toBe(3); // wuchsbild, wuchsform, wuchsbildform
      expect(combinedWords).toContain('wuchsbild');
      expect(combinedWords).toContain('wuchsform');
    });

    it('should find single-word solutions if they meet minLen', () => {
      const wordList = 'hallo\nwelt\nfoo'; // 'welt' is the only valid isogram
       const settings: SearchSettings = {
        minLen: 4,
        maxLen: 0,
        topN: 10,
        searchMode: 'classic',
        startSize: 40,
        highLowTopPercent: 20,
        highLowBottomPercent: 30,
      };

      performSearch(wordList, settings);

      const doneCall = postMessage.mock.calls.find(call => call[0].type === 'done');
      expect(doneCall).toBeDefined();

      const results = doneCall[0].payload;
      expect(results.length).toBe(1);
      expect(results[0].words.map((w: IsogramEntry) => w.word).join('')).toBe('welt');
    });

    it('should respect the minLen setting and find no solutions', () => {
      const wordList = 'wuchs\nbild'; // Combination is 9 chars long
       const settings: SearchSettings = {
        minLen: 10, // Set minLen higher than possible
        maxLen: 0,
        topN: 10,
        searchMode: 'classic',
        startSize: 40,
        highLowTopPercent: 20,
        highLowBottomPercent: 30,
      };

      performSearch(wordList, settings);

      const doneCall = postMessage.mock.calls.find(call => call[0].type === 'done');
      expect(doneCall).toBeDefined();

      const results = doneCall[0].payload;
      expect(results.length).toBe(0);
    });
  });
});
