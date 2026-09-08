/**
 * PERCEPTA - Agent API Routes
 */

const express = require('express');
const router = express.Router();
const orchestrator = require('../services/AgentOrchestrator');
const safetyEngine = require('../services/SafetyEngine');
const eventStream = require('../services/EventStream');

// SSE Event Stream for live UI telemetry
router.get('/stream', (req, res) => {
  eventStream.handleConnection(req, res);
});

// Run natural language task
router.post('/task', async (req, res) => {
  const { task, headless = true } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task instruction string is required' });
  }

  // Trigger task asynchronously and return taskId immediately
  orchestrator.runTask(task, { headless }).catch(err => {
    console.error('[AGENT-TASK-ERROR]', err);
  });

  res.json({
    status: 'ACCEPTED',
    message: 'Task initiated in orchestrator',
    task
  });
});

// Stop current execution
router.post('/stop', (req, res) => {
  orchestrator.stopExecution();
  res.json({ status: 'STOPPED' });
});

// Resolve safety confirmation (Allow or Cancel sensitive action)
router.post('/confirm', (req, res) => {
  const { taskId, allowed = true } = req.body;
  const success = safetyEngine.resolveConfirmation(taskId, allowed);
  res.json({ success, taskId, allowed });
});

// Get agent status
router.get('/status', (req, res) => {
  res.json({
    isExecuting: orchestrator.isExecuting,
    currentTask: orchestrator.currentTask,
    historyCount: orchestrator.taskHistory.length
  });
});

// Get task history
router.get('/tasks', (req, res) => {
  res.json(orchestrator.getHistory());
});

// Get specific task details
router.get('/tasks/:id', (req, res) => {
  const task = orchestrator.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

module.exports = router;
