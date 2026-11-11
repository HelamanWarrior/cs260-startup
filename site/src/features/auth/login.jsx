import React from 'react';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from './authState';

export function Login({ userName, authState, onAuthChange }) {
  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pb-28
		 pt-[max(2rem,env(safe-area-inset-top))] text-center sm:px-6 sm:pt-14"
    >
      {authState !== AuthState.Unknown && ( 
        <header className="pb-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Liquid Notes</h1>
          <p className="mt-2 text-base italic text-neutral-600 sm:text-xl">
            Deepen your roots of knowledge
          </p>
        </header>
      )}
      
      {authState !== AuthState.Unknown && (
        <section
          className="mt-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8"
        >
	  {authState === AuthState.Authenticated && (
            <Authenticated
              userName={userName}
              onLogout={() => onAuthChange(userName, AuthState.Unauthenticated)}
            />
          )}
          {authState === AuthState.Unauthenticated && (
            <Unauthenticated
              userName={userName}
              onLogin={(loginUserName) => {
                onAuthChange(loginUserName, AuthState.Authenticated);
              }}
            />
          )}
	</section>
      )}
    </main>
  );
}
