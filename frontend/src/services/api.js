/**
 * PERCEPTA - Frontend API Client & Real-Time SSE Consumer
 */

const API_BASE = ''; // Uses Vite proxy to http://localhost:5000

export const api = {
  // Agent Tasks
  async runTask(task, headless = true) {
    const res = await fetch(`${API_BASE}/api/agent/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, headless })
    });
    return res.json();
  },

  async stopAgent() {
    const res = await fetch(`${API_BASE}/api/agent/stop`, { method: 'POST' });
    return res.json();
  },

  async confirmAction(taskId, allowed = true) {
    const res = await fetch(`${API_BASE}/api/agent/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, allowed })
    });
    return res.json();
  },

  async getStatus() {
    const res = await fetch(`${API_BASE}/api/agent/status`);
    return res.json();
  },

  async getTasks() {
    const res = await fetch(`${API_BASE}/api/agent/tasks`);
    return res.json();
  },

  // Perception
  async analyzePerception(payload = {}) {
    const res = await fetch(`${API_BASE}/api/perception/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getWeights() {
    const res = await fetch(`${API_BASE}/api/perception/weights`);
    return res.json();
  },

  async updateWeights(weights) {
    const res = await fetch(`${API_BASE}/api/perception/weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights)
    });
    return res.json();
  },

  // Benchmarks
  async getBenchmarks() {
    const res = await fetch(`${API_BASE}/api/benchmark/results`);
    return res.json();
  },

  async runBenchmarkSuite() {
    const res = await fetch(`${API_BASE}/api/benchmark/run`, { method: 'POST' });
    return res.json();
  },

  // System & Privacy Telemetry
  async getSystemStats() {
    const res = await fetch(`${API_BASE}/api/system/stats`);
    return res.json();
  },

  // Subscribe to real-time SSE stream
  subscribeToStream(onMessage) {
    const eventSource = new EventSource(`${API_BASE}/api/agent/stream`);
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    eventSource.onerror = (err) => {
      console.warn('SSE stream error/reconnecting...', err);
    };
    return () => eventSource.close();
  }
};
