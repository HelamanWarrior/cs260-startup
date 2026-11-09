import { useCallback, useEffect, useState, useRef } from "react";

import NotesList from '../components/notesList';
import AnswerPanel from '../components/answerPanel';
import { useTranscription } from '../components/useTranscription';
import { MessageDialog } from '../components/messageDialog';

const STATUS_MESSAGES = {
  busy: 'Server busy. Try again in a moment.',
  timeout: "You've reached the 30-minute recording limit.",
  error: "Couldn't connect. Make sure you're logged in and try again.",
  'mic-denied': 'Microphone access was blocked. Allow it in your browser and try again.',
};

export function Search() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [displayError, setDisplayError] = useState(null);
  const inputRef = useRef(null);

  const [cited, setCited] = useState({ query: '', ids: [] });
  const handleSources = useCallback((q, ids) => setCited({ query: q, ids }), []);
  const citedIds = cited.query === submitted ? cited.ids : [];
  
  const { recording, committed, tentative, toggleRecord } = useTranscription({
    onError: (code) => setDisplayError(STATUS_MESSAGES[code] ?? code),
  });

  // Show live recording transcript in search box
  useEffect(() => {
    const text = `${committed}${tentative}`.trim();
    if (text) setQuery(text);
  }, [committed, tentative]);

  // Keep the newest words in view as the text outgrows the box
  useEffect(() => {
    const el = inputRef.current;
    if (recording && el) el.scrollLeft = el.scrollWidth;
  }, [query, recording]);

  // Reset query when the box is emptied
  useEffect(() => {
    if (!query) setSubmitted('');
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault(); // stop the page reload
    setSubmitted(query.trim());
  };

  return (
    <>
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 pb-44">
      {submitted && (
	<p className="text-sm text-neutral-500">Results for “{submitted}”</p>
      )}
      <AnswerPanel query={submitted} onSources={handleSources} />
      <NotesList query={submitted} citedIds={citedIds} />
    </main>

    <form onSubmit={handleSubmit} role="search" className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-2xl items-center gap-2 rounded-full bg-white/80 p-2 shadow-lg ring-1 ring-black/10 backdrop-blur-md focus-within:ring-2 focus-within:ring-sky-500">
      <label htmlFor="search" className="sr-only">Search the forest of knowledge</label>

      <input 
	ref={inputRef}
	type="text"
	value={query}
	readOnly={recording}
        onChange={(e) => setQuery(e.target.value)}
	placeholder="Search the forest of knowledge..."
	id="search"
	name="search"
	maxLength={1000}
	className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-neutral-400"
      />

      <button
	id="mic-btn"
	type="button"
	aria-pressed={recording}
	aria-label="Voice search"
	onClick={toggleRecord}
	className="group relative flex size-11 shrink-0 items-center justify-center rounded-full text-neutral-600 transition hover:bg-black/5 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 aria-pressed:bg-red-500 aria-pressed:text-white sm:size-12"
      >

	{/* pulsing ripple while listening */}
      	<span className="absolute inset-0 hidden rounded-full bg-red-400 group-aria-pressed:block group-aria-pressed:animate-ripple motion-reduce:animate-none"></span>

      	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative size-6" aria-hidden="true">
      	  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"/>
      	  <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.08A7 7 0 0 0 19 11Z"/>
      	</svg>
      </button>

      <button
	type="submit"
	className="flex h-14 w-16 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-600/30 transition hover:bg-sky-700 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:w-20"
      >
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="size-6" aria-hidden="true">
	  <circle cx="11" cy="11" r="7" />
  	  <path d="m20 20-3.5-3.5" />
  	</svg>
      </button>
    </form>
    <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
    </>
  );
}
