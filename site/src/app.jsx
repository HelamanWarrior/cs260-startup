import React from 'react';
import './style.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Home } from './home/home';
import { Search } from './search/search';
import { About } from './about/about';
import { Account } from './account/account';

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-neutral-50 pb-24 text-neutral-900 antialiased">
	<Routes>
	  <Route path='/' element={<Account />} />
	  <Route path='/home' element={<Home />} />
	  <Route path='/search' element={<Search />} />
	  <Route path='/about' element={<About />} />
	  <Route path='/account' element={<Account />} />
	  <Route path='*' element={<NotFound />} />
	</Routes>

        <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
          <ul className="flex items-center gap-1 rounded-full bg-white/70 p-1.5 shadow-lg ring-1 ring-black/10 backdrop-blur-md">
            <li>
              <NavLink to="/home"
                className="block rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/search"
                 className="block rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white">
                Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/about"
                 className="block rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white">
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/account"
                 className="block rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white">
                Account
              </NavLink>
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
    </BrowserRouter>
  )
}

function NotFound() {
  return <main className="w-full bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}
