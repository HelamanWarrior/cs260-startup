import { useEffect, useState } from 'react';
import NoteCard from './noteCard';

export default function NotesList({ query = '', citedIds = [] }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const formatDate = (ms) =>
    new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  useEffect(() => {
    let cancelled = false;
    let timer;
    const url = query
      ? `/api/notes/search?q=${encodeURIComponent(query)}`
      : '/api/notes';

    async function load() {
      try {
	const res = await fetch(url);
    	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const data = await res.json();
	if (cancelled) return;

	const list = Array.isArray(data) ? data : [];
	setNotes(list);
	setError(false);

	// Keep checking while any note is still waiting for its labels
	if (list.some((n) => n.status === 'pending')) {
	  timer = setTimeout(load, 3000);
	}
      } catch (err) {
	console.error(err);
	if (!cancelled) setError(true);
      } finally {
	if (!cancelled) setLoading(false);
      }
    }

    load();
    
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (loading) return <p className="text-neutral-400">Loading…</p>;
  if (error) return <p className="text-red-600">Couldn't load your notes.</p>;
  {!loading && !error && notes.length === 0 && (
    <p className="text-neutral-400">
      {query ? `No notes match “${query}”.` : 'No notes yet. Record a drop to make one.'}
    </p>
  )}

  return (
    <section>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 [&::-webkit-details-marker]:hidden">
          <h2 className="text-xl font-semibold sm:text-2xl">
            View previous drops
          </h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      	 strokeLinecap="round" strokeLinejoin="round"
      	 className="size-5 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180"
      	 aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
    
        <div className="mt-4 space-y-4">
	  {notes.map((note) => (
	    <NoteCard key={note.id} note={note} cited={citedIds.includes(note.id)} />
	  ))}
        </div>
      </details>
    </section>
  );
}
