/**
 * StorageManager - Handles localStorage operations for the Tap Counter Game
 * Provides methods to save and retrieve high scores with error handling
 */
class StorageManager {
  constructor() {
    this.HIGH_SCORE_KEY = 'tap_counter_high_score';
    this.storageAvailable = this.isAvailable();
  }

  /**
   * Check if localStorage is available and functional
   * @returns {boolean} True if localStorage is available, false otherwise
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  /**
   * Retrieve the high score from localStorage
   * @returns {number} The stored high score, or 0 if not found or unavailable
   */
  getHighScore() {
    if (!this.storageAvailable) {
      return 0;
    }

    try {
      const storedValue = localStorage.getItem(this.HIGH_SCORE_KEY);
      
      if (storedValue === null) {
        return 0;
      }

      const score = parseInt(storedValue, 10);
      
      // Validate the parsed score
      if (isNaN(score) || score < 0) {
        console.warn('Invalid high score in storage, resetting to 0');
        return 0;
      }

      return score;
    } catch (e) {
      console.error('Error reading high score from localStorage:', e);
      return 0;
    }
  }

  /**
   * Save the high score to localStorage
   * @param {number} score - The score to save
   * @returns {boolean} True if save was successful, false otherwise
   */
  setHighScore(score) {
    if (!this.storageAvailable) {
      console.warn('Cannot save high score: localStorage unavailable');
      return false;
    }

    // Validate input
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      console.error('Invalid score value:', score);
      return false;
    }

    // Cap score at maximum safe value
    const MAX_SCORE = 999999999;
    const validScore = Math.min(score, MAX_SCORE);

    try {
      localStorage.setItem(this.HIGH_SCORE_KEY, validScore.toString());
      return true;
    } catch (e) {
      console.error('Error saving high score to localStorage:', e);
      return false;
    }
  }
}
