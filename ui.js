/**
 * UIManager - Manages all DOM manipulations and visual updates for the Tap Counter Game
 * Handles score displays, animations, theme application, and responsive layout
 */
class UIManager {
  constructor() {
    // Cache DOM elements
    this.elements = {
      currentScore: document.getElementById('currentScore'),
      highScore: document.getElementById('highScore'),
      tapButton: document.getElementById('tapButton'),
      animationContainer: document.getElementById('animationContainer'),
      resetButton: document.getElementById('resetButton'),
      shareButton: document.getElementById('shareButton')
    };

    // Initialize animation system
    this.animationSystem = new AnimationSystem();

    // Verify all required elements exist
    this._verifyElements();
  }

  /**
   * Updates the current score display
   * @param {number} score - The current score value to display
   */
  updateCurrentScore(score) {
    if (!this.elements.currentScore) return;

    // Format score with commas for readability
    const formattedScore = this._formatScore(score);
    this.elements.currentScore.textContent = formattedScore;

    // Trigger pulse animation
    this.animationSystem.animateScoreIncrement(this.elements.currentScore);
  }

  /**
   * Updates the high score display
   * @param {number} score - The high score value to display
   */
  updateHighScore(score) {
    if (!this.elements.highScore) return;

    // Format score with commas for readability
    const formattedScore = this._formatScore(score);
    this.elements.highScore.textContent = formattedScore;
  }

  /**
   * Shows tap animation at the specified location
   * @param {number} x - X coordinate of tap
   * @param {number} y - Y coordinate of tap
   */
  showTapAnimation(x, y) {
    if (!this.elements.animationContainer) {
      console.warn('UIManager: Animation container not found');
      return;
    }

    try {
      // Create tap effect at coordinates
      this.animationSystem.createTapEffect(x, y, this.elements.animationContainer);

      // Animate the tap button
      if (this.elements.tapButton) {
        this.animationSystem.animateButton(this.elements.tapButton);
      }
    } catch (e) {
      console.error('UIManager: Error showing tap animation:', e);
    }
  }

  /**
   * Applies Telegram theme colors to the application
   * @param {Object} themeParams - Telegram theme parameters object
   */
  applyTelegramTheme(themeParams) {
    if (!themeParams || typeof themeParams !== 'object') {
      console.warn('UIManager: Invalid theme parameters, using defaults');
      this._applyFallbackTheme();
      return;
    }

    try {
      const root = document.documentElement;

      // Apply Telegram theme colors to CSS variables
      if (themeParams.bg_color) {
        root.style.setProperty('--tg-bg-color', themeParams.bg_color);
      }

      if (themeParams.text_color) {
        root.style.setProperty('--tg-text-color', themeParams.text_color);
      }

      if (themeParams.hint_color) {
        root.style.setProperty('--tg-hint-color', themeParams.hint_color);
      }

      if (themeParams.link_color) {
        root.style.setProperty('--tg-link-color', themeParams.link_color);
      }

      if (themeParams.button_color) {
        root.style.setProperty('--tg-button-color', themeParams.button_color);
      }

      if (themeParams.button_text_color) {
        root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
      }

      console.log('UIManager: Telegram theme applied successfully');
    } catch (e) {
      console.error('UIManager: Error applying Telegram theme, using fallback:', e);
      this._applyFallbackTheme();
    }
  }

  /**
   * Applies fallback theme colors when Telegram theme is unavailable
   * @private
   */
  _applyFallbackTheme() {
    try {
      const root = document.documentElement;
      
      // Fallback colors for non-Telegram environments
      const fallbackTheme = {
        '--tg-bg-color': '#ffffff',
        '--tg-text-color': '#000000',
        '--tg-hint-color': '#999999',
        '--tg-link-color': '#0088cc',
        '--tg-button-color': '#0088cc',
        '--tg-button-text-color': '#ffffff'
      };

      for (const [property, value] of Object.entries(fallbackTheme)) {
        root.style.setProperty(property, value);
      }

      console.log('UIManager: Fallback theme applied');
    } catch (e) {
      console.error('UIManager: Error applying fallback theme:', e);
    }
  }

  /**
   * Formats a score number with comma separators
   * @private
   * @param {number} score - Score to format
   * @returns {string} Formatted score string
   */
  _formatScore(score) {
    if (typeof score !== 'number' || isNaN(score)) {
      return '0';
    }
    return score.toLocaleString('en-US');
  }

  /**
   * Verifies that all required DOM elements exist
   * @private
   */
  _verifyElements() {
    const missingElements = [];

    for (const [key, element] of Object.entries(this.elements)) {
      if (!element) {
        missingElements.push(key);
      }
    }

    if (missingElements.length > 0) {
      console.error('UIManager: Missing required DOM elements:', missingElements);
    }
  }

  /**
   * Gets a reference to a specific UI element
   * @param {string} elementName - Name of the element to retrieve
   * @returns {HTMLElement|null} The requested element or null
   */
  getElement(elementName) {
    return this.elements[elementName] || null;
  }

  /**
   * Cleans up animations and resources
   */
  cleanup() {
    if (this.animationSystem) {
      this.animationSystem.cleanup();
    }
  }
}
