import { DOMElement } from '../types';
import { Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';

export class DOMPerceptionEngine {
  async extractElements(page: Page): Promise<DOMElement[]> {
    const elements = await page.evaluate(() => {
      const INTERACTIVE_SELECTORS = [
        'button', 'input', 'textarea', 'select', 'a[href]',
        '[role="button"]', '[role="link"]', '[role="checkbox"]',
        '[role="combobox"]', '[role="textbox"]', '[role="searchbox"]',
        '.card', '.mission-card', 'nav a', 'label',
        'h1', 'h2', 'h3', '[data-testid]',
      ];

      function isVisible(el: Element): boolean {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
      }

      function getElementType(el: Element): string {
        const tag = el.tagName.toLowerCase();
        const role = el.getAttribute('role') || '';
        const inputType = el instanceof HTMLInputElement ? el.type : '';
        if (tag === 'button' || role === 'button') return 'button';
        if (tag === 'input') {
          if (inputType === 'checkbox') return 'checkbox';
          if (inputType === 'radio') return 'radio';
          if (inputType === 'password') return 'password-input';
          if (inputType === 'email') return 'email-input';
          return 'input';
        }
        if (tag === 'textarea') return 'textarea';
        if (tag === 'select') return 'dropdown';
        if (tag === 'a') return 'link';
        if (tag === 'h1' || tag === 'h2' || tag === 'h3') return 'heading';
        if (el.classList.contains('card') || el.classList.contains('mission-card')) return 'card';
        if (tag === 'nav' || role === 'navigation') return 'navigation';
        if (tag === 'label') return 'label';
        return 'element';
      }

      function getLabel(el: Element): string {
        const ariaLabel = el.getAttribute('aria-label') || '';
        const placeholder = el instanceof HTMLInputElement ? el.placeholder : '';
        const title = el.getAttribute('title') || '';
        const text = (el.textContent || '').trim().substring(0, 80);
        const name = el.getAttribute('name') || '';
        const id = el.getAttribute('id') || '';
        return ariaLabel || placeholder || title || text || name || id || 'unknown';
      }

      function isSensitive(el: Element): boolean {
        if (el instanceof HTMLInputElement) {
          if (['password', 'hidden'].includes(el.type)) return true;
        }
        const autocomplete = el.getAttribute('autocomplete') || '';
        if (['cc-number', 'cc-csc', 'current-password', 'new-password'].includes(autocomplete)) return true;
        return false;
      }

      const seen = new Set<Element>();
      const results: any[] = [];

      for (const selector of INTERACTIVE_SELECTORS) {
        try {
          const els = document.querySelectorAll(selector);
          els.forEach(el => {
            if (seen.has(el)) return;
            seen.add(el);
            if (!isVisible(el)) return;

            const rect = el.getBoundingClientRect();
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            results.push({
              id: el.getAttribute('id') || el.getAttribute('data-testid') || '',
              type: getElementType(el),
              label: getLabel(el),
              text: (el.textContent || '').trim().substring(0, 100),
              role: el.getAttribute('role') || el.tagName.toLowerCase(),
              placeholder: el instanceof HTMLInputElement ? el.placeholder : '',
              bbox: {
                x: Math.round(rect.left + scrollX),
                y: Math.round(rect.top + scrollY),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              },
              visible: true,
              enabled: !(el as HTMLElement).hasAttribute('disabled'),
              selector: '',
              ariaLabel: el.getAttribute('aria-label') || '',
              inputType: el instanceof HTMLInputElement ? el.type : '',
              href: el instanceof HTMLAnchorElement ? el.href : '',
              sensitive: isSensitive(el),
            });
          });
        } catch (e) {
          // Skip invalid selectors
        }
      }

      return results;
    });

    return elements.map((el, idx) => ({
      ...el,
      id: el.id || uuidv4(),
      selector: el.id ? `#${el.id}` : `[data-percepta-idx="${idx}"]`,
    })) as DOMElement[];
  }

  findBestMatch(elements: DOMElement[], target: string, type?: string): DOMElement | null {
    const targetLower = target.toLowerCase();
    let best: { el: DOMElement; score: number } | null = null;

    for (const el of elements) {
      if (type && el.type !== type) continue;
      let score = 0;

      const label = el.label.toLowerCase();
      const text = el.text.toLowerCase();
      const ariaLabel = (el.ariaLabel || '').toLowerCase();

      if (label === targetLower) score += 1.0;
      else if (label.includes(targetLower)) score += 0.7;
      if (text === targetLower) score += 0.9;
      else if (text.includes(targetLower)) score += 0.6;
      if (ariaLabel.includes(targetLower)) score += 0.5;
      if (el.placeholder.toLowerCase().includes(targetLower)) score += 0.4;

      if (score > 0 && (!best || score > best.score)) {
        best = { el, score };
      }
    }

    return best?.el || null;
  }
}
