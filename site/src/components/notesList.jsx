import { useEffect, useState } from 'react';

export default function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const formatDate = (ms) =>
    new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/notes')
      .then((res) => {
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
      })
      .then((data) => {
	if (!cancelled) setNotes(data);
      })
      .catch((err) => {
	console.error(err);
	if (!cancelled) setError(true);
      })
      .finally(() => {
	if (!cancelled) setLoading(false);	
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-neutral-400">Loading…</p>;
  if (error) return <p className="text-red-600">Couldn't load your notes.</p>;
  if (notes.length === 0) {
    return <p className="text-neutral-400">No notes yet. Record a drop to make one.</p>;
  }

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
	    <article 
	      key={note.id}
	      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:p-6"
	    >
              <h3 className="font-semibold">A drop title</h3>
	      <time
		dateTime={new Date(note.createdAt).toISOString()}
		className="shrink-0 text-xs text-neutral-400"
	      >
		{formatDate(note.createdAt)}
	      </time>
              <ul className="mt-2 flex flex-wrap gap-2" aria-label="Tags">
                <li className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">example #1</li>
                <li className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">test</li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
		{note.text}
              </p>
            </article>
	  ))}
        </div>
      </details>
    </section>
  );
}
