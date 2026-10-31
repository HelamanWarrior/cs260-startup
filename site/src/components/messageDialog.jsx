import { useEffect, useId, useRef } from 'react';

export function MessageDialog({ message, onHide }) {
  const dialogRef = useRef(null);
  const messageId = useId();

  // Open or close the native dialog whenever `message` changes.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (message && !dialog.open) dialog.showModal();
    if (!message && dialog.open) dialog.close();
  }, [message]);

  return (
    <dialog
      ref={dialogRef}
      aria-describedby={messageId}
      // Fires on Escape and on dialog.close(). Only report it if a message was showing.
      onClose={() => message && onHide?.()}
      // A click on the dimmed backdrop targets the <dialog> itself.
      onClick={(e) => {
	if (e.target === e.currentTarget) onHide?.();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-0 text-neutral-700
		 shadow-xl ring-1 ring-black/5
		 backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 text-center sm:p-8">
	<p id={messageId} className="text-base leading-relaxed sm:text-lg">
	  {message}
	</p>

	<button
	  type="button"
	  onClick={onHide}
	  className="mt-6 h-12 w-full rounded-full bg-sky-600 font-semibold text-white
		     shadow-md shadow-sky-600/30 transition hover:bg-sky-700 active:scale-95
		     focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
	>
	  Close
	</button>
      </div>
    </dialog>
  );
}
