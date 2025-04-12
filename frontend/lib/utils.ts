/**
 * Utility functions for the Zengo game
 */

/**
 * Maps the level ID to a display name
 * @param level The level ID string (e.g., "3x3-easy")
 * @returns The human-readable level name
 */
export const mapLevelToDisplay = (level: string): string => {
  const levelMap: Record<string, string> = {
    '3x3-easy': '쉬움 (3x3)',
    '5x5-medium': '보통 (5x5)',
    '7x7-hard': '어려움 (7x7)',
    // Add English versions if needed
    '3x3-easy-en': 'Easy (3x3)',
    '5x5-medium-en': 'Medium (5x5)',
    '7x7-hard-en': 'Hard (7x7)',
  };
  
  return levelMap[level] || level; // Return the mapped name or the original if not found
};

/**
 * Format a date string to a localized format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 