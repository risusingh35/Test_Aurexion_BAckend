const dns = require('node:dns');
const http = require('http');
require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');
const notificationHub = require('./ws/notificationHub');
const { connectRedis } = require('./config/redis');

const port = process.env.PORT || 3000;

// MongoDB Atlas SRV DNS resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

const server = http.createServer(app);

// attach the WebSocket hub to the same HTTP server
notificationHub.init(server, { path: '/ws' });

server.listen(port, async () => {
  await connectDB();
   try {
    require('./scripts/redis-check') // seed the database with initial data
    // await connectRedis();ççç
    console.log('[redis] ready');
  } catch (err) {
    console.error('[redis] failed to connect:', err.message);
    // decide: fail fast (process.exit(1)) or fail open (continue)
  }
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`WebSocket hub on ws://localhost:${port}/ws?token=<jwt>`);
});

// graceful shutdown (optional but recommended)
const shutdown = async () => {
  console.log('Shutting down...');
  await notificationHub.close();
  server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);