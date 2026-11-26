const { client } = require('../config/redis');

/**
 * Sliding-window rate limiter using a Redis sorted set.
 *
 * - Each request is a member scored by its millisecond timestamp.
 * - Old members (score < now - window) are evicted with ZREMRANGEBYSCORE.
 * - ZCARD counts requests still inside the window.
 * - If under the limit, the new request is added with ZADD and the key TTL
 *   is refreshed so idle users don't leak memory.
 *
 * @param {string} userId
 * @param {number} [limit=100]     max requests per window
 * @param {number} [windowSec=60]  window size in seconds
 * @returns {Promise<{ allowed: boolean, remaining: number, retryAfter: number, count: number }>}
 */
async function rateLimiter(userId, limit = 100, windowSec = 60) {
  const key = `rate_limit:${userId}`;
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  // Unique member: two requests in the same ms would otherwise collide in the ZSET.
  const member = `${now}-${Math.random().toString(36).slice(2, 8)}`;

  // Atomic: evict expired → count → (conditionally) add → refresh TTL.
  // A Lua script keeps the check-and-add race-free across concurrent requests.
  const lua = `
    local key      = KEYS[1]
    local now      = tonumber(ARGV[1])
    local window   = tonumber(ARGV[2])
    local limit    = tonumber(ARGV[3])
    local member   = ARGV[4]
    local ttlMs    = tonumber(ARGV[5])

    -- 1. Remove requests older than the window
    redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

    -- 2. Count current requests in window
    local count = redis.call('ZCARD', key)

    -- 3. Over limit? Return retry hint (ms until oldest request expires)
    if count >= limit then
      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
      local oldestScore = oldest[2] and tonumber(oldest[2]) or now
      local retryAfterMs = math.max(0, (oldestScore + window) - now)
      return { 0, count, retryAfterMs }
    end

    -- 4. Record this request and keep the key alive
    redis.call('ZADD', key, now, member)
    redis.call('PEXPIRE', key, ttlMs)

    return { 1, count + 1, 0 }
  `;

  const [allowed, count, retryAfterMs] = await client.eval(lua, {
    keys: [key],
    arguments: [
      String(now),
      String(windowSec * 1000),
      String(limit),
      member,
      String(windowSec * 1000),   // TTL = window length (covers the whole window)
    ],
  });

  const retryAfterSec = Math.ceil(Number(retryAfterMs) / 1000);

  return {
    allowed: Number(allowed) === 1,
    remaining: Math.max(0, limit - Number(count)),
    retryAfter: retryAfterSec,
    count: Number(count),
  };
}

module.exports = { rateLimiter };