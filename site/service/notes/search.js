const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'about',
  'what', 'was', 'is', 'are', 'i', 'my', 'me', 'that', 'this', 'it', 'how', 'did',
  'do', 'can', 'you', 'when', 'where', 'which', 'who',
]);

// How much a match in each field is worth
const WEIGHTS = { title: 5, tags: 4, keywords: 4, summary: 2, text: 1 };

const tokenize = (s) => 
  String(s ?? '')
    .toLowerCase()
    .replace(/['’']/g, '') // I'm -> im, don't -> dont: contractions stay one word
    .match(/[\p{L}\p{N}]+/gu) ?? [];

// Score one term against one field's tokens.
function termScore(tokens, term) {
  let exact = 0;
  let prefix = 0;
  let contained = 0;
  let infix = 0;

  for (const tok of tokens) {
    if (tok === term) exact++;
    else if (term.length >= 3 && tok.startsWith(term)) prefix++;
    else if (tok.length >= 4 && !STOPWORDS.has(tok) && term.startsWith(tok)) contained++;
    else if (term.length >= 3 && tok.includes(term)) infix++;
  }

  const hits = exact + prefix + contained + infix;
  if (!hits) return 0;

  const quality = exact ? 1 : prefix ? 0.6 : contained ? 0.4 : 0.3; // exact words beat prefix matches
  return quality * (1 + Math.log(hits)); // repeats help, with diminishing returns
}

function searchNotes(notes, query, limit = 10) {
  const terms = [...new Set(tokenize(query))]
    .filter((t) => !STOPWORDS.has(t))
    .slice(0, 10);
  if (!terms.length) return [];

  const results = [];
  for (const note of notes) {
    const fields = {
      title: tokenize(note.title),
      tags: tokenize((note.tags ?? []).join(' ')),
      keywords: tokenize((note.keywords ?? []).join(' ')),
      summary: tokenize(note.summary),
      text: tokenize(note.text),
    };

    let score = 0;
    const matched = [];
    for (const term of terms) {
      let termTotal = 0;
      for (const [field, weight] of Object.entries(WEIGHTS)) {
	termTotal += weight * termScore(fields[field], term);
      }
      if (termTotal > 0) matched.push(term);
      score += termTotal;
    }
    if (!matched.length) continue;

    score *= (matched.length / terms.length) ** 2; // reward notes that cover more of the query
    
    const { owner, ...rest } = note; // never send the owner to the client
    results.push({ ...rest, score: Math.round(score * 100) / 100, matched });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

module.exports = { searchNotes };
