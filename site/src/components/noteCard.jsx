import { useId, useState } from 'react';

const formatDate = (ms) =>
  new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const truncate = (s, n) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

export default function NoteCard({ note }) {
  const [open, setOpen] = useState(false);
  const transcriptId = useId();

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
	<h3 className="font-semibold">
	  {note.title ?? (note.status === 'pending' ? 'Naming this drop…' : 'Untitled drop')}
	</h3>
	<time
	  dateTime={new Date(note.createdAt).toISOString()}
	  className="shrink-0 text-xs text-neutral-400"
	>
	  {formatDate(note.createdAt)}
	</time>
      </div>

      {note.tags?.length > 0 && (
	<ul className="mt-2 flex flex-wrap gap-2" aria-label="Tags">
	  {note.tags.map((tag) => (
	    <li
	      key={tag}
	      className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
	    >
	      {tag}
	    </li>
	  ))}
	</ul>
      )}

      <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
	{note.summary || truncate(note.text, 200)}
      </p>

      <button
	type="button"
	onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={transcriptId}
        className="mt-3 inline-flex items-center gap-1 rounded-full text-sm font-medium
                   text-sky-700 hover:text-sky-900 focus-visible:outline-2 focus-visible:outline-sky-400"
      >
	{open ? 'Hide transcript' : 'Show transcript'}
	<svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      
      <p
        id={transcriptId}
        hidden={!open}
        className="mt-3 whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700"
      >
        {note.text}
      </p>
    </article>
  );
}
