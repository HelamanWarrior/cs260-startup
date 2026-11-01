import { useRef, useState } from 'react';

export function useNoteSaver({ onError } = {}) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const noteId = useRef(null);
  const lastText = useRef('');
  const run = useRef(0); // bumps on each new action so stale responses can be ignored

  async function save(text) {
    const trimmed = text.trim();
    if (!trimmed) return; // don't save empty transcript

    const mine = ++run.current;
    lastText.current = trimmed;
    setPhase('saving');

    try {
      const res = await fetch('/api/notes', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { id } = await res.json();

      if (mine !== run.current) return; // user moved on while we were saving
      noteId.current = id;
      setPhase('saved');
    } catch (err) {
      if (mine !== run.current) return;
      console.error(err);
      setPhase('error');
    }
  }

  const retry = () => save(lastText.current);

  async function undo() {
    const id = noteId.current;
    if (!id) return;

    noteId.current = null;
    setPhase('idle'); // hide the bubble right away

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error(err);
      onError?.('undo-failed');
    }
  }

  function dismiss() {
    run.current++;
    setPhase('idle');
  }

  return { phase, save, retry, undo, dismiss };
}
