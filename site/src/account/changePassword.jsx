import { useState } from 'react';

const inputClass = 
  'mt-1.5 block w-full rounded-xl bg-neutral-50 px-4 py-3 text-base ring-1 ring-black/10 ' +
  'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500';

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 flex items-center gap-1 self-start rounded-full px-2 py-1 text-sm font-medium
		 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-800
		 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
	<path d="m15 18-6-6 6-6" />
      </svg>
      Back
    </button>
  );
}

export function ChangePassword({ onBack }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const ready = current && next.length >= 8 && confirm;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (next !== confirm) {
      setError('The new passwords don’t match.');
      return;
    }
    if (next === current) {
      setError('Choose a password that’s different from your current one.');
      return;
    }

    setSaving(true);
    try {
      // TODO: point this at your real endpoint.
      const res = await fetch('/api/auth/password', {
	method: 'PUT',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });

      if (res.ok) {
	const body = await res.json().catch(() => ({}));
	throw new Error(body.msg || 'Couldn’t change your password. Please try again.');
      }
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6">
	<div
	  className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
	  aria-hidden="true"
	>
	  <svg
	    xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-10"
	  >
	    <path d="m5 12.5 4.5 4.5L19 7.5" />
	  </svg>
	</div>

      	<div>
      	  <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl">Password updated</h2>
      	  <p className="mt-1 text-neutral-500">Use your new password next time you log in.</p>
      	</div>

      	<button
      	  type="button"
      	  onClick={onBack}
      	  className="w-full rounded-full bg-sky-600 px-6 py-3 text-base font-semibold text-white
      	  	   shadow-md shadow-sky-600/30 transition hover:bg-sky-700 active:scale-95
      	  	   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
      	>
      	  Done
      	</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackButton onClick={onBack} />
      
      <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl">Change password</h2>

      <form onSubmit={handleSubmit} className="space-y-5 text-left">
	<div>
	  <label htmlFor="current-password" className="block text-sm font-medium text-neutral-700">
	    Current password
	  </label>
	  <input
            type="password"
            id="current-password"
            name="current-password"
            required
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
	  />
	</div>
	
	<div>
	  <label htmlFor="new-password" className="block text-sm font-medium text-neutral-700">
	    New password
	  </label>
	  <input
	    type="password"
	    id="new-password"
	    name="new-password"
	    required
	    minLength={8}
	    autoComplete="new-password"
	    value={next}
	    onChange={(e) => setNext(e.target.value)}
	    placeholder="At least 8 characters"
	    className={inputClass}
	  />
	</div>
	
	<div>
	  <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700">
	    Confirm new password
	  </label>
	  <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
	  />
	</div>

	{error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
	
	<button
          type="submit"
          disabled={!ready || saving}
          className="w-full rounded-full bg-sky-600 px-6 py-3.5 text-lg font-semibold text-white
                     shadow-md shadow-sky-600/30 transition hover:bg-sky-700 active:scale-95
                     focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

