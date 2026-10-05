import React from 'react';

export function Search() {
  return (
    <>
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
      <section aria-live="polite">
	<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
	  <p className="leading-relaxed text-neutral-600">
	    [Relevant response from{' '}
            <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer"
             className="text-sky-600 underline underline-offset-2 hover:text-sky-800">LLM API</a>
	     {' '}based on search query will appear here.]
	  </p>
	</div>
      </section>

      <section>
	<details className="group">
	  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 [&::-webkit-details-marker]:hidden">
	    <h2 className="text-xl font-semibold sm:text-2xl">
	      View previous drops <span className="text-neutral-400">[database placeholder]</span>
	    </h2>
	    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
		 strokeLinecap="round" strokeLinejoin="round"
		 className="size-5 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180"
		 aria-hidden="true">
	      <path d="m6 9 6 6 6-6" />
	    </svg>
	  </summary>

	  <div className="mt-4 space-y-4">
	    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:p-6">
	      <h3 className="font-semibold">A drop title</h3>
	      <ul className="mt-2 flex flex-wrap gap-2" aria-label="Tags">
	        <li className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">example #1</li>
	        <li className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">test</li>
	      </ul>
	      <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
	        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
	      </p>
	    </article>
	    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:p-6">
	      <h3 className="font-semibold">Another drop title</h3>
	      <ul className="mt-2 flex flex-wrap gap-2" aria-label="Tags">
	        <li className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">example #2</li>
	        <li className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">test</li>
	      </ul>
	      <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
	        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
	      </p>
	    </article>
	  </div>
	</details>
      </section>
    </main>

    <form className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-2xl items-center gap-2 rounded-full bg-white/80 p-2 shadow-lg ring-1 ring-black/10 backdrop-blur-md focus-within:ring-2 focus-within:ring-sky-500">
      <label htmlFor="search" className="sr-only">Search the forest of knowledge</label>

      <input 
	type="text"
	id="search"
	name="search"
	required minLength="4"
	maxLength="1000"
	placeholder="Search the forest of knowledge..."
	className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-neutral-400"
      />

      <button
	id="mic-btn"
	type="button"
	aria-pressed="false"
	aria-label="Voice search"
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
	className="flex h-14 shrink-0 items-center gap-2 rounded-full bg-sky-600 px-5 text-lg font-semibold text-white shadow-md shadow-sky-600/30 transition hover:bg-sky-700 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:px-8"
      >
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="hidden size-5 sm:block" aria-hidden="true">
	  <circle cx="11" cy="11" r="7" />
	  <path d="m20 20-3.5-3.5" />
	</svg>
	Search
      </button>
    </form>
    </>
  );
}
