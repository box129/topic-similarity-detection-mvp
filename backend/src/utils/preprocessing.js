const natural = require('natural');

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Combine natural stopwords with custom domain-specific stopwords
const stopwords = [
  ...natural.stopwords,
  'study',
  'research',
  'investigation',
  'assessment',
  'analysis'
];

/**
 * Preprocesses text for NLP similarity algorithms
 * 
 * @param {string} text - The input text to preprocess
 * @returns {Object} Preprocessing results containing:
 *   - original: The original input text
 *   - tokens: Array of tokenized words
 *   - filteredTokens: Array of tokens after removing stopwords
 *   - stemmedTokens: Array of stemmed tokens
 *   - wordCount: Total number of words in original text
 *   - uniqueWords: Number of unique words after stemming
 * 
 * @example
 * const result = preprocessText("The research study investigates climate change");
 * // Returns:
 * // {
 * //   original: "The research study investigates climate change",
 * //   tokens: ["The", "research", "study", "investigates", "climate", "change"],
 * //   filteredTokens: ["investigates", "climate", "change"],
 * //   stemmedTokens: ["investig", "climat", "chang"],
 * //   wordCount: 6,
 * //   uniqueWords: 3
 * // }
 */
function preprocessText(text) {
  // Validate input
  if (!text || typeof text !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  // Store original text
  const original = text;

  // Step 1: Lowercase the text
  const lowercased = text.toLowerCase();

  // Step 2: Tokenize using natural.WordTokenizer
  const tokens = tokenizer.tokenize(lowercased);

  // Step 3: Remove stop words
  const filteredTokens = tokens.filter(token => !stopwords.includes(token));

  // Step 4: Stem tokens using natural.PorterStemmer
  const stemmedTokens = filteredTokens.map(token => stemmer.stem(token));

  // Step 5: Calculate word count and unique words
  const wordCount = countWords(original);
  const uniqueWords = new Set(stemmedTokens).size;

  return {
    original,
    tokens,
    filteredTokens,
    stemmedTokens,
    wordCount,
    uniqueWords
  };
}

/**
 * Counts the number of words in a text string
 * 
 * @param {string} text - The input text to count words from
 * @returns {number} The number of words in the text
 * 
 * @example
 * const count = countWords("Hello world, this is a test");
 * // Returns: 6
 */
function countWords(text) {
  // Validate input
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Split on whitespace and filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  
  return words.length;
}

module.exports = {
  preprocessText,
  countWords
};
