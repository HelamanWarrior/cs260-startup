import React from 'react';
import './style.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './account/login';
import { Home } from './home/home';
import { Search } from './search/search';
import { About } from './about/about';
import { Account } from './account/account';
import { AuthState } from './account/authState';

function Icon({ children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
    	viewBox="0 0 24 24"
    	fill="none"
    	stroke="currentColor"
    	strokeWidth="1.8"
    	strokeLinecap="round"
    	strokeLinejoin="round"
    	className="size-6"
    	aria-hidden="true"
    >
    {children}
    </svg>
  );
}

const links = [
  {
    to: '/home',
    label: 'Home',
    authOnly: true,
    icon: (
      <Icon>
	<path d="M3 10.5 12 3l9 7.5" />
	<path d="M5 9.5V20h5v-6h4v6h5V9.5" />
      </Icon>
    ),
  },
  {
    to: '/search',
    label: 'Search',
    authOnly: true,
    icon: (
      <Icon>
        <circle cx="11" cy="11" r="7" />
	<path d="m20 20-3.5-3.5" />
      </Icon>
    ),
  },
  {
    to: '/about',
    label: 'About',
    authOnly: true,
    icon: (
      <Icon>
	<circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
	<path d="M12 8h.01" />
      </Icon>
    ),
  },
  {
    to: '/account',
    label: 'Account',
    authOnly: false,
    icon: (
      <Icon>
	<circle cx="12" cy="8" r="4" />
	<path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
      </Icon>
    ),
  },
];

export default function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);

  const visibleLinks = links.filter((link) => !link.authOnly || authState === AuthState.Authenticated);

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

        <nav
	  aria-label="Main"
	  className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2"
	>
          <ul className="flex items-center gap-1.5 rounded-full bg-white/70 p-2 shadow-lg ring-1 ring-black/10 backdrop-blur-md">
	    {visibleLinks.map(({ to, label, icon }) => (
	      <li key={to}>
		<NavLink
		  to={to}
		  title={label}
		  className="flex h-12 w-16 items-center justify-center rounded-full text-neutral-700 transition
			     hover:bg-black/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
			     aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white"
		>
		  {icon}
		  <span className="sr-only">{label}</span>
		</NavLink>
	      </li>
	    ))}
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
