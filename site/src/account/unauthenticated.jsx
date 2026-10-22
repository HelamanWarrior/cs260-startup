import React from 'react';

import { MessageDialog } from './messageDialog';

export function Unauthenticated(props) {
  const [userName, setUserName] = React.useState(props.userName);
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);

  async function loginUser() {
    localStorage.setItem('userName', userName);
    props.onLogin(userName);
  }

  async function createUser() {
    localStorage.setItem('userName', userName);
    props.onLogin(userName);
  }

  return (
    <>
      <form action="#" method="POST"
            className="mx-auto w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-neutral-700">Username</label>
          <input type="text" id="username" name="username" required autocomplete="username"
		 value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="your@email.com"
        	 className="mt-1.5 block w-full rounded-xl bg-neutral-50 px-4 py-3 text-base ring-1 ring-black/10
        		placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
      
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Password</label>
          <input type="password" id="password" name="password" required autocomplete="current-password"
		 onChange={(e) => setPassword(e.target.value)} placeholder="password"
        	 className="mt-1.5 block w-full rounded-xl bg-neutral-50 px-4 py-3 text-base ring-1 ring-black/10
        		placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
      
        <button type="submit"
		onclick={() => loginUser()} disabled={!userName || !password }
        	className="w-full rounded-full bg-sky-600 px-6 py-3.5 text-lg font-semibold text-white
        	       shadow-md shadow-sky-600/30 transition hover:bg-sky-700 active:scale-95
        	       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
          Log In
        </button>
      </form>

      <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
    </>
  );
}
