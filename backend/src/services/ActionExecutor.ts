import { PlaywrightService } from './PlaywrightService';
import { DOMPerceptionEngine } from './DOMPerceptionEngine';
import { ConfidenceEngine } from './ConfidenceEngine';
import { SafetyEngine } from './SafetyEngine';
import { VerificationEngine } from './VerificationEngine';
import { PlannedAction, ActionResult, DOMElement } from '../types';

export class ActionExecutor {
  constructor(
    private playwright: PlaywrightService,
    private domEngine: DOMPerceptionEngine,
    private confidence: ConfidenceEngine,
    private safety: SafetyEngine,
    private verification: VerificationEngine,
  ) {}

  async execute(action: PlannedAction, elements: DOMElement[]): Promise<ActionResult> {
    const start = Date.now();
    const page = this.playwright.getPage();

    try {
      const targetEl = this.domEngine.findBestMatch(elements, action.target);

      const score = action.confidence || (targetEl ? 0.82 : 0.45);
      const decision = this.confidence.evaluate(score);

      if (!decision.canExecute && action.action !== 'FIND') {
        return {
          success: false,
          action: action.action,
          target: action.target,
          confidence: score,
          error: decision.reason,
          timestamp: new Date().toISOString(),
          duration: Date.now() - start,
        };
      }

      const safetyDecision = this.safety.evaluate(action.action, action.target, score);
      if (safetyDecision.requiresConfirmation) {
        console.log(`[Safety] ${safetyDecision.message}`);
      }

      await this.executeAction(action, targetEl, elements);

      const verification = await this.verification.verifyAction(page, action.action, action.target);

      return {
        success: verification.success,
        action: action.action,
        target: action.target,
        confidence: score,
        timestamp: new Date().toISOString(),
        duration: Date.now() - start,
      };
    } catch (error: any) {
      return {
        success: false,
        action: action.action,
        target: action.target,
        confidence: action.confidence || 0,
        error: error.message,
        timestamp: new Date().toISOString(),
        duration: Date.now() - start,
      };
    }
  }

  private async executeAction(action: PlannedAction, targetEl: DOMElement | null, allElements: DOMElement[]): Promise<void> {
    const page = this.playwright.getPage();

    switch (action.action.toUpperCase()) {
      case 'FIND':
        if (!targetEl) throw new Error(`Target not found: ${action.target}`);
        return;

      case 'CLICK': {
        // Try ID-based selector first
        if (targetEl?.selector && targetEl.selector.startsWith('#')) {
          try {
            await this.playwright.click(targetEl.selector);
            return;
          } catch {}
        }
        // Try text-based click
        try {
          await page.click(`text="${action.target}"`, { timeout: 3000 });
          return;
        } catch {}
        // Fallback to coordinates
        if (targetEl) {
          const { x, y, width, height } = targetEl.bbox;
          await this.playwright.clickAt(x + width / 2, y + height / 2);
          return;
        }
        // Try partial text
        try {
          await page.click(`text=${action.target}`, { timeout: 3000 });
          return;
        } catch {}
        throw new Error(`Cannot click: ${action.target}`);
      }

      case 'FILL': {
        const val = action.value || '';
        const searchTarget = action.target.toLowerCase();

        // Find matching input
        const inputEl = allElements.find(e =>
          ['input', 'textarea', 'email-input'].includes(e.type) &&
          (e.label.toLowerCase().includes(searchTarget) ||
           e.placeholder.toLowerCase().includes(searchTarget) ||
           searchTarget.includes('search') ||
           searchTarget.includes('email') ||
           searchTarget.includes('name'))
        );

        if (inputEl?.selector && inputEl.selector.startsWith('#')) {
          try {
            await this.playwright.fill(inputEl.selector, val);
            return;
          } catch {}
        }

        // Try common search selectors
        const selectors = [
          `#search-input`,
          `input[type="search"]`,
          `input[placeholder*="Search" i]`,
          `input[type="text"]`,
          `input:not([type="hidden"]):not([type="submit"])`,
          `textarea`,
        ];
        for (const sel of selectors) {
          try {
            await this.playwright.fill(sel, val);
            return;
          } catch {}
        }
        throw new Error(`Cannot fill: ${action.target}`);
      }

      case 'SELECT': {
        const dropdownEl = allElements.find(e =>
          e.type === 'dropdown' &&
          (e.label.toLowerCase().includes(action.target.toLowerCase()) ||
           (e.id || '').toLowerCase().includes(action.target.toLowerCase()))
        );
        if (dropdownEl?.selector && dropdownEl.selector.startsWith('#')) {
          try {
            await this.playwright.selectOption(dropdownEl.selector, action.value || '');
            return;
          } catch {}
        }
        await this.playwright.selectOption('select', action.value || '');
        return;
      }

      case 'SCROLL':
        await this.playwright.scroll(
          (action.value || 'down') as 'down' | 'up',
          400
        );
        return;

      case 'FILL_FORM': {
        const formInputs = allElements.filter(e =>
          ['input', 'textarea', 'email-input'].includes(e.type) &&
          !['password-input'].includes(e.type) &&
          e.enabled && e.visible
        );
        const sampleData: Record<string, string> = {
          name: 'Demo User',
          'full-name': 'Demo User',
          fullname: 'Demo User',
          email: 'demo@example.com',
          phone: '9876543210',
          mobile: '9876543210',
          message: 'This is a sample message from PERCEPTA agent.',
          subject: 'Test Subject',
          address: 'Demo Address, New Delhi',
        };
        for (const el of formInputs.slice(0, 6)) {
          const key = Object.keys(sampleData).find(k =>
            el.label.toLowerCase().includes(k) ||
            el.placeholder.toLowerCase().includes(k) ||
            (el.id || '').toLowerCase().includes(k)
          ) || Object.keys(sampleData)[0];
          const val = sampleData[key] || 'Sample Value';
          if (el.selector && el.selector.startsWith('#')) {
            try { await this.playwright.fill(el.selector, val); continue; } catch {}
          }
          try {
            const { x, y, width, height } = el.bbox;
            await this.playwright.clickAt(x + width / 2, y + height / 2);
            await page.keyboard.type(val);
          } catch {}
        }
        return;
      }

      default:
        throw new Error(`Unknown action: ${action.action}`);
    }
  }
}
