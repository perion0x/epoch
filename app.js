/**
 * Main Application Entry Point
 * Initializes all components and wires up event listeners
 */

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Tap Counter App initializing...');

  try {
    // Instantiate all components
    const storageManager = new StorageManager();
    const telegramIntegration = new TelegramIntegration();
    const uiManager = new UIManager();
    const gameController = new GameController(storageManager, uiManager);

    // Initialize Telegram SDK
    const telegramAvailable = telegramIntegration.init();

    // Apply Telegram theme if available, otherwise use fallback
    if (telegramAvailable) {
      const themeParams = telegramIntegration.getThemeParams();
      if (themeParams) {
        uiManager.applyTelegramTheme(themeParams);
      } else {
        console.warn('App: Telegram SDK available but theme params unavailable, using fallback');
        uiManager.applyTelegramTheme(null);
      }
    } else {
      console.log('App: Running outside Telegram environment, using fallback theme');
      uiManager.applyTelegramTheme(null);
      
      // Disable share button if Telegram SDK is not available
      const shareButton = uiManager.getElement('shareButton');
      if (shareButton) {
        shareButton.disabled = true;
        shareButton.title = 'Share is only available in Telegram';
        console.log('App: Share button disabled (Telegram SDK unavailable)');
      }
    }

    // Initialize game controller
    gameController.init();

    // Wire up tap button event listeners
    const tapButton = uiManager.getElement('tapButton');
    if (tapButton) {
      // Handle both click and touch events
      const handleTapEvent = (event) => {
        try {
          event.preventDefault();
          
          // Get tap coordinates relative to the button
          let x, y;
          if (event.type === 'touchstart' && event.touches && event.touches.length > 0) {
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
          } else if (event.type === 'click') {
            x = event.clientX;
            y = event.clientY;
          } else {
            // Fallback to button center if coordinates unavailable
            const rect = tapButton.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
          }

          // Handle tap through game controller
          gameController.handleTap(x, y);
        } catch (e) {
          console.error('App: Error handling tap event:', e);
        }
      };

      tapButton.addEventListener('click', handleTapEvent);
      tapButton.addEventListener('touchstart', handleTapEvent);
      console.log('App: Tap button event listeners attached');
    } else {
      console.error('App: Tap button not found in DOM');
    }

    // Wire up reset button
    const resetButton = uiManager.getElement('resetButton');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        try {
          gameController.resetScore();
        } catch (e) {
          console.error('App: Error resetting score:', e);
        }
      });
      console.log('App: Reset button event listener attached');
    } else {
      console.warn('App: Reset button not found in DOM');
    }

    // Wire up share button
    const shareButton = uiManager.getElement('shareButton');
    if (shareButton) {
      shareButton.addEventListener('click', () => {
        try {
          if (!telegramAvailable) {
            console.warn('App: Share attempted but Telegram SDK unavailable');
            return;
          }
          const currentScore = gameController.getCurrentScore();
          telegramIntegration.shareScore(currentScore);
        } catch (e) {
          console.error('App: Error sharing score:', e);
        }
      });
      console.log('App: Share button event listener attached');
    } else {
      console.warn('App: Share button not found in DOM');
    }

    // Signal to Telegram that app is ready
    if (telegramAvailable) {
      telegramIntegration.ready();
    }

    console.log('Tap Counter App initialized successfully!');
  } catch (e) {
    console.error('App: Critical error during initialization:', e);
    // Display error message to user
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ff5555; color: white; padding: 20px; border-radius: 8px; text-align: center; z-index: 9999;';
    errorMessage.textContent = 'Failed to initialize app. Please refresh the page.';
    document.body.appendChild(errorMessage);
  }
});
