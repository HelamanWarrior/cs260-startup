import { useLayoutEffect, useRef, useState } from 'react';

// Returns only the newest "page" of text. When the text overflows the box,
// the page clears and restarts at the words that just arrived.
export function useCaptionWindow(text, boxRef) {
  const [start, setStart] = useState(0);
  const prevLen = useRef(0);

  useLayoutEffect(() => {
    const el = boxRef.current;
    const prev = prevLen.current; // capture now, the ref changes below

    if (text.length < prev) {
      setStart(0); // text was cleared: a new recording began
    } else if (el && el.scrollHeight > el.clientHeight + 1) {
      setStart((s) => Math.max(s, prev)); // overflowed: new page begins at the new words
    }

    prevLen.current = text.length;
  }, [text, boxRef]);

  return { text: text.slice(start).trimStart(), page: start };
}
