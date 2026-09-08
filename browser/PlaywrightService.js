/**
 * PERCEPTA - Playwright Browser Service
 * Manages the Chromium browser lifecycle, page navigation, screenshot capture,
 * and coordination between DOM extraction and action execution.
 */

let chromium;
try {
  chromium = require('playwright').chromium;
} catch (e1) {
  try {
    chromium = require('../backend/node_modules/playwright').chromium;
  } catch (e2) {
    try {
      chromium = require(path.join(__dirname, '..', 'backend', 'node_modules', 'playwright')).chromium;
    } catch (e3) {
      console.warn('[PERCEPTA-BROWSER] Playwright resolution fallback notice:', e3.message);
    }
  }
}
const path = require('path');
const fs = require('fs');

class PlaywrightService {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isRunning = false;
    this.viewport = { width: 1280, height: 800 };
    this.currentUrl = 'about:blank';
  }

  /**
   * Launch or attach to local browser instance
   */
  async startBrowser(options = { headless: true }) {
    if (this.browser && this.page) {
      return { isRunning: true, url: this.currentUrl };
    }

    try {
      this.browser = await chromium.launch({
        headless: options.headless ?? true,
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1280,800'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: this.viewport,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PERCEPTA/1.0 (ISRO SIH26171 Agent)'
      });

      this.page = await this.context.newPage();
      this.isRunning = true;
      console.log('[PERCEPTA-BROWSER] Playwright Chromium instance initialized');
      return { isRunning: true, url: this.currentUrl };
    } catch (err) {
      console.error('[PERCEPTA-BROWSER] Failed to launch Playwright:', err.message);
      this.isRunning = false;
      throw err;
    }
  }

  /**
   * Navigates to a target URL
   * @param {string} url 
   */
  async navigateTo(url) {
    if (!this.page) {
      await this.startBrowser();
    }
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    this.currentUrl = this.page.url();
    // Brief settle delay
    await this.page.waitForTimeout(300);
    return { url: this.currentUrl, title: await this.page.title() };
  }

  /**
   * Captures screenshot of current page as base64
   * @returns {Promise<string>} Base64 image string
   */
  async captureScreenshot() {
    if (!this.page) {
      throw new Error('Browser not initialized for screenshot');
    }
    const buffer = await this.page.screenshot({
      type: 'jpeg',
      quality: 85,
      fullPage: false
    });
    return buffer.toString('base64');
  }

  /**
   * Returns current active page instance
   */
  getPage() {
    return this.page;
  }

  /**
   * Close and cleanup browser
   */
  async close() {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
    } catch (e) {
      // Ignore cleanup warnings
    } finally {
      this.browser = null;
      this.context = null;
      this.page = null;
      this.isRunning = false;
    }
  }
}

module.exports = new PlaywrightService();
