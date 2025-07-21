import {
  isIsogram,
  cleanAndCheckIsogram,
  computeScore,
  getUtf8Slice,
} from './IsogramFinder';

// Define the IsogramEntry type locally for testing, mirroring the one in the component
type IsogramEntry = {
  word: string;
  length: number;
  chars: Set<string>;
  prefix2: string;
  prefix3: string;
  suffix2: string;
  suffix3: string;
};

// Helper to create IsogramEntry objects for tests
const createIsogramEntry = (word: string): IsogramEntry => ({
  word,
  length: [...word].length,
  chars: new Set([...word]),
  prefix2: getUtf8Slice(word, 2),
  prefix3: getUtf8Slice(word, 3),
  suffix2: getUtf8Slice(word, 2, true),
  suffix3: getUtf8Slice(word, 3, true),
});


describe('IsogramFinder Core Logic', () => {
  describe('isIsogram', () => {
    it('should return true for valid isograms', () => {
      expect(isIsogram('haus')).toBe(true);
      expect(isIsogram('weg')).toBe(true);
      expect(isIsogram('jux')).toBe(true);
      expect(isIsogram('Heizöl')).toBe(true); // Case sensitive
    });

    it('should return false for words with repeating letters', () => {
      expect(isIsogram('hallo')).toBe(false);
      expect(isIsogram('test')).toBe(false);
      expect(isIsogram('programm')).toBe(false);
    });

    it('should return true for empty strings', () => {
      // An empty string has no repeating characters.
      expect(isIsogram('')).toBe(true);
    });

    it('should handle special characters and numbers', () => {
      expect(isIsogram('12345')).toBe(true);
      expect(isIsogram('11234')).toBe(false);
      expect(isIsogram('äöüß')).toBe(true);
      expect(isIsogram('ääh')).toBe(false);
    });
  });

  describe('cleanAndCheckIsogram', () => {
    it('should clean and validate a simple isogram', () => {
      expect(cleanAndCheckIsogram('Haus')).toBe('haus');
    });

    it('should return null for non-isograms', () => {
      expect(cleanAndCheckIsogram('Hallo')).toBe(null);
    });

    it('should handle surrounding whitespace and clean the word', () => {
      expect(cleanAndCheckIsogram('  weg  ')).toBe('weg');
    });

    it('should strip punctuation and validate the result', () => {
      expect(cleanAndCheckIsogram('weg.')).toBe('weg');
      expect(cleanAndCheckIsogram('hallo!')).toBe(null); // hallo is not an isogram
    });

    it('should return null for empty or whitespace-only strings', () => {
      expect(cleanAndCheckIsogram('')).toBe(null);
      expect(cleanAndCheckIsogram('   ')).toBe(null);
    });
  });

  describe('computeScore', () => {
    it('should calculate a baseline score based on length', () => {
      const combo = [createIsogramEntry('haus')];
      // score = 4^1.3
      expect(computeScore(combo)).toBeCloseTo(6.06, 2);
    });

    it('should add a bonus for long words (>= 8)', () => {
      const combo = [createIsogramEntry('dialoge')]; // length 7
      const comboLong = [createIsogramEntry('dialogen')]; // length 8
      // score = 7^1.3 vs score = 8^1.3 + 5
      expect(computeScore(comboLong)).toBeGreaterThan(computeScore(combo) + 5);
    });

    it('should apply a penalty for short words (<= 3)', () => {
      const combo = [createIsogramEntry('jux')]; // length 3
      // score = 3^1.3 - 3
      expect(computeScore(combo)).toBeCloseTo(4.17 - 3, 2);
    });

    it('should apply a penalty for many words (> 4)', () => {
        const combo1 = [createIsogramEntry('a'), createIsogramEntry('b'), createIsogramEntry('c'), createIsogramEntry('d')];
        const combo2 = [createIsogramEntry('a'), createIsogramEntry('b'), createIsogramEntry('c'), createIsogramEntry('d'), createIsogramEntry('e')];
        // penalty = (5-4) * 1.5 = 1.5
        expect(computeScore(combo2)).toBeLessThan(computeScore(combo1));
    });

    it('should give a bonus for matching prefixes and suffixes', () => {
      const combo = [
        createIsogramEntry('hafen'), // suffix3: fen
        createIsogramEntry('fenster'), // prefix3: fen
      ];
      // Expect a bonus of 5.0 for the 3-char match
      const baseScore = computeScore([combo[0]]) + computeScore([combo[1]]);
      expect(computeScore(combo)).toBeGreaterThan(baseScore + 4.9);
    });

     it('should give a bonus for plausible German compound words', () => {
      const combo = [
        createIsogramEntry('autos'), // ends with linking 's'
        createIsogramEntry('strom'), // starts with 's'
      ];
      const baseScore = computeScore([combo[0]]) + computeScore([combo[1]]);
      // Expect a bonus of 4.0 for the linking element
      expect(computeScore(combo)).toBeGreaterThan(baseScore + 3.9);
    });
  });
});
