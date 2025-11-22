/**
 * AnimationSystem - Handles visual effects and animations for the Tap Counter Game
 * Provides tap effects, score animations, and button feedback
 */
class AnimationSystem {
  constructor() {
    this.activeAnimations = new Set();
    this.MAX_CONCURRENT_ANIMATIONS = 20; // Limit to prevent performance issues
  }

  /**
   * Creates a tap effect with ripple and floating "+1" animation at tap coordinates
   * @param {number} x - X coordinate of tap
   * @param {number} y - Y coordinate of tap
   * @param {HTMLElement} container - Container element for the animation
   */
  createTapEffect(x, y, container) {
    // Prevent animation overflow during rapid tapping
    if (this.activeAnimations.size >= this.MAX_CONCURRENT_ANIMATIONS) {
      console.warn('AnimationSystem: Maximum concurrent animations reached, skipping');
      return;
    }

    // Validate inputs
    if (typeof x !== 'number' || typeof y !== 'number' || !container) {
      console.error('AnimationSystem: Invalid parameters for createTapEffect');
      return;
    }

    try {
      // Create ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'tap-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      container.appendChild(ripple);
      this.activeAnimations.add(ripple);

      // Create floating "+1" text
      const floatingText = document.createElement('div');
      floatingText.className = 'tap-float-text';
      floatingText.textContent = '+1';
      floatingText.style.left = `${x}px`;
      floatingText.style.top = `${y}px`;
      container.appendChild(floatingText);
      this.activeAnimations.add(floatingText);

      // Clean up after animation completes
      setTimeout(() => {
        this._removeAnimation(ripple);
        this._removeAnimation(floatingText);
      }, 600);
    } catch (e) {
      console.error('AnimationSystem: Error creating tap effect:', e);
    }
  }

  /**
   * Animates score display with a pulse effect
   * @param {HTMLElement} element - Score display element to animate
   */
  animateScoreIncrement(element) {
    if (!element) {
      console.warn('AnimationSystem: No element provided for score animation');
      return;
    }

    try {
      // Remove existing animation class if present
      element.classList.remove('score-pulse');
      
      // Trigger reflow to restart animation
      void element.offsetWidth;
      
      // Add animation class
      element.classList.add('score-pulse');
      
      // Remove class after animation completes
      setTimeout(() => {
        element.classList.remove('score-pulse');
      }, 200);
    } catch (e) {
      console.error('AnimationSystem: Error animating score increment:', e);
    }
  }

  /**
   * Animates button press feedback
   * @param {HTMLElement} element - Button element to animate
   */
  animateButton(element) {
    if (!element) {
      console.warn('AnimationSystem: No element provided for button animation');
      return;
    }

    try {
      // Add press animation class
      element.classList.add('button-press');
      
      // Remove class after animation completes
      setTimeout(() => {
        element.classList.remove('button-press');
      }, 150);
    } catch (e) {
      console.error('AnimationSystem: Error animating button:', e);
    }
  }

  /**
   * Removes an animation element from DOM and tracking set
   * @private
   * @param {HTMLElement} element - Element to remove
   */
  _removeAnimation(element) {
    try {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeAnimations.delete(element);
    } catch (e) {
      console.error('AnimationSystem: Error removing animation element:', e);
      // Still try to remove from tracking set
      this.activeAnimations.delete(element);
    }
  }

  /**
   * Cleans up all active animations (useful for cleanup/reset)
   */
  cleanup() {
    try {
      this.activeAnimations.forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      this.activeAnimations.clear();
      console.log('AnimationSystem: Cleanup completed');
    } catch (e) {
      console.error('AnimationSystem: Error during cleanup:', e);
      // Force clear the set even if removal failed
      this.activeAnimations.clear();
    }
  }
}
