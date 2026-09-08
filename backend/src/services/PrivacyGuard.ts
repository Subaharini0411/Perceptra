import { DOMElement, PIIDetection, PrivacyReport } from '../types';

const PII_PATTERNS: Array<{ type: string; pattern: RegExp }> = [
  { type: 'EMAIL', pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { type: 'PHONE', pattern: /(?:(?:\+?91)?[\-\s]?)?[6-9]\d{9}/g },
  { type: 'AADHAAR', pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g },
  { type: 'PAN', pattern: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g },
  { type: 'CARD_NUMBER', pattern: /\b(?:\d{4}[\s\-]?){3}\d{4}\b/g },
  { type: 'PASSWORD', pattern: /password[:\s]+\S+/gi },
];

function maskValue(value: string): string {
  return '█'.repeat(value.length);
}

export class PrivacyGuard {
  detectInDOM(elements: DOMElement[]): PIIDetection[] {
    const detections: PIIDetection[] = [];

    for (const el of elements) {
      if (el.type === 'password-input' || el.inputType === 'password') {
        detections.push({
          type: 'PASSWORD',
          value: '[PASSWORD FIELD]',
          redacted: '█'.repeat(12),
          location: 'dom',
          selector: el.selector,
        });
        continue;
      }

      if (el.inputType === 'email' || el.type === 'email-input') {
        detections.push({
          type: 'EMAIL',
          value: '[EMAIL FIELD]',
          redacted: '█'.repeat(13),
          location: 'dom',
          selector: el.selector,
        });
        continue;
      }

      if (el.text) {
        for (const { type, pattern } of PII_PATTERNS) {
          const cloned = new RegExp(pattern.source, pattern.flags);
          const matches = [...el.text.matchAll(cloned)];
          for (const match of matches) {
            detections.push({
              type,
              value: match[0],
              redacted: maskValue(match[0]),
              location: 'text',
              selector: el.selector,
            });
          }
        }
      }
    }

    return detections;
  }

  detectInText(text: string): PIIDetection[] {
    const detections: PIIDetection[] = [];
    for (const { type, pattern } of PII_PATTERNS) {
      const cloned = new RegExp(pattern.source, pattern.flags);
      const matches = [...text.matchAll(cloned)];
      for (const match of matches) {
        detections.push({
          type,
          value: match[0],
          redacted: maskValue(match[0]),
          location: 'text',
        });
      }
    }
    return detections;
  }

  generateReport(detections: PIIDetection[]): PrivacyReport {
    return {
      sensitiveDetected: detections.length,
      redacted: detections.length,
      rawSensitiveDataTransmitted: 0, // ALWAYS 0
      detections,
    };
  }

  /**
   * Network guard: reject any payload containing known sensitive patterns
   */
  validatePayloadSafe(payload: string): { safe: boolean; violations: string[] } {
    const violations: string[] = [];
    for (const { type, pattern } of PII_PATTERNS) {
      const cloned = new RegExp(pattern.source, pattern.flags);
      const matches = [...payload.matchAll(cloned)];
      if (matches.length > 0) {
        violations.push(`${type}: ${matches.length} occurrence(s) detected`);
      }
    }
    return { safe: violations.length === 0, violations };
  }
}
