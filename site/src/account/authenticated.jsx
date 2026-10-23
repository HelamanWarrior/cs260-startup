import { useState } from 'react';
import { ChangePassword } from './changePassword';

export function Authenticated({ userName, onLogout }) {
  const [changingPassword, setChangingPassword] = useState(false);
  const initial = userName?.trim()?.[0]?.toUpperCase() ?? '?';

  function logout() {
    localStorage.removeItem('userName');
    onLogout();
  }

  if (changingPassword) {
    return <ChangePassword onBack={() => setChangingPassword(false)} />;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
	className="flex size-20 items-center justify-center rounded-full bg-linear-to-br
		   from-sky-400 to-blue-600 text-3xl font-bold text-white
                   shadow-lg shadow-sky-500/30"
	aria-hidden="true"
      >
	{initial}
      </div>

      <div className="w-full min-w-0">
	<p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
	  Welcome back
	</p>
	<h2 className="mt-1 break-words text-xl font-semibold text-neutral-900 sm:text-2xl">
	  {userName}
	</h2>
      </div>

      <div className="flex w-full flex-col gap-3 border-t border-neutral-100 pt-6">
	<button
	  type="button"
          onClick={() => setChangingPassword(true)}
	  className="w-full rounded-full bg-white px-6 py-3 text-base font-semibold text-sky-700
                     ring-1 ring-sky-600/30 transition hover:bg-sky-50 active:scale-95
                     focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
	>
	  Change password
	</button>

	<button
	  type="button"
	  onClick={logout}
	  className="w-full rounded-full px-6 py-3 text-base font-medium text-neutral-500 transition
		     hover:bg-red-50 hover:text-red-600 active:scale-95
                     focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
	>
	  Log out
	</button>
      </div>
    </div>
  );
}
