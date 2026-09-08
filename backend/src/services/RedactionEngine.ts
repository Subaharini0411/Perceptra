import { PIIDetection } from '../types';

export type RedactionMethod = 'black_box' | 'blur' | 'masking' | 'semantic';

const SEMANTIC_REPLACEMENTS: Record<string, string> = {
  EMAIL: '[REDACTED_EMAIL]',
  PHONE: '[REDACTED_PHONE]',
  AADHAAR: '[REDACTED_AADHAAR]',
  PAN: '[REDACTED_PAN]',
  CARD_NUMBER: '[REDACTED_CARD]',
  PASSWORD: '[REDACTED_PASSWORD]',
};

export class RedactionEngine {
  redactText(text: string, detections: PIIDetection[], method: RedactionMethod = 'black_box'): string {
    let result = text;
    const sorted = [...detections].sort((a, b) => b.value.length - a.value.length);

    for (const detection of sorted) {
      if (detection.value.startsWith('[') && detection.value.endsWith(']')) continue;
      const replacement = this.getRedactionText(detection, method);
      result = result.split(detection.value).join(replacement);
    }

    return result;
  }

  getRedactionText(detection: PIIDetection, method: RedactionMethod): string {
    switch (method) {
      case 'black_box':
        return '█'.repeat(detection.value.length);
      case 'masking':
        if (detection.value.length > 4) {
          return detection.value.substring(0, 2) + '*'.repeat(detection.value.length - 2);
        }
        return '****';
      case 'semantic':
        return SEMANTIC_REPLACEMENTS[detection.type] || '[REDACTED]';
      case 'blur':
        return '░'.repeat(detection.value.length);
      default:
        return '[REDACTED]';
    }
  }

  redactObject(obj: Record<string, any>, detections: PIIDetection[]): Record<string, any> {
    const result = { ...obj };
    for (const key of Object.keys(result)) {
      if (typeof result[key] === 'string') {
        result[key] = this.redactText(result[key], detections);
      }
    }
    return result;
  }
}
