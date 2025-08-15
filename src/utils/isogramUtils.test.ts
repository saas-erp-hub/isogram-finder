import { isIsogram, cleanAndCheckIsogram } from './isogramUtils';

describe('isogramUtils', () => {
  describe('isIsogram', () => {
    it('should return true for a valid isogram', () => {
      expect(isIsogram('haus')).toBe(true);
    });

    it('should return true for a word with mixed case characters that are unique', () => {
      expect(isIsogram('Haus')).toBe(true);
    });

    it('should return false for a word with repeated characters', () => {
      expect(isIsogram('hallo')).toBe(false);
    });

    it('should return false for a word with repeated characters of different cases', () => {
      expect(isIsogram('Hallo')).toBe(false);
    });

    it('should return true for an empty string', () => {
      expect(isIsogram('')).toBe(true);
    });

    it('should handle German Umlaute correctly', () => {
      expect(isIsogram('heizöl')).toBe(true);
      expect(isIsogram('fußball')).toBe(false); // l is repeated
    });
  });

  describe('cleanAndCheckIsogram', () => {
    it('should clean, lowercase, and validate a valid isogram', () => {
      expect(cleanAndCheckIsogram('  HaUs! ')).toBe('haus');
    });

    it('should return null for a cleaned word that is not an isogram', () => {
      expect(cleanAndCheckIsogram('Hallo Welt')).toBe(null);
    });

    it('should return null for a word that becomes a non-isogram after cleaning', () => {
        expect(cleanAndCheckIsogram('Test-Test')).toBe(null);
    });

    it('should return null for empty or whitespace-only strings', () => {
      expect(cleanAndCheckIsogram('   ')).toBe(null);
    });

    it('should return null for strings with only special characters', () => {
        expect(cleanAndCheckIsogram('!@#$%^&*()')).toBe(null);
    });

    it('should handle German Umlaute and ß correctly', () => {
      expect(cleanAndCheckIsogram('Löffelstiel')).toBe(null); // l, f, e are repeated
      expect(cleanAndCheckIsogram('Heizölrückstoßabdämpfung')).toBe('heizölrückstoßabdämpfung');
      expect(cleanAndCheckIsogram('Faß')).toBe('faß');
    });
  });
});
