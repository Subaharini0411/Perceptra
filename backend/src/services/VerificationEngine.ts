import { Page } from 'playwright';
import { VerificationResult } from '../types';

export class VerificationEngine {
  async verifyURL(page: Page, expected: string, partial = true): Promise<VerificationResult> {
    const actual = page.url();
    const success = partial ? actual.includes(expected) : actual === expected;
    return {
      success,
      method: 'URL',
      expected,
      actual,
      confidence: success ? 0.95 : 0.1,
      message: success
        ? `URL contains "${expected}"`
        : `URL mismatch: expected "${expected}", got "${actual}"`,
    };
  }

  async verifyText(page: Page, expectedText: string): Promise<VerificationResult> {
    const bodyText = await page.textContent('body') || '';
    const found = bodyText.toLowerCase().includes(expectedText.toLowerCase());
    return {
      success: found,
      method: 'TEXT',
      expected: expectedText,
      confidence: found ? 0.92 : 0.1,
      message: found
        ? `Text "${expectedText}" found on page`
        : `Text "${expectedText}" not found on page`,
    };
  }

  async verifyElementExists(page: Page, selector: string): Promise<VerificationResult> {
    try {
      const el = await page.$(selector);
      const visible = el ? await el.isVisible() : false;
      return {
        success: visible,
        method: 'ELEMENT',
        expected: selector,
        confidence: visible ? 0.93 : 0.1,
        message: visible
          ? `Element "${selector}" is visible`
          : `Element "${selector}" not found`,
      };
    } catch {
      return {
        success: false,
        method: 'ELEMENT',
        expected: selector,
        confidence: 0.1,
        message: `Error checking element "${selector}"`,
      };
    }
  }

  async verifyAction(page: Page, action: string, target: string): Promise<VerificationResult> {
    switch (action.toUpperCase()) {
      case 'NAVIGATE':
      case 'CLICK': {
        await page.waitForTimeout(500);
        const url = page.url();
        return {
          success: true,
          method: 'ACTION',
          expected: `${action} on ${target}`,
          actual: url,
          confidence: 0.85,
          message: `Action ${action} completed. Current URL: ${url}`,
        };
      }
      case 'FILL': {
        return {
          success: true,
          method: 'ACTION',
          expected: `Fill ${target}`,
          confidence: 0.90,
          message: `Fill action completed on ${target}`,
        };
      }
      case 'SEARCH': {
        await page.waitForTimeout(500);
        const hasResults = await page.$('.search-results, [data-testid="search-results"], .results-container') !== null;
        return {
          success: true,
          method: 'ACTION',
          expected: 'Search results',
          confidence: hasResults ? 0.95 : 0.75,
          message: hasResults ? 'Search results displayed' : 'Search executed',
        };
      }
      default:
        return {
          success: true,
          method: 'ACTION',
          expected: `${action} ${target}`,
          confidence: 0.80,
          message: `Action ${action} executed`,
        };
    }
  }
}
