/**
 * PERCEPTA - Visual Perception Service
 * Coordinates screenshot capture, on-device visual processing,
 * spatial bounding box extraction, and visual element classification.
 */

const onnxAdapter = require('./ONNXDetectorAdapter');
const classifier = require('./VisualClassifier');

class VisualPerceptionService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await onnxAdapter.initialize();
      this.initialized = true;
    }
    return this.getModelInfo();
  }

  getModelInfo() {
    return {
      modelName: onnxAdapter.modelName,
      isDemoDetector: onnxAdapter.isDemoDetector,
      isONNXLoaded: onnxAdapter.isONNXLoaded,
      inferenceEngine: onnxAdapter.inferenceEngine,
      device: 'CPU'
    };
  }

  /**
   * Performs visual perception on a webpage screenshot
   * @param {Buffer|String} screenshotBase64 
   * @param {Array} domCandidates Extracted DOM geometry for spatial alignment
   * @returns {Promise<Object>}
   */
  async perceive(screenshotBase64, domCandidates = []) {
    await this.initialize();
    
    // Run on-device detector
    const result = await onnxAdapter.detectElements(screenshotBase64, domCandidates);

    return {
      visualElements: result.detections,
      telemetry: result.telemetry,
      modelInfo: this.getModelInfo()
    };
  }
}

module.exports = new VisualPerceptionService();
