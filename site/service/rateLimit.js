// In-memory sliding-window limiter. Each rule is { windowMs, max }.
// `keyFn` picks what to count by (default: the authenticated user's email).
// For unauthenticated routes, pass a keyFn like `(req) => req.ip`.
function rateLimit(rules, keyFn = (req) => req.user.email) {
  const longest = Math.max(...rules.map((r) => r.windowMs));
  const hits = new Map(); // key -> timestamps of their recent counted requests

  // Occasionally drop keys that have been quiet, so the map can't grow forever
  setInterval(() => {
    const now = Date.now();
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < longest)) hits.delete(key);
    }
  }, 10 * 60_000).unref();

  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const times = (hits.get(key) ?? []).filter((t) => now - t < longest);

    for (const { windowMs, max } of rules) {
      const inWindow = times.filter((t) => now - t < windowMs);
      if (inWindow.length >= max) {
	const retryAfter = Math.ceil((windowMs - (now - inWindow[0])) / 1000);
	res.set('Retry-After', String(retryAfter));
	return res.status(429).send({ msg: 'Too many requests', retryAfter });
      }
    }

    times.push(now);
    hits.set(key, times);
    next();
  };
}

module.exports = { rateLimit };
