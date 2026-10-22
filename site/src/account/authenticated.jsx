import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Authenticated(props) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('userName');
    props.onLogout();
  }

  return (
    <section className="flex justify-center gap-6 text-sm font-medium">
      <button className="text-sky-600 underline-offset-2 hover:underline">
	Change password
      </button>
      <button className="text-neutral-500 underline-offset-2 hover:text-red-600 hover:underline">
	Log out
      </button>
    </section>     
  );
}
