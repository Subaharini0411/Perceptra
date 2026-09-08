export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ConfidenceDecision {
  level: ConfidenceLevel;
  score: number;
  canExecute: boolean;
  requiresVerification: boolean;
  reason: string;
}

export class ConfidenceEngine {
  private threshold: number;

  constructor(threshold = 0.70) {
    this.threshold = threshold;
  }

  evaluate(score: number): ConfidenceDecision {
    const s = Math.max(0, Math.min(1, score));

    if (s >= 0.90) {
      return {
        level: 'HIGH',
        score: s,
        canExecute: true,
        requiresVerification: false,
        reason: 'High confidence — safe automatic execution',
      };
    } else if (s >= this.threshold) {
      return {
        level: 'MEDIUM',
        score: s,
        canExecute: true,
        requiresVerification: true,
        reason: 'Medium confidence — additional verification required',
      };
    } else {
      return {
        level: 'LOW',
        score: s,
        canExecute: false,
        requiresVerification: false,
        reason: 'Low confidence — will not automatically execute',
      };
    }
  }

  setThreshold(t: number) {
    this.threshold = Math.max(0, Math.min(1, t));
  }
}
