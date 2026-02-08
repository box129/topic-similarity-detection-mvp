const { preprocessText, countWords } = require('./preprocessing');

describe('Text Preprocessing Utilities', () => {
  describe('countWords', () => {
    test('should count words correctly', () => {
      expect(countWords('Hello world')).toBe(2);
      expect(countWords('The quick brown fox')).toBe(4);
      expect(countWords('Single')).toBe(1);
    });

    test('should handle multiple spaces', () => {
      expect(countWords('Hello    world')).toBe(2);
      expect(countWords('  Multiple   spaces   here  ')).toBe(3);
    });

    test('should handle empty or invalid input', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
      expect(countWords(null)).toBe(0);
      expect(countWords(undefined)).toBe(0);
    });
  });

  describe('preprocessText', () => {
    test('should preprocess text correctly', () => {
      const text = 'The research study investigates climate change';
      const result = preprocessText(text);

      expect(result.original).toBe(text);
      expect(result.tokens).toEqual(['the', 'research', 'study', 'investigates', 'climate', 'change']);
      expect(result.filteredTokens).toEqual(['investigates', 'climate', 'change']);
      expect(result.stemmedTokens).toEqual(['investig', 'climat', 'chang']);
      expect(result.wordCount).toBe(6);
      expect(result.uniqueWords).toBe(3);
    });

    test('should remove custom stopwords', () => {
      const text = 'This study analyzes the research investigation';
      const result = preprocessText(text);

      // 'study', 'research', 'investigation' should be removed
      expect(result.filteredTokens).not.toContain('study');
      expect(result.filteredTokens).not.toContain('research');
      expect(result.filteredTokens).not.toContain('investigation');
      expect(result.filteredTokens).toContain('analyzes');
    });

    test('should handle text with punctuation', () => {
      const text = 'Hello, world! How are you?';
      const result = preprocessText(text);

      expect(result.tokens).toContain('hello');
      expect(result.tokens).toContain('world');
    });

    test('should throw error for invalid input', () => {
      expect(() => preprocessText('')).toThrow('Input must be a non-empty string');
      expect(() => preprocessText(null)).toThrow('Input must be a non-empty string');
      expect(() => preprocessText(undefined)).toThrow('Input must be a non-empty string');
      expect(() => preprocessText(123)).toThrow('Input must be a non-empty string');
    });

    test('should calculate unique words correctly', () => {
      const text = 'running runs runner run';
      const result = preprocessText(text);

      // Porter Stemmer stems 'running', 'runs', 'run' to 'run', but 'runner' stays as 'runner'
      expect(result.uniqueWords).toBe(2);
      expect(result.stemmedTokens).toContain('run');
      expect(result.stemmedTokens).toContain('runner');
    });

    test('should handle single word', () => {
      const text = 'Hello';
      const result = preprocessText(text);

      expect(result.tokens).toEqual(['hello']);
      expect(result.wordCount).toBe(1);
    });
  });
});
