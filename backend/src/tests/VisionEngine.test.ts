import { LocalDemoVisionEngine } from '../services/LocalDemoVisionEngine';
import { DOMElement } from '../types';

const mockElements: DOMElement[] = [
  {
    id: 'btn1',
    type: 'button',
    label: 'Search',
    text: 'Search',
    role: 'button',
    placeholder: '',
    bbox: { x: 100, y: 50, width: 120, height: 40 },
    visible: true,
    enabled: true,
    selector: '#btn1',
    ariaLabel: 'Search button',
    sensitive: false,
  },
  {
    id: 'inp1',
    type: 'input',
    label: 'Search missions',
    text: '',
    role: 'textbox',
    placeholder: 'Search missions...',
    bbox: { x: 200, y: 80, width: 300, height: 40 },
    visible: true,
    enabled: true,
    selector: '#inp1',
    ariaLabel: 'Search',
    sensitive: false,
  },
  {
    id: 'pwd1',
    type: 'password-input',
    label: 'Password',
    text: '',
    role: 'textbox',
    placeholder: 'Enter password',
    bbox: { x: 200, y: 300, width: 300, height: 40 },
    visible: true,
    enabled: true,
    selector: '#pwd1',
    inputType: 'password',
    sensitive: true,
  },
];

describe('LocalDemoVisionEngine', () => {
  const engine = new LocalDemoVisionEngine();

  test('engine name is clearly labeled', () => {
    expect(engine.engineName).toBe('LOCAL DEMO VISION ENGINE');
  });

  test('detectFromDOM returns detections for each element', () => {
    const detections = engine.detectFromDOM(mockElements);
    expect(detections).toHaveLength(mockElements.length);
  });

  test('button element maps to BUTTON type', () => {
    const detections = engine.detectFromDOM([mockElements[0]]);
    expect(detections[0].type).toBe('BUTTON');
  });

  test('input element maps to INPUT type', () => {
    const detections = engine.detectFromDOM([mockElements[1]]);
    expect(detections[0].type).toBe('INPUT');
  });

  test('all confidences are between 0 and 1', () => {
    const detections = engine.detectFromDOM(mockElements);
    for (const d of detections) {
      expect(d.confidence).toBeGreaterThan(0);
      expect(d.confidence).toBeLessThanOrEqual(1);
    }
  });

  test('getEngineInfo identifies as non-neural', () => {
    const info = engine.getEngineInfo();
    expect(info.mode).toBe('DOM_ASSISTED');
    expect(info.disclaimer).toContain('not a neural network');
  });

  test('detectFromScreenshot throws for ONNX guidance', async () => {
    await expect(engine.detectFromScreenshot('base64data', [])).rejects.toThrow();
  });
});
