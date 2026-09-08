/**
 * PERCEPTA - Safety Engine & Action Governance Layer
 * Classifies actions into SAFE vs SENSITIVE, monitors confidence thresholds,
 * and holds execution when user confirmation is mandated.
 */

class SafetyEngine {
  constructor() {
    this.sensitiveKeywords = [
      'submit', 'login', 'register', 'delete', 'purchase', 'pay', 
      'checkout', 'transfer', 'upload', 'remove', 'grant', 'terminate'
    ];
    this.pendingConfirmations = new Map();
    this.safetySettings = {
      requireConfirmationForSensitive: true,
      highConfidenceThreshold: 0.90,
      mediumConfidenceThreshold: 0.70
    };
  }

  updateSettings(settings) {
    this.safetySettings = { ...this.safetySettings, ...settings };
  }

  getSettings() {
    return { ...this.safetySettings };
  }

  /**
   * Classifies action safety category
   * @param {Object} action 
   * @returns {Object} { isSensitive, classification, requiresConfirmation, confidenceTier }
   */
  evaluate(action, confidence = 0.90) {
    const textTarget = `${action.target || ''} ${action.value || ''} ${action.type || ''}`.toLowerCase();
    
    // Check for sensitive keywords
    const isSensitive = this.sensitiveKeywords.some(kw => textTarget.includes(kw)) ||
                        action.type === 'SUBMIT' ||
                        action.isSensitive === true;

    let confidenceTier = 'HIGH';
    if (confidence < this.safetySettings.mediumConfidenceThreshold) {
      confidenceTier = 'LOW';
    } else if (confidence < this.safetySettings.highConfidenceThreshold) {
      confidenceTier = 'MEDIUM';
    }

    const requiresConfirmation = (
      (isSensitive && this.safetySettings.requireConfirmationForSensitive) ||
      confidenceTier === 'LOW'
    );

    return {
      isSensitive,
      classification: isSensitive ? 'SENSITIVE' : 'SAFE',
      confidenceTier,
      confidence,
      requiresConfirmation,
      safetyMessage: isSensitive
        ? `Sensitive action detected (${action.target || action.type}). Action will require operator clearance.`
        : `Action passed automated safety checks with ${confidenceTier} confidence.`
    };
  }

  /**
   * Registers a pending confirmation wait
   */
  requestConfirmation(taskId, action, confidence) {
    return new Promise((resolve) => {
      this.pendingConfirmations.set(taskId, {
        action,
        confidence,
        timestamp: Date.now(),
        resolve
      });
    });
  }

  /**
   * Resolves a pending confirmation from frontend user response
   */
  resolveConfirmation(taskId, allowed = true) {
    const pending = this.pendingConfirmations.get(taskId);
    if (pending) {
      this.pendingConfirmations.delete(taskId);
      pending.resolve(allowed);
      return true;
    }
    return false;
  }
}

module.exports = new SafetyEngine();
