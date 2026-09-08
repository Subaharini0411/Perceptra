import { Page } from 'playwright';
import { ScreenshotInfo } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotService {
  private screenshotDir: string;

  constructor() {
    this.screenshotDir = path.join(process.cwd(), '..', 'screenshots');
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async capture(page: Page, name?: string): Promise<ScreenshotInfo> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name || 'screenshot'}_${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, filename);

    const viewport = page.viewportSize() || { width: 1280, height: 720 };

    await page.screenshot({ path: filepath, fullPage: false });

    const base64 = fs.readFileSync(filepath).toString('base64');

    return {
      path: filepath,
      width: viewport.width,
      height: viewport.height,
      timestamp: new Date().toISOString(),
      base64: `data:image/png;base64,${base64}`,
    };
  }
}
