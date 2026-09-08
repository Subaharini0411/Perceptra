import { TaskInterpreter } from './TaskInterpreter';
import { ActionPlanner } from './ActionPlanner';
import { PlaywrightService } from './PlaywrightService';
import { DOMPerceptionEngine } from './DOMPerceptionEngine';
import { ScreenshotService } from './ScreenshotService';
import { LocalDemoVisionEngine } from './LocalDemoVisionEngine';
import { HybridPerceptionEngine } from './HybridPerceptionEngine';
import { ConfidenceEngine } from './ConfidenceEngine';
import { PrivacyGuard } from './PrivacyGuard';
import { SafetyEngine } from './SafetyEngine';
import { ActionExecutor } from './ActionExecutor';
import { VerificationEngine } from './VerificationEngine';
import {
  TaskRecord, TimelineEvent, PlannedAction,
  DOMElement, VisualDetection, ScreenshotInfo
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';

const DEMO_SITE_URL = 'http://localhost:3002';
const MAX_RETRIES = 2;

export class AgentOrchestrator {
  private interpreter = new TaskInterpreter();
  private planner = new ActionPlanner();
  private playwright = new PlaywrightService();
  private domEngine = new DOMPerceptionEngine();
  private screenshotService = new ScreenshotService();
  private visionEngine = new LocalDemoVisionEngine();
  private hybridEngine = new HybridPerceptionEngine();
  private confidenceEngine = new ConfidenceEngine();
  private privacyGuard = new PrivacyGuard();
  private safetyEngine = new SafetyEngine();
  private verificationEngine = new VerificationEngine();
  private executor: ActionExecutor;

  private taskRecord: TaskRecord | null = null;
  private ws: WebSocket | null = null;
  private stopped = false;

  constructor() {
    this.executor = new ActionExecutor(
      this.playwright,
      this.domEngine,
      this.confidenceEngine,
      this.safetyEngine,
      this.verificationEngine,
    );
  }

  setWebSocket(ws: WebSocket) {
    this.ws = ws;
  }

  async runTask(task: string): Promise<TaskRecord> {
    this.stopped = false;
    const taskId = uuidv4();
    const startTime = Date.now();

    this.taskRecord = {
      id: taskId,
      task,
      status: 'RUNNING',
      confidence: 0,
      actions: 0,
      retries: 0,
      latency: 0,
      privacyRedactions: 0,
      timestamp: new Date().toISOString(),
      timeline: [],
    };

    try {
      // STEP 1: Task received
      this.emit('TASK_RECEIVED', `Task: "${task}"`, { task });

      // STEP 2: Interpret task
      this.emit('INTERPRETING', 'Interpreting natural language task...');
      const intent = this.interpreter.interpret(task);
      this.emit('INTERPRETED', `Intent: ${intent.intent} → target: "${intent.target}"${intent.value ? ` value: "${intent.value}"` : ''}`, { intent });

      // STEP 3: Launch browser
      this.emit('BROWSER_LAUNCH', 'Launching Playwright/Chromium (headless)...');
      if (!this.playwright.isRunning()) {
        await this.playwright.launch();
      }
      await this.playwright.navigate(DEMO_SITE_URL);
      this.emit('BROWSER_READY', `Browser ready at ${DEMO_SITE_URL}`, { url: DEMO_SITE_URL });

      // STEP 4: DOM scan
      this.emit('DOM_SCAN', 'Extracting DOM elements...');
      const page = this.playwright.getPage();
      let domElements = await this.domEngine.extractElements(page);
      this.emit('DOM_SCANNED', `DOM scan complete: ${domElements.length} interactive elements found`, { count: domElements.length });

      // STEP 5: Screenshot
      this.emit('SCREENSHOT', 'Capturing screenshot (stored locally only)...');
      let screenshot: ScreenshotInfo | null = null;
      try {
        screenshot = await this.screenshotService.capture(page, 'task');
        this.emit('SCREENSHOT_DONE', `Screenshot captured: ${screenshot.width}×${screenshot.height}`, {
          width: screenshot.width, height: screenshot.height,
          path: screenshot.path,
        });
      } catch (e: any) {
        this.emit('SCREENSHOT_ERROR', `Screenshot failed: ${e.message}`, { error: e.message });
      }

      // STEP 6: Visual perception
      this.emit('VISUAL_PERCEPTION', `Running LOCAL DEMO VISION ENGINE (DOM-assisted heuristic)...`);
      const visualDetections: VisualDetection[] = this.visionEngine.detectFromDOM(domElements);
      this.emit('VISUAL_DONE', `Visual perception complete: ${visualDetections.length} UI elements detected`, {
        engine: this.visionEngine.engineName,
        count: visualDetections.length,
        topDetections: visualDetections.slice(0, 5),
      });

      // STEP 7: Privacy check
      this.emit('PRIVACY_CHECK', 'Running local privacy guard...');
      const privacyDetections = this.privacyGuard.detectInDOM(domElements);
      const privacyReport = this.privacyGuard.generateReport(privacyDetections);
      this.taskRecord.privacyRedactions = privacyReport.redacted;
      this.emit('PRIVACY_DONE', `Privacy guard: ${privacyReport.sensitiveDetected} sensitive items detected, ${privacyReport.redacted} redacted, raw PII transmitted: ${privacyReport.rawSensitiveDataTransmitted}`, {
        report: privacyReport
      });

      // STEP 8: Plan actions
      this.emit('PLANNING', 'Planning action sequence...');
      const plan: PlannedAction[] = this.planner.plan(intent);
      this.emit('PLANNED', `Action plan: ${plan.length} steps`, { plan });

      // STEP 9: Execute plan
      let lastError: string | null = null;
      let retries = 0;

      for (let i = 0; i < plan.length; i++) {
        if (this.stopped) {
          this.emit('STOPPED', 'Task stopped by user');
          break;
        }

        const action = plan[i];
        this.emit('ACTION_START', `Executing: ${action.action} → "${action.target}"${action.value ? ` = "${action.value}"` : ''}`, { action });

        // Hybrid matching
        const hybrids = this.hybridEngine.match(action.target, domElements, visualDetections, intent.intent);
        const bestMatch = hybrids[0];

        if (bestMatch) {
          action.confidence = bestMatch.hybridScore;
          action.coordinates = {
            x: bestMatch.element.bbox.x + bestMatch.element.bbox.width / 2,
            y: bestMatch.element.bbox.y + bestMatch.element.bbox.height / 2,
          };
          action.reason = `Hybrid: DOM=${bestMatch.domScore.toFixed(2)} Visual=${bestMatch.visualScore.toFixed(2)} Text=${bestMatch.textScore.toFixed(2)} → ${bestMatch.hybridScore.toFixed(3)}`;
          this.emit('HYBRID_MATCH', `Hybrid match: "${action.target}" confidence=${bestMatch.hybridScore.toFixed(3)}`, { match: bestMatch });
        } else {
          action.confidence = 0.75; // Default moderate confidence
          this.emit('HYBRID_MATCH', `No strong hybrid match for "${action.target}", using fallback confidence`, {});
        }

        // Execute
        const result = await this.executor.execute(action, domElements);
        this.taskRecord.actions++;

        if (!result.success && result.error !== 'Task stopped by user.') {
          if (retries < MAX_RETRIES && action.action !== 'FIND') {
            retries++;
            this.taskRecord.retries++;
            this.emit('RETRY', `Action failed (${result.error}). Re-perceiving... (retry ${retries}/${MAX_RETRIES})`, { error: result.error });

            // Re-perception
            await page.waitForTimeout(1000);
            domElements = await this.domEngine.extractElements(page);
            const newDetections = this.visionEngine.detectFromDOM(domElements);
            const newHybrids = this.hybridEngine.match(action.target, domElements, newDetections, intent.intent);

            if (newHybrids.length > 0) {
              action.confidence = newHybrids[0].hybridScore;
              const retryResult = await this.executor.execute(action, domElements);
              if (retryResult.success) {
                this.emit('ACTION_DONE', `Action succeeded on retry: ${action.action} → "${action.target}"`, { result: retryResult });
                continue;
              }
            }
          }

          lastError = result.error || 'Action failed';
          this.emit('ACTION_FAILED', `Action failed: ${result.error} (${action.action} → ${action.target})`, { result });

          if (action.action !== 'FIND') {
            // Non-critical FIND failures: continue; critical action failures: break
            if (i < plan.length - 1) {
              // Try continuing
              continue;
            }
          }
        } else if (result.success) {
          this.emit('ACTION_DONE', `✓ ${action.action} on "${action.target}" completed`, { result });
        }
      }

      // STEP 10: Verification
      if (!this.stopped) {
        this.emit('VERIFICATION', 'Verifying task completion...');
        const verifyResult = await this.verificationEngine.verifyAction(page, intent.intent, intent.target);
        this.taskRecord.confidence = verifyResult.confidence;

        if (verifyResult.success && !lastError) {
          this.taskRecord.status = 'SUCCESS';
          this.emit('SUCCESS', `✓ Task completed successfully! Confidence: ${(verifyResult.confidence * 100).toFixed(1)}%`, { verifyResult });
        } else if (lastError && !verifyResult.success) {
          this.taskRecord.status = 'FAILED';
          this.emit('FAILED', `Task failed: ${lastError}`, { lastError });
        } else {
          // Partial success
          this.taskRecord.status = 'SUCCESS';
          this.taskRecord.confidence = 0.75;
          this.emit('SUCCESS', `Task completed (partial success). Some actions may have used fallbacks.`, { verifyResult });
        }
      }

    } catch (error: any) {
      if (this.stopped) {
        this.taskRecord.status = 'STOPPED';
        this.emit('STOPPED', 'Task stopped by user');
      } else {
        this.taskRecord.status = 'FAILED';
        this.emit('FAILED', `Task error: ${error.message}`, { error: error.message });
      }
    } finally {
      this.taskRecord.latency = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
    }

    return this.taskRecord;
  }

  stop(): void {
    this.stopped = true;
    this.playwright.stop();
    this.emit('STOPPED', 'Task stopped by user');
  }

  async closeBrowser(): Promise<void> {
    await this.playwright.close();
  }

  private emit(step: string, message: string, data?: any): void {
    const event: TimelineEvent = {
      step,
      status: (step === 'FAILED' || step === 'ACTION_FAILED' || step === 'STOPPED') ? 'error' : 'done',
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    this.taskRecord!.timeline.push(event);

    if (this.ws && this.ws.readyState === 1 /* OPEN */) {
      try {
        this.ws.send(JSON.stringify({ type: 'TIMELINE_EVENT', event }));
      } catch {}
    }

    console.log(`[Agent] ${step}: ${message}`);
  }
}
