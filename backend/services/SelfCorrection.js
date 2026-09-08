/**
 * PERCEPTA - Self-Correction Engine
 * Detects interaction failures or post-action verification mismatches,
 * triggers immediate re-perception, selects resilient alternative candidates,
 * and recovers gracefully within configurable retry limits.
 */

class SelfCorrection {
  constructor() {
    this.maxRetries = 2;
  }

  setMaxRetries(retries) {
    this.maxRetries = retries;
  }

  /**
   * Evaluates if self-correction should be initiated
   */
  canRetry(attemptCount) {
    return attemptCount < this.maxRetries;
  }

  /**
   * Plans recovery strategy based on error reason
   */
  planRecovery(failureContext) {
    const { error, target, attemptCount } = failureContext;

    let strategy = 'RE_PERCEIVE_AND_FALLBACK';
    let diagnostic = 'Target element coordinates shifted or obscured.';

    if (error && error.includes('timeout')) {
      strategy = 'WAIT_AND_RETRY';
      diagnostic = 'Page DOM mutation delay detected. Waiting for DOM idle.';
    } else if (error && error.includes('intercepted')) {
      strategy = 'DISMISS_OVERLAY_AND_RETRY';
      diagnostic = 'Potential overlay/modal intercepting clicks. Re-evaluating viewport.';
    }

    return {
      canRetry: this.canRetry(attemptCount),
      attemptNumber: attemptCount + 1,
      strategy,
      diagnostic,
      message: `Self-correction engaged (Attempt ${attemptCount + 1}/${this.maxRetries}): ${diagnostic}`
    };
  }
}

module.exports = new SelfCorrection();
