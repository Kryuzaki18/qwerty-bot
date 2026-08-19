import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import type { PointerPosition } from "../hooks/useDragReorder";

interface DragPreviewProps {
  position: PointerPosition | null;
  children: ReactNode;
}

function DragPreview({ position, children }: DragPreviewProps): React.JSX.Element | null {
  if (!position) return null;
  return createPortal(
    <div
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 opacity-90 shadow-xl"
      style={{ left: position.x, top: position.y }}
    >
      {children}
    </div>,
    document.body,
  );
}

export default DragPreview;
