import { useEffect, useRef, useState } from 'react';
import { startTranscription } from './transcribe';

export function useTranscription({ onError } = {}) {
  const stopRef = useRef(null);
  const startingRef = useRef(false);
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState({ committed: '', tentative: '' });

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
    try {
      stopRef.current = await startTranscription({
	onText: (committed, tentative) => setText({ committed, tentative }),
	onFinal: (finalText) => setText({ committed: finalText, tentative: '' }),
	onStatus: (code) => onError?.(code),
	onClose: () => {
	  stopRef.current = null;
	  setRecording(false);
	},
      });
      setRecording(true);
    } catch (err) {
      onError?.(err.name === 'NotAllowedError' ? 'mic-denied' : err.message);
    } finally {
      startingRef.current = false;
    }
  }

  return {
    recording,
    committed: text.committed,
    tentative: text.tentative,
    toggleRecord,
  };
}
