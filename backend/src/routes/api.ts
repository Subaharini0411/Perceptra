import { Router, Request, Response } from 'express';
import { AgentOrchestrator } from '../services/AgentOrchestrator';
import { TaskInterpreter } from '../services/TaskInterpreter';
import { PrivacyGuard } from '../services/PrivacyGuard';
import { RedactionEngine } from '../services/RedactionEngine';
import { BenchmarkService } from '../services/BenchmarkService';
import { ActionPlanner } from '../services/ActionPlanner';
import { TaskRecord, AgentSettings } from '../types';

const router = Router();
const orchestrator = new AgentOrchestrator();
const taskHistory: TaskRecord[] = [];
const benchmarkService = new BenchmarkService();
const privacyGuard = new PrivacyGuard();
const redactionEngine = new RedactionEngine();
const taskInterpreter = new TaskInterpreter();

let currentSettings: AgentSettings = {
  inferenceMode: 'CPU',
  visionEngine: 'LocalDemoVisionEngine',
  confidenceThreshold: 0.70,
  maxRetries: 2,
  autoRetry: true,
  sensitiveActionConfirmation: true,
  offlineMode: true,
  cvOverlay: true,
};

// POST /api/task
router.post('/task', async (req: Request, res: Response) => {
  const { task } = req.body;
  if (!task || typeof task !== 'string') {
    return res.status(400).json({ error: 'task string is required' });
  }

  // Privacy check on incoming task
  const taskDetections = privacyGuard.detectInText(task);
  if (taskDetections.length > 0) {
    console.log(`[Privacy] Task contains ${taskDetections.length} sensitive items`);
  }

  try {
    const record = await orchestrator.runTask(task.trim());
    taskHistory.unshift(record);
    if (taskHistory.length > 50) taskHistory.splice(50);
    return res.json({ success: true, record });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/stop
router.post('/stop', (req: Request, res: Response) => {
  orchestrator.stop();
  return res.json({ success: true, message: 'Task stopped' });
});

// GET /api/status
router.get('/status', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    mode: 'LOCAL',
    visionEngine: 'LOCAL DEMO VISION ENGINE',
    inferenceMode: currentSettings.inferenceMode,
    offlineMode: currentSettings.offlineMode,
    cloudCalls: 0,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/history
router.get('/history', (req: Request, res: Response) => {
  return res.json({ history: taskHistory });
});

// POST /api/perception
router.post('/perception', (req: Request, res: Response) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'task required' });
  const intent = taskInterpreter.interpret(task);
  const planner = new ActionPlanner();
  const plan = planner.plan(intent);
  return res.json({ intent, plan, engine: 'LOCAL DEMO VISION ENGINE' });
});

// POST /api/privacy/sanitize
router.post('/privacy/sanitize', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }

  // NEVER log the original text (could contain PII)
  const detections = privacyGuard.detectInText(text);
  const sanitized = redactionEngine.redactText(text, detections);
  const report = privacyGuard.generateReport(detections);

  // Verify sanitized output is safe
  const guard = privacyGuard.validatePayloadSafe(sanitized);

  // LOG: only safe information
  console.log(`[Privacy] Detected: ${report.sensitiveDetected}, Redacted: ${report.redacted}, Raw transmitted: 0`);

  return res.json({
    original: '[NOT RETURNED — privacy policy prevents returning raw data]',
    sanitized,
    report: {
      ...report,
      detections: report.detections.map(d => ({
        ...d,
        value: '[HIDDEN]', // Never return raw PII values
      })),
    },
    networkSafe: guard.safe,
    violations: guard.violations,
  });
});

// POST /api/plan
router.post('/plan', (req: Request, res: Response) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'task required' });
  const planner = new ActionPlanner();
  const intent = taskInterpreter.interpret(task);
  const plan = planner.plan(intent);
  return res.json({ intent, plan });
});

// POST /api/execute
router.post('/execute', (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Use /api/task for full task execution' });
});

// POST /api/verify
router.post('/verify', (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Verification endpoint active' });
});

// GET /api/benchmarks
router.get('/benchmarks', async (req: Request, res: Response) => {
  try {
    const results = await benchmarkService.run();
    return res.json({ results, isDemoData: false });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/settings
router.get('/settings', (req: Request, res: Response) => {
  return res.json({ settings: currentSettings });
});

// POST /api/settings
router.post('/settings', (req: Request, res: Response) => {
  const updates = req.body;
  currentSettings = { ...currentSettings, ...updates };
  return res.json({ settings: currentSettings });
});

export default router;
