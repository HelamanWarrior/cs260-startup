import React, { useState } from 'react';

import Typewriter from '../components/Typewriter';

export function Home() {
  const [recording, setRecording] = useState(false);

  const toggleRecord = () => {
    setRecording(prev => !prev);
  };

  return (
    <>
    <header className="mx-auto max-w-3xl px-4 pt-8 text-center sm:px-6 sm:pt-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Liquid Notes</h1>
    </header>
    <main className="group/main mx-auto flex max-w-3xl flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-12">
      <p className="mt-4 text-lg leading-relaxed text-neutral-600">
	<em>Deepen your roots of knowledge</em>
      </p>

      <div className="mt-8 flex justify-center pb-12 pt-12 sm:pb-14 sm:pt-16">
	<button
      	  id="record-btn"
      	  type="button"
      	  aria-pressed={recording}
      	  onClick={toggleRecord}
      	  className="group relative aspect-[100/130] w-40 transition duration-300
      	  	     hover:scale-105 active:scale-95 focus-visible:outline-none sm:w-52"
      	>
	  {/* pulsing ripple while recording */}
	  <svg
	    viewBox="0 0 100 130"
    	    className="absolute inset-0 hidden size-full overflow-visible
    	               group-aria-pressed:block group-aria-pressed:animate-ripple
    	               motion-reduce:animate-none"
    	    aria-hidden="true"
    	  >
	    <path
	      d="M50 4C58 24 92 52 92 82a42 42 0 0 1-84 0C8 52 42 24 50 4Z"
      	      className="fill-red-400/50"
      	    />
	  </svg>

	  {/* the drop */}
	  <svg
	    viewBox="0 0 100 130"
    	    className="absolute inset-0 size-full overflow-visible
    	               drop-shadow-[0_0_24px_rgba(14,165,233,0.5)]
    	               group-aria-pressed:drop-shadow-[0_0_24px_rgba(239,68,68,0.5)]"
    	    aria-hidden="true"
    	  >
	    <defs>
	      <linearGradient id="drop-idle" x1="0" y1="0" x2="1" y2="1">
      	        <stop offset="0" stopColor="#38bdf8" />
      	        <stop offset="1" stopColor="#2563eb" />
      	      </linearGradient>
      	      <linearGradient id="drop-rec" x1="0" y1="0" x2="1" y2="1">
      	        <stop offset="0" stopColor="#fb7185" />
      	        <stop offset="1" stopColor="#dc2626" />
      	      </linearGradient>
      	    </defs>

	  {/* idle colour */}
	  <path
      	    d="M50 4C58 24 92 52 92 82a42 42 0 0 1-84 0C8 52 42 24 50 4Z"
      	    fill="url(#drop-idle)"
      	  />
	  {/* recording colour fades in on top */}
	  <path
	    d="M50 4C58 24 92 52 92 82a42 42 0 0 1-84 0C8 52 42 24 50 4Z"
      	    fill="url(#drop-rec)"
      	    className="opacity-0 transition-opacity duration-300 group-aria-pressed:opacity-100"
      	  />
	  {/* focus ring that follows the drop shape */}
	  <path
	    d="M50 4C58 24 92 52 92 82a42 42 0 0 1-84 0C8 52 42 24 50 4Z"
      	    fill="none"
      	    strokeWidth="3"
      	    className="stroke-transparent group-focus-visible:stroke-sky-300"
      	  />
	</svg>

	{/* icon + label, sitting in the round belly of the drop */}
	<span className="relative flex h-full flex-col items-center justify-center gap-2 pt-10 text-white sm:pt-14">
	  <svg
	    xmlns="http://www.w3.org/2000/svg"
      	    viewBox="0 0 24 24"
      	    fill="currentColor"
      	    className="size-9 sm:size-11"
      	    aria-hidden="true"
      	  >
	    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
            <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.08A7 7 0 0 0 19 11Z" />
	  </svg>
	  <span id="record-label" className="text-sm font-semibold sm:text-base">
	    {recording ? "Stop" : "Record a Drop"}
	  </span>
	</span>
      </button>
    </div>

      <section className="w-full max-w-xl">
	<div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-neutral-500">
	  <span className="size-2 rounded-full bg-neutral-300
                   group-has-[[aria-pressed=true]]/main:animate-pulse
                   group-has-[[aria-pressed=true]]/main:bg-red-500"></span>
	  Live transcript
	</div>
	<div id="transcript" aria-live="polite"
	  className="flex max-h-72 min-h-40 overflow-y-auto rounded-2xl bg-white p-6 text-center
		 leading-relaxed text-neutral-700 shadow-sm ring-1 ring-black/5 sm:min-h-48 sm:p-8 sm:text-lg">
	  <p className="m-auto">{ recording && <Typewriter text="Testing, testing 1... 2... 3... Is this thing on? Oh, it looks like it is recording, it's writing what I'm saying..." speed={60} /> }</p>
	</div>
      </section>
    </main>
    </>
  );
}
