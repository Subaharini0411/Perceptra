/**
 * PERCEPTA - Real-Time Event Stream
 * Uses Server-Sent Events (SSE) to broadcast low-latency agent telemetry,
 * execution timeline steps, screenshot updates, and safety alerts to the React UI.
 */

class EventStream {
  constructor() {
    this.clients = new Set();
  }

  /**
   * Express middleware / route handler for SSE connection
   */
  handleConnection(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write('data: {"type":"CONNECTED","message":"PERCEPTA Telemetry Stream Active"}\n\n');

    this.clients.add(res);

    req.on('close', () => {
      this.clients.delete(res);
    });
  }

  /**
   * Broadcast an event payload to all connected clients
   */
  emit(eventType, data) {
    const payload = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
    for (const client of this.clients) {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }
}

module.exports = new EventStream();
