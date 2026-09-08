/**
 * PERCEPTA - Visual Classifier
 * Classifies bounding box visual regions into UI primitives:
 * BUTTON, INPUT, CARD, LINK, CHECKBOX, TEXT, IMAGE
 * Computes visual saliency, geometry confidence, and layout characteristics.
 */

class VisualClassifier {
  constructor() {
    this.classes = ['BUTTON', 'INPUT', 'CARD', 'LINK', 'CHECKBOX', 'TEXT', 'IMAGE'];
  }

  /**
   * Classify element visual geometry and heuristics
   * @param {Object} bbox { x, y, width, height }
   * @param {Object} metadata Optional DOM context if available for calibration
   * @returns {Object} { label, confidence, features }
   */
  classifyRegion(bbox, metadata = {}) {
    const { width, height } = bbox;
    const area = width * height;
    const aspectRatio = width / Math.max(height, 1);

    // Geometry Heuristics for Web UI components
    let label = 'TEXT';
    let confidence = 0.85;

    if (area > 30000 && width > 200 && height > 100) {
      label = 'CARD';
      confidence = 0.94;
    } else if (aspectRatio >= 1.5 && aspectRatio <= 6.0 && height >= 24 && height <= 55 && width <= 250) {
      label = 'BUTTON';
      confidence = 0.92;
    } else if (aspectRatio >= 3.0 && height >= 28 && height <= 60 && width >= 150) {
      label = 'INPUT';
      confidence = 0.95;
    } else if (width >= 12 && width <= 32 && height >= 12 && height <= 32 && Math.abs(aspectRatio - 1) < 0.3) {
      label = 'CHECKBOX';
      confidence = 0.93;
    } else if (aspectRatio > 2.0 && height <= 30 && area < 8000) {
      label = 'LINK';
      confidence = 0.88;
    } else if (metadata.isImage || (width > 50 && height > 50 && aspectRatio >= 0.8 && aspectRatio <= 2.0 && area < 50000)) {
      label = 'IMAGE';
      confidence = 0.89;
    }

    // Boost if DOM tag agrees (Calibration)
    if (metadata.tag) {
      const tag = metadata.tag.toLowerCase();
      if ((tag === 'button' && label === 'BUTTON') ||
          (tag === 'input' && label === 'INPUT') ||
          (tag === 'a' && label === 'LINK')) {
        confidence = Math.min(0.99, confidence + 0.05);
      }
    }

    return {
      label,
      confidence: parseFloat(confidence.toFixed(2)),
      features: {
        area,
        aspectRatio: parseFloat(aspectRatio.toFixed(2)),
        isProminent: area > 10000
      }
    };
  }
}

module.exports = new VisualClassifier();
