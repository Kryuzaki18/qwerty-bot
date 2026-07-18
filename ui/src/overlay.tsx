import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { Point } from '../../src/shared/ipc';
import './overlay.css';

function Overlay(): React.JSX.Element {
  const [dots, setDots] = useState<Point[]>([]);

  useEffect(() => {
    const unsubscribe = window.overlay.onDotsUpdated(setDots);
    window.overlay.notifyReady();
    return unsubscribe;
  }, []);

  return (
    <>
      {dots.map((dot, index) => (
        <span
          key={`${dot.x}-${dot.y}-${index}`}
          className="overlay-dot"
          style={{ left: dot.x, top: dot.y }}
        >
          <span className="overlay-dot-index">{index + 1}</span>
        </span>
      ))}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('overlay-root') as HTMLElement).render(
  <React.StrictMode>
    <Overlay />
  </React.StrictMode>,
);
