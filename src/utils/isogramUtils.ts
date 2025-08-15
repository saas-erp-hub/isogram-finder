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
