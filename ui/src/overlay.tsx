import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { Point } from '../../src/shared/ipc';
import './overlay.css';

function Overlay(): React.JSX.Element {
  const [dots, setDots] = useState<Point[]>([]);

  useEffect(() => window.overlay.onDotsUpdated(setDots), []);

  return (
    <>
      {dots.map((dot, index) => (
        <span
          key={`${dot.x}-${dot.y}-${index}`}
          className="overlay-dot"
          style={{ left: dot.x, top: dot.y }}
        />
      ))}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('overlay-root') as HTMLElement).render(
  <React.StrictMode>
    <Overlay />
  </React.StrictMode>,
);
