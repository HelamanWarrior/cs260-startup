const USE_MOCK = true;

export async function fetchAnswer(query, signal) {
  if (USE_MOCK) return mockAnswer(query, signal);

  const res = await fetch('/api/notes/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// A fake server: waits a moment, then answers. Typing "zzz" or "boom" in the query
// triggers the empty and error states, so you can test them on demand.
function mockAnswer(query, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (/boom/i.test(query)) return reject(new Error('mock failure'));
      if (/zzz/i.test(query)) return resolve({ found: false, answer: '', sources: [] });
      resolve({
	found: true,
	answer:
	  'You installed a fuzzy-finding plugin for NeoVim that lets you find and open files quickly. (Placeholder answer.)',
	sources: ['mock-1'],
      }, 1200);

      signal?.addEventListener('abort', () => {
	clearTimeout(timer);
	reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  });
}
