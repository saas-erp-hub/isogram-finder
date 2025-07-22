import { getUtf8Slice, isIsogram, cleanAndCheckIsogram } from './IsogramFinder';

describe('Isogram-Finder pure functions', () => {
  describe('getUtf8Slice', () => {
    it('should correctly slice the beginning of a string', () => {
      expect(getUtf8Slice('abcdef', 3)).toBe('abc');
    });
    it('should correctly slice the end of a string', () => {
      expect(getUtf8Slice('abcdef', 3, true)).toBe('def');
    });
    it('should handle multi-byte characters', () => {
      expect(getUtf8Slice('aöüßxyz', 4)).toBe('aöüß');
    });
    it('should handle slicing from the end with multi-byte characters', () => {
      expect(getUtf8Slice('aöüßxyz', 3, true)).toBe('xyz');
    });
  });

  describe('isIsogram', () => {
    it('should return true for a valid isogram', () => {
      expect(isIsogram('haus')).toBe(true);
    });
    it('should return false for a word with repeated characters', () => {
      expect(isIsogram('hallo')).toBe(false);
    });
    it('should handle case sensitivity correctly (or rather, it doesnt)', () => {
      expect(isIsogram('Haus')).toBe(true); // Note: current implementation is case sensitive
    });
  });

  describe('cleanAndCheckIsogram', () => {
    it('should clean, lowercase, and validate a word', () => {
      expect(cleanAndCheckIsogram('  HaUs! ')).toBe('haus');
    });
    it('should return null for non-isograms', () => {
      expect(cleanAndCheckIsogram('Hallo Welt')).toBe(null);
    });
    it('should return null for empty or whitespace-only strings', () => {
      expect(cleanAndCheckIsogram('   ')).toBe(null);
    });
    it('should handle German Umlaute', () => {
      expect(cleanAndCheckIsogram('Löffelstiel')).toBe(null); // l, f, e are repeated
      expect(cleanAndCheckIsogram('Heizölrückstoßabdämpfung')).toBe('heizölrückstoßabdämpfung');
      expect(cleanAndCheckIsogram('Faß')).toBe('faß');
    });
  });
});

