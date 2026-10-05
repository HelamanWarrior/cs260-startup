import React, { useState } from 'react';

export function Home() {
  const [recording, setRecording] = useState(false);

  const toggleRecord = () => {
    setRecording(prev => !prev);
  };

  return (
    <>
    <header class="mx-auto max-w-3xl px-4 pt-8 text-center sm:px-6 sm:pt-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Liquid Notes</h1>
    </header>
    <main className="group/main mx-auto flex max-w-3xl flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-12">
      <p className="mt-4 text-lg leading-relaxed text-neutral-600">
	<em>Deepen your roots of knowledge</em>
      </p>

      <div className="mt-8 flex justify-center pb-12 pt-12 sm:pb-14 sm:pt-16">
      <button id="record-btn" type="button" aria-pressed={recording} onClick={toggleRecord}
	className="group relative flex size-44 -rotate-45 items-center justify-center
               rounded-[50%_0_50%_50%]
               bg-linear-to-br from-sky-400 to-blue-600
	       shadow-[0_0_48px_-4px] shadow-sky-500/50
               transition duration-300 hover:scale-105 active:scale-95
               focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
               aria-pressed:from-rose-400 aria-pressed:to-red-600 aria-pressed:shadow-red-500/50
               sm:size-56">
	<span className="absolute inset-0 hidden rounded-[50%_0_50%_50%] bg-red-400/50
	       group-aria-pressed:block group-aria-pressed:animate-ripple motion-reduce:animate-none"></span>

	<span className="relative flex rotate-45 flex-col items-center gap-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-9 sm:size-11" aria-hidden="true">
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"/>
            <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.08A7 7 0 0 0 19 11Z"/>
          </svg>
          <span id="record-label" className="text-sm font-semibold sm:text-base">
	    {recording ? 'Stop' : 'Record a Drop'}
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
	  <p className="m-auto">[Live transcription data goes here (websockets)]</p>
	</div>
      </section>
    </main>
    </>
  );
}
