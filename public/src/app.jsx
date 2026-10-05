import React from 'react';
import './style.css';

export default function App() {
  return (
    <div className="bg-neutral-50 pb-24 text-neutral-900 antialiased">
      <main>
	App components go here
      </main>
      <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <ul className="flex items-center gap-1 rounded-full bg-white/70 p-1.5 shadow-lg ring-1 ring-black/10 backdrop-blur-md">
          <li>
            <a href="/" aria-current="page"
              className="block rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white">
              Home
            </a>
          </li>
          <li>
            <a href="/search/"
               className="block rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white">
              Search
            </a>
          </li>
          <li>
            <a href="/about/"
               className="block rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white">
              About
            </a>
          </li>
          <li>
            <a href="/account/"
               className="block rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white">
              Account
            </a>
          </li>
        </ul>
      </nav>
      <footer className="fixed bottom-4 right-4 z-40 hidden md:block">
        <a href="https://github.com/HelamanWarrior/cs260-startup"
          target="_blank" rel="noopener noreferrer"
          className="block rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-neutral-700 shadow-lg ring-1 ring-black/10 backdrop-blur-md transition hover:bg-white hover:text-neutral-900">
          Source code
        </a>
      </footer>
    </div>
  )
}
