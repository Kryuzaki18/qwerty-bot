import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { OverlayDot } from '../../../src/shared/ipc';
import './overlay.css';

interface DragState {
  botId: string;
  index: number;
}

function Overlay(): React.JSX.Element {
  const [dots, setDots] = useState<OverlayDot[]>([]);
  const [dragPreview, setDragPreview] = useState<DragState & { x: number; y: number } | null>(null);
  const draggingRef = useRef<DragState | null>(null);

  useEffect(() => {
    const unsubscribe = window.overlay.onDotsUpdated((nextDots) => {
      setDots(nextDots);
      setDragPreview(null);
    });
    window.overlay.notifyReady();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent): void => {
      const dragging = draggingRef.current;
      if (!dragging) return;
      setDragPreview({ ...dragging, x: event.clientX, y: event.clientY });
    };
    const handleMouseUp = (event: MouseEvent): void => {
      const dragging = draggingRef.current;
      if (!dragging) return;
      draggingRef.current = null;
      window.overlay.reportDrag(dragging.botId, dragging.index, { x: event.clientX, y: event.clientY });
      window.overlay.setInteractive(false);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDotEnter = (): void => {
    if (!draggingRef.current) window.overlay.setInteractive(true);
  };

  const handleDotLeave = (): void => {
    if (!draggingRef.current) window.overlay.setInteractive(false);
  };

  const handleDotMouseDown = (dot: OverlayDot) => (event: React.MouseEvent): void => {
    event.preventDefault();
    draggingRef.current = { botId: dot.botId, index: dot.index };
    window.overlay.setInteractive(true);
  };

  return (
    <>
      {dots.map((dot) => {
        const preview =
          dragPreview && dragPreview.botId === dot.botId && dragPreview.index === dot.index ? dragPreview : null;
        return (
          <span
            key={`${dot.botId}-${dot.index}`}
            className="overlay-dot"
            style={{ left: preview?.x ?? dot.x, top: preview?.y ?? dot.y }}
            onMouseEnter={handleDotEnter}
            onMouseLeave={handleDotLeave}
            onMouseDown={handleDotMouseDown(dot)}
          >
            <span className="overlay-dot-index">{dot.index + 1}</span>
          </span>
        );
      })}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('overlay-root') as HTMLElement).render(
  <React.StrictMode>
    <Overlay />
  </React.StrictMode>,
);
