export function NoteToast({ phase, onUndo, onRetry, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-20 flex justify-center px-4"
    >
      {phase !== 'idle' && (
	<div
	  className="toast toast-in pointer-events-auto relative flex items-center gap-3
		     overflow-hidden rounded-full bg-white py-2 pl-4 pr-4 text-sm
		     text-neutral-700 shadow-lg ring-1 ring-black/5"
	>
	  {phase === 'saving' && (
	    <>
	      <svg className="size-4 animate-spin text-sky-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
		<path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
	      </svg>
	      <span>Saving Note</span>
	    </>
	  )}
	  
	  {phase === 'saved' && (
	    <>
	      <svg className="size-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"
		   strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M5 12l5 5L20 7" />
	      </svg>
	      <span>Note saved</span>
	      <button
		type="button"
		onClick={onUndo}
		className="-mr-2 rounded-full px-3 py-1 font-semibold text-sky-600
			   hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-400"
	      >
		Undo
	      </button>
	      <span
		className="toast-bar absolute inset-x-0 bottom-0 h-0.5 bg-sky-500"
		onAnimationEnd={onDismiss}
	      />
	    </>
	  )}

	  {phase === 'error' && (
	    <>
	      <span className="text-red-600">Couldn't save note</span>
	      <button
		type="button"
		onClick={onRetry}
		className="-mr-1 rounded-full px-3 py-1 font-semibold text-sky-600 hover:bg-sky-50"
	      >
		Retry
	      </button>
	      <button
		type="button"
		onClick={onDismiss}
		className="-mr-2 rounded-full px-3 py-1 text-neutral-500 hover:bg-neutral-100"
	      >
		Dismiss
	      </button>
	    </>
	  )}
	</div>
      )}
    </div>
  );
}
