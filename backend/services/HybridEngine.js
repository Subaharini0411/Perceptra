/**
 * PERCEPTA - Hybrid Perception Engine
 * Merges DOM structural nodes and Computer Vision bounding box detections
 * through multi-modal spatial association and multi-factor scoring.
 * 
 * Formula:
 * hybridScore = w_v * visualScore + w_d * domScore + w_t * textScore + w_p * positionScore + w_s * semanticScore
 */

class HybridEngine {
  constructor() {
    // Configurable default weights (Section 10)
    this.weights = {
      visual: 0.30,
      dom: 0.25,
      text: 0.20,
      position: 0.10,
      semantic: 0.15
    };
  }

  setWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }

  getWeights() {
    return { ...this.weights };
  }

  /**
   * Spatial Intersection-over-Union (IoU) between two bounding boxes
   */
  computeIoU(boxA, boxB) {
    const xA = Math.max(boxA.x, boxB.x);
    const yA = Math.max(boxA.y, boxB.y);
    const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    if (interArea === 0) return 0;

    const boxAArea = boxA.width * boxA.height;
    const boxBArea = boxB.width * boxB.height;
    return interArea / (boxAArea + boxBArea - interArea);
  }

  /**
   * Calculates similarity between task query keyword and element text
   */
  computeTextScore(targetKeyword, elementText) {
    if (!targetKeyword) return 0.70;
    if (!elementText) return 0.20;

    const target = targetKeyword.toLowerCase().trim();
    const text = elementText.toLowerCase().trim();

    if (text === target) return 1.0;
    if (text.includes(target) || target.includes(text)) return 0.94;

    // Token overlap
    const targetTokens = target.split(/\s+/);
    const textTokens = text.split(/\s+/);
    const matchedTokens = targetTokens.filter(t => textTokens.some(k => k.includes(t) || t.includes(k)));
    if (matchedTokens.length > 0) {
      return 0.75 + (0.20 * (matchedTokens.length / targetTokens.length));
    }

    return 0.30;
  }

  /**
   * Evaluates position heuristics based on intent
   */
  computePositionScore(element, intent) {
    const { y, x, width } = element;
    
    if (intent === 'SEARCH') {
      // Search boxes are typically located in the top half (y < 400) and horizontally centered or right
      if (y < 350) return 0.95;
      if (y < 600) return 0.75;
      return 0.40;
    }

    if (intent === 'SUBMIT') {
      // Submit buttons are typically lower in the form
      if (y > 400) return 0.94;
      return 0.70;
    }

    if (intent === 'NAVIGATE') {
      if (y < 120) return 0.96; // Header nav
      return 0.60;
    }

    return 0.85;
  }

  /**
   * Evaluates DOM structural authority based on intent
   */
  computeDOMScore(domNode, intent, targetSelector) {
    if (!domNode) return 0.50;
    let score = 0.75;

    const tag = (domNode.tag || '').toLowerCase();
    const intentUpper = (intent || 'CLICK').toUpperCase();

    if (intentUpper === 'CLICK') {
      if (tag === 'button' || domNode.isClickable) score += 0.20;
      else if (tag === 'a') score += 0.18;
      else if (tag === 'input' && domNode.type !== 'submit' && domNode.type !== 'button') score -= 0.15; // penalize typing input on click
    } else if (intentUpper === 'INPUT' || intentUpper === 'TYPE') {
      if (tag === 'input' || tag === 'textarea') score += 0.22;
      else if (tag === 'button') score -= 0.20;
    } else if (intentUpper === 'SELECT') {
      if (tag === 'select') score += 0.25;
    }

    if (domNode.domId && !domNode.domId.startsWith('dom-node-')) score += 0.05;

    // Selector agreement boost
    if (targetSelector && (domNode.selector === targetSelector || domNode.domId === targetSelector.replace('#', ''))) {
      score += 0.10;
    }

    return Math.min(0.99, Math.max(0.20, score));
  }

  /**
   * Evaluates semantic intent mapping
   */
  computeSemanticScore(targetKeyword, domNode, visualEl, intent) {
    const combined = `${domNode?.tag || ''} ${domNode?.role || ''} ${domNode?.text || ''} ${visualEl?.label || ''}`.toLowerCase();
    const query = (targetKeyword || '').toLowerCase();

    if (intent === 'SEARCH' && (combined.includes('search') || combined.includes('query') || combined.includes('find'))) {
      return 0.96;
    }
    if (intent === 'CLICK' && (combined.includes('button') || combined.includes('details') || combined.includes('open') || combined.includes('view'))) {
      return 0.94;
    }
    if (intent === 'FILL_FORM' && (combined.includes('input') || combined.includes('email') || combined.includes('name') || combined.includes('text'))) {
      return 0.95;
    }
    if (query && combined.includes(query)) {
      return 0.92;
    }
    return 0.75;
  }

  /**
   * Fuses DOM candidates and Visual elements to produce hybrid scored targets
   * @param {Array} domCandidates Extracted DOM elements
   * @param {Array} visualElements Visual perception elements
   * @param {Object} queryContext { targetKeyword, intent }
   */
  fuseAndRank(domCandidates, visualElements, queryContext = {}) {
    const { targetKeyword = '', intent = 'CLICK', selector = '' } = queryContext;
    const candidates = [];

    // Match each DOM node with closest or overlapping visual detection
    domCandidates.forEach((domNode, idx) => {
      // Find best visual bbox match
      let bestVisual = null;
      let highestIoU = -1;

      visualElements.forEach((vis) => {
        const iou = this.computeIoU(
          { x: domNode.x, y: domNode.y, width: domNode.width, height: domNode.height },
          vis.bbox
        );
        if (iou > highestIoU) {
          highestIoU = iou;
          bestVisual = vis;
        }
      });

      // Factor scores
      const visualScore = bestVisual ? bestVisual.confidence : 0.72;
      const domScore = this.computeDOMScore(domNode, intent, selector);
      const textScore = this.computeTextScore(targetKeyword, domNode.text);
      const positionScore = this.computePositionScore(domNode, intent);
      const semanticScore = this.computeSemanticScore(targetKeyword, domNode, bestVisual, intent);

      // Weighted fusion calculation
      const hybridScore = (
        (this.weights.visual * visualScore) +
        (this.weights.dom * domScore) +
        (this.weights.text * textScore) +
        (this.weights.position * positionScore) +
        (this.weights.semantic * semanticScore)
      );

      const targetX = Math.round(domNode.x + domNode.width / 2);
      const targetY = Math.round(domNode.y + domNode.height / 2);

      candidates.push({
        id: `candidate-${idx + 1}`,
        targetName: domNode.text ? domNode.text.slice(0, 40) : domNode.selector,
        selector: domNode.selector,
        tag: domNode.tag,
        coordinates: { x: targetX, y: targetY },
        bbox: {
          x: domNode.x,
          y: domNode.y,
          width: domNode.width,
          height: domNode.height
        },
        matchedVisualLabel: bestVisual ? bestVisual.label : 'UNLABELED',
        scores: {
          visual: parseFloat(visualScore.toFixed(2)),
          dom: parseFloat(domScore.toFixed(2)),
          text: parseFloat(textScore.toFixed(2)),
          position: parseFloat(positionScore.toFixed(2)),
          semantic: parseFloat(semanticScore.toFixed(2)),
          finalHybrid: parseFloat(hybridScore.toFixed(2))
        },
        confidence: parseFloat(hybridScore.toFixed(2))
      });
    });

    // Rank by descending hybrid confidence score
    candidates.sort((a, b) => b.confidence - a.confidence);

    return candidates;
  }
}

module.exports = new HybridEngine();
