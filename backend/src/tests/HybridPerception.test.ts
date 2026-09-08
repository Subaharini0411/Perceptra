import { HybridPerceptionEngine } from '../services/HybridPerceptionEngine';
import { DOMElement, VisualDetection } from '../types';

const mockElements: DOMElement[] = [
  {
    id: 'search-btn',
    type: 'button',
    label: 'Search',
    text: 'Search',
    role: 'button',
    placeholder: '',
    bbox: { x: 500, y: 200, width: 120, height: 40 },
    visible: true,
    enabled: true,
    selector: '#search-btn',
    ariaLabel: 'Search',
    sensitive: false,
  },
  {
    id: 'chandrayaan',
    type: 'card',
    label: 'Chandrayaan-3',
    text: 'Chandrayaan-3 Lunar Mission',
    role: 'article',
    placeholder: '',
    bbox: { x: 100, y: 300, width: 250, height: 150 },
    visible: true,
    enabled: true,
    selector: '#chandrayaan',
    ariaLabel: '',
    sensitive: false,
  },
];

const mockVisuals: VisualDetection[] = [
  { type: 'BUTTON', label: 'Search', bbox: [500, 200, 120, 40], confidence: 0.95 },
  { type: 'CARD', label: 'Chandrayaan-3', bbox: [100, 300, 250, 150], confidence: 0.90 },
];

describe('HybridPerceptionEngine', () => {
  const engine = new HybridPerceptionEngine();

  test('returns match for exact target', () => {
    const matches = engine.match('Search', mockElements, mockVisuals, 'SEARCH');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].hybridScore).toBeGreaterThan(0.5);
  });

  test('hybrid score includes all 5 components', () => {
    const matches = engine.match('Search', mockElements, mockVisuals);
    const m = matches[0];
    expect(m).toHaveProperty('visualScore');
    expect(m).toHaveProperty('domScore');
    expect(m).toHaveProperty('textScore');
    expect(m).toHaveProperty('positionScore');
    expect(m).toHaveProperty('semanticScore');
    expect(m).toHaveProperty('hybridScore');
  });

  test('hybrid score is between 0 and 1', () => {
    const matches = engine.match('Search', mockElements, mockVisuals);
    for (const m of matches) {
      expect(m.hybridScore).toBeGreaterThanOrEqual(0);
      expect(m.hybridScore).toBeLessThanOrEqual(1);
    }
  });

  test('chandrayaan matches correctly', () => {
    const matches = engine.match('chandrayaan', mockElements, mockVisuals, 'NAVIGATE');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].element.id).toBe('chandrayaan');
  });

  test('unknown target returns empty or low-score results', () => {
    const matches = engine.match('zzz_completely_unknown_zzz', mockElements, mockVisuals);
    expect(matches.every(m => m.hybridScore < 0.6)).toBe(true);
  });

  test('results sorted by hybridScore descending', () => {
    const matches = engine.match('Search', mockElements, mockVisuals);
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i - 1].hybridScore).toBeGreaterThanOrEqual(matches[i].hybridScore);
    }
  });

  test('custom weights are normalized', () => {
    const customEngine = new HybridPerceptionEngine({ visual: 1, dom: 1, text: 1, position: 1, semantic: 1 });
    const weights = customEngine.getWeights();
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(Math.abs(total - 1)).toBeLessThan(0.001);
  });
});
