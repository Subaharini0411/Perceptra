import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import apiRouter from './routes/api';
import * as path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve screenshots statically (local only)
const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
app.use('/screenshots', express.static(screenshotsDir));

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'PERCEPTA Backend',
    version: '1.0.0',
    status: 'running',
    mode: 'LOCAL',
    visionEngine: 'LOCAL DEMO VISION ENGINE',
    cloudCalls: 0,
    timestamp: new Date().toISOString(),
  });
});

// HTTP + WebSocket server
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Store active websockets for broadcasting
const activeClients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  activeClients.add(ws);
  console.log(`[WS] Client connected (total: ${activeClients.size})`);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'PERCEPTA WebSocket ready', mode: 'LOCAL' }));

  ws.on('close', () => {
    activeClients.delete(ws);
    console.log(`[WS] Client disconnected (total: ${activeClients.size})`);
  });
  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
    activeClients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 PERCEPTA Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`🔒 Mode: LOCAL ONLY (no external API required)`);
  console.log(`🤖 Vision: LOCAL DEMO VISION ENGINE`);
  console.log(`☁️  Cloud calls: 0`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/task      - Run a browser task`);
  console.log(`  POST /api/stop      - Stop current task`);
  console.log(`  GET  /api/status    - System status`);
  console.log(`  GET  /api/history   - Task history`);
  console.log(`  POST /api/privacy/sanitize - Sanitize text`);
  console.log(`  GET  /api/benchmarks - Run benchmarks\n`);
});

export default app;
