import { DOMElement, VisualDetection, HybridMatch } from '../types';

const DEFAULT_WEIGHTS = {
  visual: 0.30,
  dom: 0.25,
  text: 0.20,
  position: 0.10,
  semantic: 0.15,
};

function textSimilarity(a: string, b: string): number {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (!a || !b) return 0;
  if (a === b) return 1.0;
  if (a.includes(b) || b.includes(a)) return 0.8;
  const aWords = new Set(a.split(/\s+/));
  const bWords = new Set(b.split(/\s+/));
  const intersection = [...aWords].filter(w => bWords.has(w)).length;
  const union = new Set([...aWords, ...bWords]).size;
  return union > 0 ? intersection / union : 0;
}

function positionScore(
  bbox: { x: number; y: number; width: number; height: number },
  visualBbox?: [number, number, number, number]
): number {
  if (!visualBbox) return 0.5;
  const [vx, vy, vw, vh] = visualBbox;
  const dx = Math.abs(bbox.x - vx);
  const dy = Math.abs(bbox.y - vy);
  const dw = Math.abs(bbox.width - vw);
  const dh = Math.abs(bbox.height - vh);
  const dist = (dx + dy + dw + dh) / 4;
  return Math.max(0, 1 - dist / 100);
}

const SEMANTIC_TYPE_MAP: Record<string, string[]> = {
  search: ['input', 'button', 'element'],
  button: ['button'],
  link: ['link'],
  form: ['input', 'textarea', 'dropdown', 'button'],
  mission: ['card', 'link', 'heading'],
  chandrayaan: ['card', 'link', 'heading'],
  mars: ['card', 'link', 'heading'],
  mangalyaan: ['card', 'link', 'heading'],
  aditya: ['card', 'link', 'heading'],
  dropdown: ['dropdown'],
  checkbox: ['checkbox'],
  navigation: ['navigation', 'link'],
  country: ['dropdown'],
};

function semanticScore(intent: string, element: DOMElement): number {
  const intentLower = intent.toLowerCase();
  const expectedTypes = Object.entries(SEMANTIC_TYPE_MAP)
    .find(([k]) => intentLower.includes(k))?.[1] || [];
  if (expectedTypes.length === 0) return 0.5;
  return expectedTypes.some(t => element.type.includes(t)) ? 0.9 : 0.2;
}

export class HybridPerceptionEngine {
  private weights: typeof DEFAULT_WEIGHTS;

  constructor(weights?: Partial<typeof DEFAULT_WEIGHTS>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    const total = Object.values(this.weights).reduce((a, b) => a + b, 0);
    for (const k in this.weights) {
      (this.weights as any)[k] /= total;
    }
  }

  match(
    target: string,
    domElements: DOMElement[],
    visualDetections: VisualDetection[],
    intent?: string,
  ): HybridMatch[] {
    const matches: HybridMatch[] = [];

    for (const el of domElements) {
      const dScore = Math.min(
        1.0,
        textSimilarity(el.label, target) * 0.6 +
        textSimilarity(el.text, target) * 0.3 +
        (el.visible && el.enabled ? 0.1 : 0),
      );

      let bestVisual: VisualDetection | undefined;
      let vScore = 0.5;
      for (const vd of visualDetections) {
        const overlap = textSimilarity(vd.label, target);
        if (overlap > 0) {
          const s = vd.confidence * 0.5 + overlap * 0.5;
          if (s > vScore) {
            vScore = s;
            bestVisual = vd;
          }
        }
      }

      const tScore = Math.max(
        textSimilarity(el.label, target),
        textSimilarity(el.text, target),
        textSimilarity(el.placeholder, target),
        textSimilarity(el.ariaLabel || '', target),
      );

      const pScore = positionScore(el.bbox, bestVisual?.bbox);
      const sScore = semanticScore(intent || target, el);

      const hybrid =
        this.weights.visual * vScore +
        this.weights.dom * dScore +
        this.weights.text * tScore +
        this.weights.position * pScore +
        this.weights.semantic * sScore;

      if (hybrid > 0.3) {
        matches.push({
          target,
          element: el,
          visualDetection: bestVisual,
          visualScore: parseFloat(vScore.toFixed(3)),
          domScore: parseFloat(dScore.toFixed(3)),
          textScore: parseFloat(tScore.toFixed(3)),
          positionScore: parseFloat(pScore.toFixed(3)),
          semanticScore: parseFloat(sScore.toFixed(3)),
          hybridScore: parseFloat(hybrid.toFixed(3)),
        });
      }
    }

    return matches.sort((a, b) => b.hybridScore - a.hybridScore);
  }

  getWeights() {
    return { ...this.weights };
  }
}
