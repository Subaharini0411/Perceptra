/**
 * PERCEPTA - Dev Runner
 * Spawns both the Express backend and the Vite frontend concurrently.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🛰️  Launching PERCEPTA System Environment (ISRO SIH26171)...');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const nodeCmd = isWin ? 'node.exe' : 'node';

// 1. Launch Backend
const backend = spawn(nodeCmd, ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  env: { ...process.env, PORT: 5000 }
});

// 2. Launch Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  env: process.env
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
