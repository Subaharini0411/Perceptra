/**
 * PERCEPTA - Main Server Entry Point
 * Smart India Hackathon 2026 (PS ID: SIH26171 / ISRO)
 * "On-device Visual Perception for Light-weight Browser Agents"
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const agentRoutes = require('./routes/agentRoutes');
const perceptionRoutes = require('./routes/perceptionRoutes');
const benchmarkRoutes = require('./routes/benchmarkRoutes');
const systemRoutes = require('./routes/systemRoutes');
const playwrightService = require('../browser/PlaywrightService');
const visualPerception = require('../vision/VisualPerceptionService');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve Local Demo Site
const demoPath = path.join(__dirname, '..', 'demo-site');
app.use('/demo', express.static(demoPath));

// Mount Core API Subsystems
app.use('/api/agent', agentRoutes);
app.use('/api/perception', perceptionRoutes);
app.use('/api/benchmark', benchmarkRoutes);
app.use('/api/system', systemRoutes);

// Serve Production Frontend (after `npm run build` in /frontend)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const fs = require('fs');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback — all non-API routes return index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/demo')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
  console.log('📦 Production frontend served from frontend/dist');
}

// Root Status / Health Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    name: 'PERCEPTA',
    tagline: 'See the Web. Understand Locally. Act Safely.',
    sihProblemStatement: 'SIH26171',
    agency: 'Indian Space Research Organisation (ISRO)',
    status: 'ONLINE',
    demoUrl: `/demo/index.html`
  });
});

if (!fs.existsSync(frontendDist)) {
  app.get('/', (req, res) => {
    res.json({
      name: 'PERCEPTA',
      tagline: 'See the Web. Understand Locally. Act Safely.',
      sihProblemStatement: 'SIH26171',
      agency: 'Indian Space Research Organisation (ISRO)',
      status: 'ONLINE',
      notice: 'Frontend build not detected. Run `cd frontend && npm run build`'
    });
  });
}

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 PERCEPTA Server active on http://localhost:${PORT}`);
  console.log(`🛰️  ISRO SIH26171 - On-Device Visual Browser Agent`);
  console.log(`📂 Demo Site served at: http://localhost:${PORT}/demo/index.html`);
  console.log(`⚡ Inference: CPU-First On-Device (Zero Cloud Keys Needed)`);
  console.log(`=======================================================`);

  // Pre-initialize vision detector
  try {
    await visualPerception.initialize();
  } catch (e) {
    console.warn('[PERCEPTA] Vision warmup notice:', e.message);
  }
});

// Clean shutdown handler
process.on('SIGINT', async () => {
  console.log('\n[PERCEPTA] Shutting down gracefully...');
  await playwrightService.close();
  server.close(() => {
    process.exit(0);
  });
});
