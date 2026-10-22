import { useEffect, useState } from 'react';

import Typewriter from '../components/Typewriter';

const DROP_PATH = 'M50 4C58 24 92 52 92 82a42 42 0 0 1-84 0C8 52 42 24 50 4Z';

export function Home() {
  const [recording, setRecording] = useState(false);

  const toggleRecord = () => setRecording((prev) => !prev);

  // This screen is designed to fit in one viewport. Lock page-level scrolling
  // so anything the surrounding layout adds (spacers, padding) can't create a scrollbar.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
    };
  }, []);

  return (
    <main
      className="group/main mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-y-auto overscroll-contain px-4
                 pt-[max(2rem,env(safe-area-inset-top))] sm:px-6 sm:pt-14"
    >
      <header className="shrink-0 pb-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Liquid Notes</h1>
        <p className="mt-2 text-base italic text-neutral-600 sm:text-xl">
          Deepen your roots of knowledge
        </p>
      </header>

      {/* transcript: fixed, compact height. It scrolls instead of growing. */}
      <section aria-labelledby="transcript-label" className="mt-8 shrink-0">
        <div
          id="transcript-label"
          className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-neutral-500"
        >
          <span
            className="size-2 rounded-full bg-neutral-300
                       group-has-[[aria-pressed=true]]/main:animate-pulse
                       group-has-[[aria-pressed=true]]/main:bg-red-500"
          ></span>
          Live transcript
        </div>

        <div
          id="transcript"
          aria-live="polite"
          className="h-28 overflow-y-auto rounded-2xl bg-white p-4 text-left leading-relaxed
                     text-neutral-700 shadow-sm ring-1 ring-black/5
                     sm:h-36 sm:p-6 sm:text-lg"
        >
          {recording ? (
            <p>
              <Typewriter
                text="Testing, testing 1... 2... 3... Is this thing on? Oh, it looks like it is recording, it's writing what I'm saying..."
                speed={60}
              />
            </p>
          ) : (
            <p className="text-neutral-400">
              Tap the drop and start talking. Your words will appear here.
            </p>
          )}
        </div>
      </section>

      {/* the drop takes all the remaining space and is centered in it */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center pb-28 pt-6">
        <button
          id="record-btn"
          type="button"
          aria-pressed={recording}
          onClick={toggleRecord}
          className="group @container relative aspect-[100/130] w-[clamp(9rem,min(56vw,28dvh),20rem)]
                     transition duration-300 hover:scale-105 active:scale-95
                     focus-visible:outline-none"
        >
          {/* pulsing ripple while recording */}
          <svg
            viewBox="0 0 100 130"
            className="pointer-events-none absolute inset-0 hidden size-full overflow-visible
                       group-aria-pressed:block group-aria-pressed:animate-ripple
                       motion-reduce:animate-none"
            aria-hidden="true"
          >
            <path d={DROP_PATH} className="fill-red-400/50" />
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

            <path d={DROP_PATH} fill="url(#drop-idle)" />
            <path
              d={DROP_PATH}
              fill="url(#drop-rec)"
              className="opacity-0 transition-opacity duration-300 group-aria-pressed:opacity-100"
            />
            {/* focus ring that follows the drop shape */}
            <path
              d={DROP_PATH}
              fill="none"
              strokeWidth="3"
              className="stroke-transparent group-focus-visible:stroke-sky-300"
            />
          </svg>

          {/* icon + label scale with the drop (cqw = % of the button's width) */}
          <span className="relative flex h-full flex-col items-center justify-center gap-[3cqw] pt-[28cqw] text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="aspect-square w-[20cqw]"
              aria-hidden="true"
            >
              <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
              <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.08A7 7 0 0 0 19 11Z" />
            </svg>
            <span id="record-label" className="text-[length:6cqw] font-semibold">
              {recording ? 'Stop' : 'Record a Drop'}
            </span>
          </span>
        </button>
      </div>
    </main>
  );
}
