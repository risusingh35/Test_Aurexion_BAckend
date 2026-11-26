const { createClient } = require('redis');
const { Redis_Url } = require('../config/env');
console.log('[redis] connecting to', Redis_Url);
const client = createClient({
  url: Redis_Url,
});

client.on('error', (err) => console.error('[redis] error:', err.message));
client.on('connect', () => console.log('[redis] connected'));

const connectRedis = async () => {
  if (!client.isOpen) await client.connect();
  return client;
};

module.exports = { client, connectRedis };