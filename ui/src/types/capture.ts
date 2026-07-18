import type { Point } from "../../../src/shared/ipc";

export interface CaptureState {
  isCapturing: boolean;
  capturedPositions: Point[];
  addingLocationBotId: string | null;
  onCancelCapture: () => void;
  onDeleteCapturedPosition: (index: number) => void;
  onSave: () => void;
}
