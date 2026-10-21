import { useState, useEffect } from "react";

export default function Typewriter({ text = "", speed = 50, onDone, showCursor = true }) {
  const [count, setCount] = useState(0);

  // Restart whenever the text changes
  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (count >= text.length) {
      if (text.length > 0) onDone?.();
      return;
    }
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [count, text, speed]);

  return (
    <span>
      {text.slice(0, count)}
    </span>
  );
}
