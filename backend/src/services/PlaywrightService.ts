import { Browser, BrowserContext, Page, chromium } from 'playwright';

export class PlaywrightService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private stopped = false;

  async launch(): Promise<void> {
    this.stopped = false;
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'en-IN',
    });
    this.page = await this.context.newPage();
  }

  getPage(): Page {
    if (!this.page) throw new Error('Browser not launched. Call launch() first.');
    return this.page;
  }

  async navigate(url: string): Promise<void> {
    this.checkStopped();
    await this.getPage().goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  async click(selector: string): Promise<void> {
    this.checkStopped();
    const page = this.getPage();
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    await page.click(selector);
  }

  async clickAt(x: number, y: number): Promise<void> {
    this.checkStopped();
    await this.getPage().mouse.click(x + 0.5, y + 0.5);
  }

  async fill(selector: string, value: string): Promise<void> {
    this.checkStopped();
    const page = this.getPage();
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    await page.fill(selector, value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    this.checkStopped();
    const page = this.getPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    try {
      await page.selectOption(selector, { label: value });
    } catch {
      await page.selectOption(selector, { value });
    }
  }

  async scroll(direction: 'down' | 'up' = 'down', amount = 300): Promise<void> {
    this.checkStopped();
    const page = this.getPage();
    const scrollAmount = direction === 'down' ? amount : -amount;
    await page.evaluate((amt: number) => {
      (window as Window).scrollBy(0, amt);
    }, scrollAmount);
    await page.waitForTimeout(300);
  }

  async type(selector: string, text: string): Promise<void> {
    this.checkStopped();
    await this.getPage().type(selector, text, { delay: 50 });
  }

  async waitForSelector(selector: string, timeout = 5000): Promise<boolean> {
    try {
      await this.getPage().waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  async getURL(): Promise<string> {
    return this.getPage().url();
  }

  async getTitle(): Promise<string> {
    return this.getPage().title();
  }

  async isVisible(selector: string): Promise<boolean> {
    try {
      return await this.getPage().isVisible(selector);
    } catch {
      return false;
    }
  }

  async getText(selector: string): Promise<string> {
    try {
      return (await this.getPage().textContent(selector)) || '';
    } catch {
      return '';
    }
  }

  stop(): void {
    this.stopped = true;
  }

  async close(): Promise<void> {
    this.stop();
    try { await this.page?.close(); } catch {}
    try { await this.context?.close(); } catch {}
    try { await this.browser?.close(); } catch {}
    this.page = null;
    this.context = null;
    this.browser = null;
  }

  isRunning(): boolean {
    return !!this.browser && !this.stopped;
  }

  private checkStopped(): void {
    if (this.stopped) throw new Error('Task stopped by user.');
  }
}
