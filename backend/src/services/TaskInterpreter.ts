import { TaskIntent } from '../types';

const INTENT_PATTERNS: Array<{
  patterns: RegExp[];
  intent: string;
  extractTarget: (m: RegExpMatchArray, task: string) => string;
  extractValue?: (m: RegExpMatchArray, task: string) => string | undefined;
}> = [
  {
    patterns: [
      /search\s+(?:for\s+)?(.+)/i,
    ],
    intent: 'SEARCH',
    extractTarget: () => 'search',
    extractValue: (m) => m[1]?.trim(),
  },
  {
    patterns: [
      /(?:find|open|click|go\s+to)\s+(?:the\s+)?(.+?)\s+(?:mission|page|link|card|detail)s?\s+(?:and\s+)?(?:open|view|see)?\s*(?:it|them|details)?$/i,
      /(?:find|open)\s+(?:the\s+)?(.+?)\s+mission/i,
    ],
    intent: 'NAVIGATE',
    extractTarget: (m) => m[1]?.trim().toLowerCase() || 'link',
    extractValue: () => undefined,
  },
  {
    patterns: [
      /select\s+(.+?)\s+from\s+(?:the\s+)?(.+?)(?:\s+dropdown|\s+select)?$/i,
    ],
    intent: 'SELECT',
    extractTarget: (m) => m[2]?.trim() || 'dropdown',
    extractValue: (m) => m[1]?.trim(),
  },
  {
    patterns: [
      /scroll\s+down\s+and\s+click\s+(.+)/i,
    ],
    intent: 'SCROLL_AND_CLICK',
    extractTarget: (m) => m[1]?.trim() || 'button',
    extractValue: () => undefined,
  },
  {
    patterns: [
      /fill\s+(?:the\s+)?(.+?)\s+(?:form|fields?)(?:\s+with\s+(.+))?/i,
    ],
    intent: 'FILL_FORM',
    extractTarget: (m) => m[1]?.trim() || 'form',
    extractValue: (m) => m[2]?.trim() || 'sample data',
  },
  {
    patterns: [
      /(?:click|press|tap)\s+(?:the\s+)?(.+)/i,
    ],
    intent: 'CLICK',
    extractTarget: (m) => m[1]?.trim() || 'button',
    extractValue: () => undefined,
  },
  {
    patterns: [
      /scroll\s+(?:down|up|to)?(?:\s+(.+))?/i,
    ],
    intent: 'SCROLL',
    extractTarget: () => 'page',
    extractValue: (m) => m[1]?.trim(),
  },
];

export class TaskInterpreter {
  interpret(task: string): TaskIntent {
    const normalized = task.trim();

    for (const entry of INTENT_PATTERNS) {
      for (const pattern of entry.patterns) {
        const m = normalized.match(pattern);
        if (m) {
          return {
            intent: entry.intent,
            target: entry.extractTarget(m, normalized),
            value: entry.extractValue ? entry.extractValue(m, normalized) : undefined,
          };
        }
      }
    }

    // Fallback
    return {
      intent: 'NAVIGATE',
      target: normalized.toLowerCase(),
      value: undefined,
    };
  }
}
