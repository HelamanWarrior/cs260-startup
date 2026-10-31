import { useEffect, useRef, useState } from 'react';
import { startTranscription } from './transcribe';

export function useTranscription() {
  const stopRef = useRef(null);
  const startingRef = useRef(false);
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState({ committed: '', tentative: '' });
  const [status, setStatus] = useState('');

  // If the component unmounts mid-recording, shut everything down
  useEffect(() => () => { stopRef.current?.(); }, []);

  async function toggleRecord() {
    if (stopRef.current) {
      await stopRef.current();
      return; // onClose resets the button when the server hangs up
    }
    if (startingRef.current) return; // ignore double-clicks during startup
    startingRef.current = true;

    setText({ committed: '', tentative: '' });
    setStatus('');
    try {
      stopRef.current = await startTranscription({
	onText: (committed, tentative) => setText({ committed, tentative }),
	onFinal: (finalText) => setText({ committed: finalText, tentative: '' }),
	onStatus: setStatus,
	onClose: () => {
	  stopRef.current = null;
	  setRecording(false);
	},
      });
      setRecording(true);
    } catch (err) {
      setStatus(err.message);
    } finally {
      startingRef.current = false;
    }
  }

  return {
    recording,
    committed: text.committed,
    tentative: text.tentative,
    status,
    toggleRecord,
  };
}
