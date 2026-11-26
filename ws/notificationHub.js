const { WebSocketServer } = require('ws');
const { URL } = require('url');
const { verifyToken } = require('../config/jwt');

class NotificationHub {
  constructor() {
    /** @type {Map<string, Set<import('ws').WebSocket>>} userId -> sockets */
    this.clients = new Map();
    /** @type {Set<import('ws').WebSocket>} */
    this.allSockets = new Set();
    this.wss = null;
    this.heartbeatInterval = null;
  }

  /**
   * Attach to an existing HTTP server.
   * @param {import('http').Server} server
   * @param {{ path?: string }} [opts]
   */
  init(server, opts = {}) {
    const path = opts.path || '/ws';
    this.wss = new WebSocketServer({ server, path });

    this.wss.on('connection', (socket, req) => this._onConnection(socket, req));

    // Heartbeat: terminate dead connections (half-open TCP)
    this.heartbeatInterval = setInterval(() => {
      for (const socket of this.allSockets) {
        if (socket.isAlive === false) {
          socket.terminate();
          continue;
        }
        socket.isAlive = false;
        socket.ping();
      }
    }, 30_000);
    this.heartbeatInterval.unref?.();

    this.wss.on('close', () => clearInterval(this.heartbeatInterval));
    console.log(`[ws] notification hub listening on ${path}`);
    return this.wss;
  }

  _onConnection(socket, req) {
    // ---- 1. Authenticate via ?token=... ----
    let userId;
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      if (!token) throw new Error('missing token');

      const payload = verifyToken(token);
      userId = String(payload.sub ?? payload.userId ?? payload.id);
      if (!userId || userId === 'undefined') throw new Error('token has no subject');
    } catch (err) {
      // Reject before any data exchange
      socket.close(4001, `Unauthorized: ${err.message}`);
      return;
    }

    // ---- 2. Register socket under the user ----
    socket.userId = userId;
    socket.isAlive = true;
    socket.on('pong', () => { socket.isAlive = true; });

    if (!this.clients.has(userId)) this.clients.set(userId, new Set());
    this.clients.get(userId).add(socket);
    this.allSockets.add(socket);

    console.log(`[ws] user ${userId} connected (sockets for user: ${this.clients.get(userId).size})`);

    // Ack so the client knows auth succeeded
    this._safeSend(socket, { type: 'connected', userId });

    // ---- 3. Disconnect / cleanup ----
    const cleanup = () => {
      const set = this.clients.get(userId);
      if (set) {
        set.delete(socket);
        if (set.size === 0) this.clients.delete(userId);   // drop empty Set
      }
      this.allSockets.delete(socket);
      console.log(`[ws] user ${userId} disconnected (remaining: ${this.clients.get(userId)?.size ?? 0})`);
    };

    socket.on('close', cleanup);
    socket.on('error', (err) => {
      console.error(`[ws] socket error for user ${userId}:`, err.message);
      cleanup();
    });

    // Optional: ignore inbound messages, or handle simple pings
    socket.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg?.type === 'ping') this._safeSend(socket, { type: 'pong', ts: Date.now() });
      } catch {
        /* ignore malformed inbound */
      }
    });
  }

  _safeSend(socket, payload) {
    if (socket.readyState !== socket.OPEN) return false;
    try {
      socket.send(JSON.stringify(payload));
      return true;
    } catch (err) {
      console.error('[ws] send failed:', err.message);
      return false;
    }
  }

  /**
   * Send a payload to every socket belonging to a user.
   * @returns {number} number of sockets that received it
   */
  sendToUser(userId, payload) {
    const set = this.clients.get(String(userId));
    if (!set || set.size === 0) return 0;
    let sent = 0;
    for (const socket of set) {
      if (this._safeSend(socket, payload)) sent++;
    }
    return sent;
  }

  /**
   * Send a payload to every connected socket.
   * @returns {number} number of sockets that received it
   */
  broadcast(payload) {
    let sent = 0;
    for (const socket of this.allSockets) {
      if (this._safeSend(socket, payload)) sent++;
    }
    return sent;
  }

  /** Debug/introspection */
  stats() {
    return {
      users: this.clients.size,
      sockets: this.allSockets.size,
    };
  }

  /** Graceful shutdown */
  async close() {
    clearInterval(this.heartbeatInterval);
    for (const socket of this.allSockets) socket.close(1001, 'Server shutting down');
    await new Promise((resolve) => this.wss?.close(resolve));
  }
}

// Singleton — import this everywhere
module.exports = new NotificationHub();
