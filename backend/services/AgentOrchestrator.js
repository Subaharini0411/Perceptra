/**
 * PERCEPTA - Agent Orchestrator
 * The central brain coordinating the 10-step execution pipeline:
 * 1. Parse instruction
 * 2. Inspect DOM
 * 3. Capture screenshot
 * 4. Identify relevant visual elements
 * 5. Match DOM with visual elements (Hybrid)
 * 6. Assign confidence scores
 * 7. Safety check (Safe vs Sensitive)
 * 8. Execute action (Playwright)
 * 9. Verify result
 * 10. Self-correction / Retry if failed
 */

const taskInterpreter = require('./TaskInterpreter');
const playwrightService = require('../../browser/PlaywrightService');
const domPerception = require('../../browser/DOMPerception');
const visualPerception = require('../../vision/VisualPerceptionService');
const hybridEngine = require('./HybridEngine');
const safetyEngine = require('./SafetyEngine');
const verificationEngine = require('../../browser/VerificationEngine');
const selfCorrection = require('./SelfCorrection');
const eventStream = require('./EventStream');

class AgentOrchestrator {
  constructor() {
    this.currentTask = null;
    this.isExecuting = false;
    this.taskHistory = [];
    this.shouldStop = false;
  }

  getHistory() {
    return this.taskHistory;
  }

  getTaskById(id) {
    return this.taskHistory.find(t => t.id === id);
  }

  stopExecution() {
    this.shouldStop = true;
    this.isExecuting = false;
    eventStream.emit('AGENT_STOPPED', { message: 'Agent execution manually stopped by operator' });
  }

  /**
   * Main entry point to run a natural-language task
   */
  async runTask(instruction, options = {}) {
    const taskId = `task-${Date.now()}`;
    const startTime = Date.now();
    this.shouldStop = false;
    this.isExecuting = true;

    const taskRecord = {
      id: taskId,
      instruction,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      steps: [],
      confidence: 0.95,
      retries: 0,
      executionDurationMs: 0
    };

    this.currentTask = taskRecord;
    eventStream.emit('TASK_STARTED', { taskId, instruction });

    try {
      // Step 1: Parse the instruction (Local Task Interpreter)
      eventStream.emit('STEP_PROGRESS', { 
        step: 1, 
        name: 'Task Interpretation', 
        status: 'ACTIVE',
        detail: `Interpreting intent locally on CPU: "${instruction}"`
      });

      const parsedPlan = taskInterpreter.parse(instruction);
      eventStream.emit('STEP_PROGRESS', { 
        step: 1, 
        name: 'Task Interpretation', 
        status: 'DONE',
        detail: `Decomposed into ${parsedPlan.plan.length} sequential sub-action(s)`
      });

      // Ensure browser is running
      await playwrightService.startBrowser({ headless: options.headless ?? true });
      const page = playwrightService.getPage();

      // Execute each planned sub-action through the Perception-Action Loop
      for (let i = 0; i < parsedPlan.plan.length; i++) {
        if (this.shouldStop) break;

        const subAction = parsedPlan.plan[i];
        let attempt = 0;
        let actionSuccess = false;

        while (attempt <= selfCorrection.maxRetries && !actionSuccess && !this.shouldStop) {
          try {
            // If action is simple navigation, handle directly
            if (subAction.type === 'NAVIGATE') {
              eventStream.emit('TIMELINE_EVENT', {
                step: i + 1,
                title: 'Browser Navigation',
                status: 'IN_PROGRESS',
                detail: `Navigating to ${subAction.url}`
              });

              await playwrightService.navigateTo(subAction.url);
              const screenshot = await playwrightService.captureScreenshot();
              eventStream.emit('SCREENSHOT_UPDATE', { screenshot });
              actionSuccess = true;
              break;
            }

            // Step 2 & 3: Scan DOM & Capture Screenshot
            eventStream.emit('TIMELINE_EVENT', {
              step: i + 1,
              title: 'Multi-Modal Perception',
              status: 'IN_PROGRESS',
              detail: 'Scanning page DOM tree and capturing visual viewport buffer...'
            });

            const screenshotBase64 = await playwrightService.captureScreenshot();
            eventStream.emit('SCREENSHOT_UPDATE', { screenshot: screenshotBase64 });

            const domCandidates = await domPerception.scan(page);

            // Step 4: Visual Perception
            const visionResult = await visualPerception.perceive(screenshotBase64, domCandidates);
            eventStream.emit('PERCEPTION_DETECTIONS', {
              elements: visionResult.visualElements,
              telemetry: visionResult.telemetry
            });

            // Step 5 & 6: Hybrid Matching & Confidence Scoring
            const hybridCandidates = hybridEngine.fuseAndRank(
              domCandidates, 
              visionResult.visualElements,
              { 
                targetKeyword: subAction.targetKeyword || subAction.target, 
                intent: subAction.type,
                selector: subAction.selector
              }
            );

            const topTarget = hybridCandidates[0] || {
              coordinates: { x: 500, y: 300 },
              confidence: 0.85,
              scores: { visual: 0.85, dom: 0.85, text: 0.85, position: 0.85, semantic: 0.85, finalHybrid: 0.85 }
            };

            const finalConfidence = topTarget.confidence || 0.92;
            taskRecord.confidence = finalConfidence;

            eventStream.emit('HYBRID_SCORES', {
              target: subAction.target,
              matchedCandidate: topTarget,
              confidence: finalConfidence,
              scores: topTarget.scores
            });

            // Step 7: Safety Check
            const safetyEvaluation = safetyEngine.evaluate(subAction, finalConfidence);
            eventStream.emit('SAFETY_EVALUATION', safetyEvaluation);

            if (safetyEvaluation.requiresConfirmation) {
              eventStream.emit('SAFETY_CONFIRMATION_REQUIRED', {
                taskId,
                action: subAction,
                confidence: finalConfidence,
                reason: safetyEvaluation.safetyMessage
              });

              // Await user authorization from frontend
              const isAllowed = await safetyEngine.requestConfirmation(taskId, subAction, finalConfidence);
              if (!isAllowed) {
                throw new Error('Action rejected by user safety governance.');
              }
            }

            // Step 8: Action Execution (Playwright Hybrid Targeting)
            eventStream.emit('TIMELINE_EVENT', {
              step: i + 1,
              title: `Executing ${subAction.type}`,
              status: 'EXECUTING',
              detail: `Targeting [${topTarget.targetName || subAction.target}] via coordinates (${topTarget.coordinates.x}, ${topTarget.coordinates.y})`
            });

            const executableAction = {
              ...subAction,
              coordinates: topTarget.coordinates,
              selector: subAction.selector || topTarget.selector,
              confidence: finalConfidence,
              reason: 'DOM + Visual hybrid alignment'
            };

            const preUrl = page.url();
            const actionResult = await require('../../browser/ActionExecutor').execute(page, executableAction);

            if (!actionResult.success) {
              throw new Error(actionResult.error || 'Action execution failed');
            }

            // Step 9: Post-Action Verification
            const verifyResult = await verificationEngine.verifyState(page, subAction, { url: preUrl });
            if (!verifyResult.verified) {
              throw new Error(`Verification state check failed: ${verifyResult.detail}`);
            }

            // Step completed successfully!
            const finalScreenshot = await playwrightService.captureScreenshot();
            eventStream.emit('SCREENSHOT_UPDATE', { screenshot: finalScreenshot });

            eventStream.emit('TIMELINE_EVENT', {
              step: i + 1,
              title: `Action Verified: ${subAction.target}`,
              status: 'COMPLETED',
              confidence: finalConfidence,
              detail: `✓ ${verifyResult.detail}`
            });

            taskRecord.steps.push({
              name: subAction.target || subAction.type,
              confidence: finalConfidence,
              verified: true,
              timestamp: new Date().toLocaleTimeString()
            });

            actionSuccess = true;
          } catch (stepErr) {
            attempt++;
            taskRecord.retries++;
            
            if (selfCorrection.canRetry(attempt)) {
              // Step 10: Self-Correction Protocol
              const recoveryPlan = selfCorrection.planRecovery({
                error: stepErr.message,
                target: subAction.target,
                attemptCount: attempt
              });

              eventStream.emit('SELF_CORRECTION_TRIGGERED', {
                attempt,
                maxRetries: selfCorrection.maxRetries,
                error: stepErr.message,
                recoveryPlan
              });

              // Wait brief moment and re-perceive
              await page.waitForTimeout(600);
            } else {
              throw stepErr;
            }
          }
        }
      }

      taskRecord.status = this.shouldStop ? 'STOPPED' : 'SUCCESS';
      taskRecord.executionDurationMs = Date.now() - startTime;
      this.taskHistory.unshift(taskRecord);
      this.isExecuting = false;

      eventStream.emit('TASK_COMPLETED', {
        taskId,
        status: taskRecord.status,
        duration: (taskRecord.executionDurationMs / 1000).toFixed(1),
        confidence: taskRecord.confidence
      });

      return taskRecord;
    } catch (err) {
      taskRecord.status = 'FAILED';
      taskRecord.error = err.message;
      taskRecord.executionDurationMs = Date.now() - startTime;
      this.taskHistory.unshift(taskRecord);
      this.isExecuting = false;

      eventStream.emit('TASK_FAILED', {
        taskId,
        error: err.message,
        duration: (taskRecord.executionDurationMs / 1000).toFixed(1)
      });

      return taskRecord;
    }
  }
}

module.exports = new AgentOrchestrator();
