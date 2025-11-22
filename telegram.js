/**
 * TelegramIntegration - Wrapper for Telegram Web App SDK functionality
 * Handles initialization, theme parameters, and sharing capabilities
 */
class TelegramIntegration {
  constructor() {
    this.webApp = null;
    this.initialized = false;
  }

  /**
   * Check if Telegram Web App SDK is available
   * @returns {boolean} True if SDK is available, false otherwise
   */
  isAvailable() {
    return typeof window.Telegram !== 'undefined' && 
           typeof window.Telegram.WebApp !== 'undefined';
  }

  /**
   * Initialize the Telegram Web App SDK
   * @returns {boolean} True if initialization was successful, false otherwise
   */
  init() {
    if (!this.isAvailable()) {
      console.warn('Telegram Web App SDK is not available');
      return false;
    }

    try {
      this.webApp = window.Telegram.WebApp;
      this.initialized = true;
      console.log('Telegram Web App SDK initialized successfully');
      return true;
    } catch (e) {
      console.error('Error initializing Telegram Web App SDK:', e);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Retrieve Telegram theme parameters
   * @returns {Object|null} Theme parameters object or null if unavailable
   */
  getThemeParams() {
    if (!this.initialized || !this.webApp) {
      console.warn('Cannot get theme params: SDK not initialized');
      return null;
    }

    try {
      const themeParams = this.webApp.themeParams;
      
      // Return theme parameters with fallback values
      return {
        bg_color: themeParams.bg_color || '#ffffff',
        text_color: themeParams.text_color || '#000000',
        hint_color: themeParams.hint_color || '#999999',
        link_color: themeParams.link_color || '#0088cc',
        button_color: themeParams.button_color || '#0088cc',
        button_text_color: themeParams.button_text_color || '#ffffff'
      };
    } catch (e) {
      console.error('Error retrieving theme parameters:', e);
      return null;
    }
  }

  /**
   * Share the current score using Telegram's share API
   * @param {number} score - The score to share
   * @returns {boolean} True if share was triggered successfully, false otherwise
   */
  shareScore(score) {
    if (!this.initialized || !this.webApp) {
      console.warn('Cannot share score: SDK not initialized');
      return false;
    }

    // Validate score input
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      console.error('Invalid score value for sharing:', score);
      return false;
    }

    try {
      // Format the share message with engaging text
      const message = this._formatShareMessage(score);
      
      // Use Telegram's share functionality
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
      
      // Open share dialog
      this.webApp.openTelegramLink(shareUrl);
      
      console.log('Share triggered successfully');
      return true;
    } catch (e) {
      console.error('Error sharing score:', e);
      return false;
    }
  }

  /**
   * Format an engaging share message based on the score
   * @param {number} score - The score to include in the message
   * @returns {string} Formatted share message
   * @private
   */
  _formatShareMessage(score) {
    const formattedScore = score.toLocaleString();
    
    // Different message templates based on score milestones
    let message;
    
    if (score === 0) {
      message = `🎮 Just started playing Tap Counter! Join me and see how high you can score! 🚀`;
    } else if (score < 100) {
      message = `🎯 I scored ${formattedScore} taps in Tap Counter! Think you can beat me? Try it now! 💪`;
    } else if (score < 1000) {
      message = `🔥 ${formattedScore} taps and counting! Can you beat my score in Tap Counter? Challenge accepted? 🎮`;
    } else if (score < 10000) {
      message = `⚡ Wow! I just hit ${formattedScore} taps in Tap Counter! Your turn - can you top this? 🏆`;
    } else if (score < 100000) {
      message = `🌟 EPIC! ${formattedScore} taps in Tap Counter! I dare you to beat this score! 🚀`;
    } else {
      message = `🏆 LEGENDARY! ${formattedScore} taps in Tap Counter! Think you have what it takes? 👑`;
    }
    
    return message;
  }

  /**
   * Signal to Telegram that the Mini App is ready
   * Should be called after app initialization is complete
   */
  ready() {
    if (!this.initialized || !this.webApp) {
      console.warn('Cannot signal ready: SDK not initialized');
      return;
    }

    try {
      this.webApp.ready();
      console.log('Signaled ready to Telegram');
    } catch (e) {
      console.error('Error signaling ready to Telegram:', e);
    }
  }
}
