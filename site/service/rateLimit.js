// Per-user limits, kept in memory. Each rule is { windowsMs, max }.
function rateLimit(rules) {
  const longest = Math.max(...rules.map((r) => r.windowMs));
  const hits = new Map(); // user -> timestamps of their recent allowed requests

  // Occasionally drop users who have been quiet, so the map can't grow forever
  setInterval(() => {
    const now = Date.now();
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < longest)) hits.delete(key);
    }
  }, 10 * 60_000).unref();

  return (req, res, next) => {
    const key = req.user.email;
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
