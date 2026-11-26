require('dotenv').config();
const { createClient } = require('redis');

(async () => {
  console.log('REDIS_URL =', process.env.REDIS_URL || '(undefined → default)');
  const client = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
  client.on('error', (e) => console.error('client error:', e.message));

  try {
    await client.connect();
    console.log('connected:', client.isReady);
    console.log('PING →', await client.ping());
    await client.zAdd('rate_limit:smoke', { score: Date.now(), value: 'a' });
    console.log('ZCARD →', await client.zCard('rate_limit:smoke'));
    await client.del('rate_limit:smoke');
  } catch (e) {
    console.error('FAILED:', e.message);
  } finally {
    await client.quit();
  }
})();