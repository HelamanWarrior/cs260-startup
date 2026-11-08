let ai;
async function getClient() {
  if (!ai) {
    const { GoogleGenAI } = await import('@google/genai');
    ai = new GoogleGenAI({});
  }
  return ai;
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Calls Gemini in JSON mode and returns the raw text.
// Retries on overload, rate limits, and timeouts; anything else fails immediately.
async function generateJsonText({ instructions, contents, timeoutMs = 30_000, tries = 3 }) {
  const model = process.env.GEMINI_MODEL;
  if (!model) throw new Error('GEMINI_MODEL is not set. Add it to .env');
  const client = await getClient();

  for (let attempt = 1; ; attempt++) {
    try {
      const response = await withTimeout(
	client.models.generateContent({
	  model,
	  contents,
	  config: { systemInstruction: instructions, responseMimeType: 'application/json' },
	}),
	timeoutMs
      );
      return response.text;
    } catch (err) {
      const retryable =
	err.status === 429 || err.status === 503 || err.message === 'Gemini timed out';
      if (!retryable || attempt >= tries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
  }
}

module.exports = { generateJsonText };
