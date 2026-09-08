/**
 * LocalDemoVisionEngine
 *
 * Clearly labeled local vision engine using DOM-assisted computer vision.
 * This is NOT an ONNX model or neural network.
 * Label: LOCAL DEMO VISION ENGINE
 *
 * Replaceable with ONNXVisionEngine without changing callers.
 */
import { DOMElement, VisualDetection } from '../types';

export const ENGINE_NAME = 'LOCAL DEMO VISION ENGINE';
export const ENGINE_VERSION = '1.0.0';

const ELEMENT_TYPE_MAP: Record<string, string> = {
  button: 'BUTTON',
  input: 'INPUT',
  'password-input': 'INPUT',
  'email-input': 'INPUT',
  textarea: 'INPUT',
  dropdown: 'DROPDOWN',
  link: 'LINK',
  heading: 'TEXT',
  card: 'CARD',
  checkbox: 'CHECKBOX',
  navigation: 'TEXT',
  label: 'TEXT',
  element: 'TEXT',
};

function calculateVisualConfidence(el: DOMElement): number {
  let confidence = 0.70; // base

  if (el.label && el.label !== 'unknown' && el.label.length > 2) confidence += 0.08;
  if (el.ariaLabel) confidence += 0.05;
  if (el.placeholder) confidence += 0.04;

  const { width, height } = el.bbox;
  if (width > 20 && width < 600 && height > 10 && height < 200) confidence += 0.06;

  if (['button', 'input', 'dropdown', 'checkbox', 'link'].includes(el.type)) confidence += 0.05;

  if (el.enabled && el.visible) confidence += 0.02;

  return Math.min(0.97, confidence);
}

export class LocalDemoVisionEngine {
  readonly engineName = ENGINE_NAME;
  readonly engineVersion = ENGINE_VERSION;

  /**
   * Detect UI elements from DOM elements using local heuristic vision.
   * In production, replace with ONNXVisionEngine processing actual screenshot pixels.
   */
  detectFromDOM(elements: DOMElement[]): VisualDetection[] {
    const detections: VisualDetection[] = [];

    for (const el of elements) {
      const visualType = ELEMENT_TYPE_MAP[el.type] || 'TEXT';
      const confidence = calculateVisualConfidence(el);

      detections.push({
        type: visualType,
        label: el.label.substring(0, 50),
        bbox: [el.bbox.x, el.bbox.y, el.bbox.width, el.bbox.height],
        confidence: parseFloat(confidence.toFixed(3)),
      });
    }

    return detections;
  }

  /**
   * ONNXVisionEngine interface stub for future replacement.
   */
  async detectFromScreenshot(_base64: string, _domElements: DOMElement[]): Promise<VisualDetection[]> {
    throw new Error('Full screenshot inference requires ONNXVisionEngine. Using LocalDemoVisionEngine with DOM assistance.');
  }

  getEngineInfo() {
    return {
      name: ENGINE_NAME,
      version: ENGINE_VERSION,
      mode: 'DOM_ASSISTED',
      description: 'Deterministic local vision using DOM bounding boxes + heuristic confidence. Replace with ONNXVisionEngine for production.',
      disclaimer: 'This is not a neural network. Results are DOM-derived.',
    };
  }
}
