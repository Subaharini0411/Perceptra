/**
 * PERCEPTA - Action Executor
 * Executes browser actions through Playwright using hybrid coordinate targeting
 * combined with selector fallbacks. Does not blindly depend on static selectors.
 */

class ActionExecutor {
  /**
   * Execute an abstraction BrowserAction
   * @param {import('playwright').Page} page 
   * @param {Object} action BrowserAction abstraction
   * @returns {Promise<Object>} Execution result
   */
  async execute(page, action) {
    if (!page) {
      throw new Error('Playwright page instance is required for ActionExecutor');
    }

    const { type, coordinates, selector, value, target } = action;
    const startTime = Date.now();
    let executedMethod = 'COORDINATES';

    try {
      switch (type.toUpperCase()) {
        case 'CLICK':
          if (coordinates && coordinates.x !== undefined && coordinates.y !== undefined) {
            // Primary: Visual coordinate click
            await page.mouse.click(coordinates.x, coordinates.y);
            executedMethod = `COORDINATE_CLICK (${coordinates.x}, ${coordinates.y})`;
          } else if (selector) {
            // Fallback: Resilient selector
            await page.click(selector, { timeout: 3000 });
            executedMethod = `SELECTOR_CLICK (${selector})`;
          } else {
            throw new Error(`Cannot execute CLICK: neither coordinates nor selector provided for ${target}`);
          }
          break;

        case 'TYPE':
        case 'INPUT':
          if (coordinates && coordinates.x !== undefined && coordinates.y !== undefined) {
            // Focus via coordinates first
            await page.mouse.click(coordinates.x, coordinates.y);
            // Select all existing text and type value
            await page.keyboard.press('Control+A');
            await page.keyboard.press('Backspace');
            await page.keyboard.type(value || '', { delay: 30 });
            executedMethod = `COORDINATE_FOCUS_AND_TYPE ("${value}")`;
          } else if (selector) {
            await page.fill(selector, value || '');
            executedMethod = `SELECTOR_FILL ("${value}")`;
          }
          break;

        case 'PRESS_ENTER':
          await page.keyboard.press('Enter');
          executedMethod = 'KEYBOARD_ENTER';
          break;

        case 'SELECT':
          if (selector && value) {
            await page.selectOption(selector, value);
            executedMethod = `SELECTOR_SELECT_OPTION ("${value}")`;
          } else if (coordinates) {
            await page.mouse.click(coordinates.x, coordinates.y);
            executedMethod = `COORDINATE_SELECT_CLICK`;
          }
          break;

        case 'SCROLL':
          const scrollDelta = (action.direction === 'UP' ? -400 : 450);
          await page.evaluate((delta) => window.scrollBy({ top: delta, behavior: 'smooth' }), scrollDelta);
          await page.waitForTimeout(400);
          executedMethod = `SMOOTH_SCROLL (${scrollDelta}px)`;
          break;

        case 'NAVIGATE':
          if (action.url) {
            await page.goto(action.url, { waitUntil: 'domcontentloaded', timeout: 8000 });
            executedMethod = `NAVIGATE (${action.url})`;
          }
          break;

        default:
          throw new Error(`Unsupported action type: ${type}`);
      }

      // Small pause to allow DOM/UI to react
      await page.waitForTimeout(300);

      return {
        success: true,
        actionType: type,
        executedMethod,
        target,
        executionDurationMs: Date.now() - startTime
      };
    } catch (err) {
      return {
        success: false,
        actionType: type,
        error: err.message,
        target,
        executionDurationMs: Date.now() - startTime
      };
    }
  }
}

module.exports = new ActionExecutor();
