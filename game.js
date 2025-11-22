/**
 * GameController - Core game logic for the Tap Counter Game
 * Manages game state, score tracking, and coordinates between storage and UI
 */
class GameController {
  constructor(storageManager, uiManager) {
    // Validate dependencies
    if (!storageManager || !uiManager) {
      throw new Error('GameController requires StorageManager and UIManager');
    }

    this.storageManager = storageManager;
    this.uiManager = uiManager;

    // Game state
    this.currentScore = 0;
    this.highScore = 0;
    this.isInitialized = false;

    // Score limits
    this.MAX_SCORE = 999999999;

    // Throttling for rapid tapping
    this.lastTapTime = 0;
    this.MIN_TAP_INTERVAL = 50; // Minimum 50ms between taps to prevent abuse
  }

  /**
   * Initialize the game by loading high score and setting up initial state
   */
  init() {
    try {
      // Load high score from storage
      this.highScore = this.storageManager.getHighScore();

      // Initialize current score to 0
      this.currentScore = 0;

      // Update UI with initial values
      this.uiManager.updateCurrentScore(this.currentScore);
      this.uiManager.updateHighScore(this.highScore);

      // Mark as initialized
      this.isInitialized = true;

      console.log('GameController initialized - High Score:', this.highScore);
    } catch (e) {
      console.error('GameController: Error during initialization:', e);
      // Set safe defaults
      this.currentScore = 0;
      this.highScore = 0;
      this.isInitialized = true;
    }
  }

  /**
   * Handle tap event - increment score, check for high score, and trigger UI updates
   * @param {number} x - X coordinate of tap (for animation)
   * @param {number} y - Y coordinate of tap (for animation)
   */
  handleTap(x, y) {
    if (!this.isInitialized) {
      console.warn('GameController: Not initialized');
      return;
    }

    // Throttle rapid tapping to prevent abuse and performance issues
    const currentTime = Date.now();
    if (currentTime - this.lastTapTime < this.MIN_TAP_INTERVAL) {
      console.debug('GameController: Tap throttled (too rapid)');
      return;
    }
    this.lastTapTime = currentTime;

    // Check if score has reached maximum
    if (this.currentScore >= this.MAX_SCORE) {
      console.log('GameController: Maximum score reached!');
      return;
    }

    try {
      // Increment current score
      this.currentScore++;

      // Update current score display
      this.uiManager.updateCurrentScore(this.currentScore);

      // Show tap animation at coordinates
      if (typeof x === 'number' && typeof y === 'number') {
        this.uiManager.showTapAnimation(x, y);
      }

      // Check if new high score achieved
      if (this.currentScore > this.highScore) {
        this.highScore = this.currentScore;
        const saved = this.storageManager.setHighScore(this.highScore);
        if (saved) {
          this.uiManager.updateHighScore(this.highScore);
          console.log('GameController: New high score!', this.highScore);
        }
      }
    } catch (e) {
      console.error('GameController: Error handling tap:', e);
    }
  }

  /**
   * Reset current score to zero while preserving high score
   */
  resetScore() {
    if (!this.isInitialized) {
      console.warn('GameController: Not initialized');
      return;
    }

    try {
      // Reset current score to 0
      this.currentScore = 0;

      // Reset tap throttling
      this.lastTapTime = 0;

      // Update UI to show reset score
      this.uiManager.updateCurrentScore(this.currentScore);

      console.log('GameController: Score reset - High Score preserved:', this.highScore);
    } catch (e) {
      console.error('GameController: Error resetting score:', e);
    }
  }

  /**
   * Get the current score
   * @returns {number} Current score value
   */
  getCurrentScore() {
    return this.currentScore;
  }

  /**
   * Get the high score
   * @returns {number} High score value
   */
  getHighScore() {
    return this.highScore;
  }
}
