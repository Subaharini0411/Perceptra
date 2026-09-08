export type SafetyLevel = 'SAFE' | 'SENSITIVE' | 'BLOCKED';

export interface SafetyDecision {
  level: SafetyLevel;
  action: string;
  requiresConfirmation: boolean;
  message?: string;
}

const SAFE_ACTIONS = new Set(['click', 'scroll', 'search', 'navigate', 'select', 'find', 'scroll_and_click']);
const SENSITIVE_ACTIONS = new Set(['login', 'submit', 'delete', 'purchase', 'upload', 'send', 'fill_form']);

const SENSITIVE_TARGETS = [
  'login', 'password', 'delete', 'purchase', 'buy', 'submit', 'register',
  'send message', 'upload', 'payment', 'checkout',
];

export class SafetyEngine {
  private confirmationEnabled: boolean;

  constructor(confirmationEnabled = true) {
    this.confirmationEnabled = confirmationEnabled;
  }

  evaluate(action: string, target: string, confidence?: number): SafetyDecision {
    const actionLower = action.toLowerCase();
    const targetLower = target.toLowerCase();

    const isSensitiveAction = SENSITIVE_ACTIONS.has(actionLower);
    const isSensitiveTarget = SENSITIVE_TARGETS.some(t => targetLower.includes(t));

    if (isSensitiveAction || isSensitiveTarget) {
      return {
        level: 'SENSITIVE',
        action,
        requiresConfirmation: this.confirmationEnabled,
        message: [
          `PERCEPTA is about to perform: ${action} on "${target}"`,
          confidence ? `Confidence: ${Math.round(confidence * 100)}%` : '',
          'This action requires confirmation.',
        ].filter(Boolean).join('\n'),
      };
    }

    if (SAFE_ACTIONS.has(actionLower)) {
      return {
        level: 'SAFE',
        action,
        requiresConfirmation: false,
      };
    }

    return {
      level: 'SENSITIVE',
      action,
      requiresConfirmation: this.confirmationEnabled,
      message: `Unknown action type "${action}" — requires confirmation.`,
    };
  }

  setConfirmationEnabled(v: boolean) {
    this.confirmationEnabled = v;
  }
}
