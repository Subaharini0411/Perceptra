/**
 * PERCEPTA - Perception API Routes
 */

const express = require('express');
const router = express.Router();
const playwrightService = require('../../browser/PlaywrightService');
const domPerception = require('../../browser/DOMPerception');
const visualPerception = require('../../vision/VisualPerceptionService');
const hybridEngine = require('../services/HybridEngine');

// Full multi-modal analysis of current page
router.post('/analyze', async (req, res) => {
  try {
    const { url = 'http://localhost:5000/demo/index.html' } = req.body;
    
    if (!playwrightService.isRunning) {
      await playwrightService.startBrowser({ headless: true });
      await playwrightService.navigateTo(url);
    } else if (url && url !== playwrightService.currentUrl) {
      await playwrightService.navigateTo(url);
    }

    const page = playwrightService.getPage();
    const screenshot = await playwrightService.captureScreenshot();
    const domCandidates = await domPerception.scan(page);
    const visionResult = await visualPerception.perceive(screenshot, domCandidates);

    const hybridRanked = hybridEngine.fuseAndRank(domCandidates, visionResult.visualElements, {
      targetKeyword: req.body.keyword || '',
      intent: req.body.intent || 'CLICK'
    });

    res.json({
      success: true,
      url: playwrightService.currentUrl,
      screenshot,
      elementCount: domCandidates.length,
      visualDetections: visionResult.visualElements,
      hybridMatches: hybridRanked,
      telemetry: visionResult.telemetry,
      modelInfo: visionResult.modelInfo,
      weights: hybridEngine.getWeights()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Capture only screenshot
router.post('/screenshot', async (req, res) => {
  try {
    if (!playwrightService.isRunning) {
      await playwrightService.startBrowser({ headless: true });
      await playwrightService.navigateTo('http://localhost:5000/demo/index.html');
    }
    const screenshot = await playwrightService.captureScreenshot();
    res.json({ screenshot, url: playwrightService.currentUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hybrid weights tuning
router.get('/weights', (req, res) => {
  res.json(hybridEngine.getWeights());
});

router.post('/weights', (req, res) => {
  hybridEngine.setWeights(req.body);
  res.json({ success: true, weights: hybridEngine.getWeights() });
});

module.exports = router;
