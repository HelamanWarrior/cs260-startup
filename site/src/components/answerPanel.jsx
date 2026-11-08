import { useEffect, useState } from 'react';
import { fetchAnswer } from './answerApi';

// Only ask the AI for question-like searches
export function shouldAsk(query) {
  const q = query.trim();
  return q.endsWith('?') || q.split(/\s+/).filter(Boolean).length >= 4;
}

export default function AnswerPanel({ query }) {
  const [state, setState] = useState({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!query || !shouldAsk(query)) {
      setState({ status: 'idle' });
      return;
    }
    
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetchAnswer(query, controller.signal)
      .then((data) => {
	setState(data.found ? { status: 'ready', ...data } : { status: 'none' });
      })
      .catch((err) => {
	if (err.name === 'AbortError') return; // a newer search replaced this one
	console.error(err);
	setState({ status: 'error' });
      });

    return () => controller.abort();
  }, [query, attempt]);

  const { status } = state;

  return (
    <div aria-live="polite" aria-busy={status === 'loading'}>
      {status !== 'idle' && (
	<section className="rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-100 sm:p-6">
	  <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-700">Answer</h2>
	  {status === 'loading' && (
	    <div className="mt-3 space-y-2" aria-label="Writing an answer">
	      <div className="h-3 w-11/12 animate-pulse rounded bg-sky-100" />
	      <div className="h-3 w-4/5 animate-pulse rounded bg-sky-100" />
	      <div className="h-3 w-2/3 animate-pulse rounded bg-sky-100" />
	    </div>
	  )}

	  {status === 'ready' && (
	    <>
	      <p className="mt-2 whitespace-pre-line leading-relaxed text-neutral-800">
		{state.answer}
	      </p>
	      <p className="mt-3 text-xs text-neutral-500">
		Written by AI from your notes. Check the notes below.
	      </p>
	    </>
	  )}
	  
	  {status === 'none' && (
	    <p className="mt-2 text-neutral-600">
	      I couldn&apos;t find anything about that in your notes.
	    </p>
	  )}

	  {status === 'error' && (
	    <div className="mt-2 flex flex-wrap items-center gap-3">
	      <p className="text-neutral-600">
		Couldn&apos;t write an answer right now. Your search results are below.
	      </p>
	      <button
		type="button"
		onClick={() => setAttempt((a) => a + 1)}
		className="rounded-full px-3 py-1 text-sm font-semibold text-sky-700 hover:bg-sky-100"
	      >
		Try again
	      </button>
	    </div>
	  )}
	</section>
      )}
    </div>
  );
}
