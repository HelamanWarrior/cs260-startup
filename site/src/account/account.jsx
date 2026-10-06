import React from 'react';

export function Account() {
  return (
    <>
    <header className="mx-auto max-w-3xl px-4 pt-8 text-center sm:px-6 sm:pt-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Account</h1>
    </header>
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <form action="#" method="POST"
	    className="mx-auto w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
	<div>
	  <label for="username" className="block text-sm font-medium text-neutral-700">Username</label>
	  <input type="text" id="username" name="username" required autocomplete="username"
		 className="mt-1.5 block w-full rounded-xl bg-neutral-50 px-4 py-3 text-base ring-1 ring-black/10
			placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
	</div>

	<div>
	  <label for="password" className="block text-sm font-medium text-neutral-700">Password</label>
	  <input type="password" id="password" name="password" required autocomplete="current-password"
		 className="mt-1.5 block w-full rounded-xl bg-neutral-50 px-4 py-3 text-base ring-1 ring-black/10
			placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
	</div>

	<button type="submit"
		className="w-full rounded-full bg-sky-600 px-6 py-3.5 text-lg font-semibold text-white
		       shadow-md shadow-sky-600/30 transition hover:bg-sky-700 active:scale-95
		       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
	  Log In
	</button>
      </form>

      <section className="flex justify-center gap-6 text-sm font-medium">
	<a href="#" className="text-sky-600 underline-offset-2 hover:underline">Change password</a>
	<a href="#" className="text-neutral-500 underline-offset-2 hover:text-red-600 hover:underline">Log out</a>
      </section>
    </main>
    </>
  );
}
