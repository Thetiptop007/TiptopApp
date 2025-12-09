/**
 * Fuzzy Search Utility
 * Handles typos, partial matches, and common spelling errors
 */

/**
 * Calculate Levenshtein distance between two strings
 * (measures how many single-character edits are needed)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Check if query matches text with fuzzy matching
 * Returns a score (0-1, higher is better match)
 */
export function fuzzyMatch(query: string, text: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase().trim();

  if (!normalizedQuery) return 0;
  if (normalizedText.includes(normalizedQuery)) return 1; // Exact substring match

  // Split query into words for multi-word matching
  const queryWords = normalizedQuery.split(/\s+/);
  const textWords = normalizedText.split(/\s+/);

  let totalScore = 0;
  let matchedWords = 0;

  // Check each query word against text words
  for (const queryWord of queryWords) {
    let bestWordScore = 0;

    for (const textWord of textWords) {
      // Direct substring match
      if (textWord.includes(queryWord)) {
        bestWordScore = Math.max(bestWordScore, 1);
        continue;
      }

      // Partial match from start of word (e.g., "chik" matches "chicken")
      if (textWord.startsWith(queryWord.substring(0, Math.min(3, queryWord.length)))) {
        bestWordScore = Math.max(bestWordScore, 0.8);
      }

      // Fuzzy match using Levenshtein distance
      const distance = levenshteinDistance(queryWord, textWord);
      const maxLength = Math.max(queryWord.length, textWord.length);
      const similarity = 1 - distance / maxLength;

      // Allow up to 2 character differences for words longer than 4 chars
      if (queryWord.length > 4 && distance <= 2) {
        bestWordScore = Math.max(bestWordScore, similarity * 0.9);
      } else if (queryWord.length > 2 && distance === 1) {
        // Single character typo
        bestWordScore = Math.max(bestWordScore, similarity * 0.85);
      }
    }

    if (bestWordScore > 0) {
      matchedWords++;
      totalScore += bestWordScore;
    }
  }

  // Return average score if at least half the words matched
  if (matchedWords >= Math.ceil(queryWords.length / 2)) {
    return totalScore / queryWords.length;
  }

  return 0;
}

/**
 * Search items with fuzzy matching
 * Returns items sorted by relevance
 */
export function fuzzySearchItems<T extends { name: string; description?: string }>(
  items: T[],
  query: string,
  threshold: number = 0.4
): T[] {
  if (!query.trim()) return items;

  const results = items
    .map(item => {
      // Check both name and description
      const nameScore = fuzzyMatch(query, item.name);
      const descScore = item.description ? fuzzyMatch(query, item.description) * 0.7 : 0;
      const maxScore = Math.max(nameScore, descScore);

      return {
        item,
        score: maxScore,
      };
    })
    .filter(result => result.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(result => result.item);

  return results;
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;

  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase();

  // Find the best matching substring
  const index = normalizedText.indexOf(normalizedQuery);
  if (index !== -1) {
    return text;
  }

  // For more complex matching, just return original text
  return text;
}
