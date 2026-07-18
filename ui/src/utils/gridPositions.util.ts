import type { Point } from "../../../src/shared/ipc";
import {
  GENERATE_POSITIONS_COLUMNS,
  GENERATE_POSITIONS_SPACING_X,
  GENERATE_POSITIONS_SPACING_Y,
} from "../constants/trigger.constant";

export function generateGridPositions(
  count: number,
  screenWidth: number,
  screenHeight: number,
): Point[] {
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  const rowCount = Math.ceil(count / GENERATE_POSITIONS_COLUMNS);
  const totalHeight = (rowCount - 1) * GENERATE_POSITIONS_SPACING_Y;

  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / GENERATE_POSITIONS_COLUMNS);
    const rowStart = row * GENERATE_POSITIONS_COLUMNS;
    const colsInRow = Math.min(GENERATE_POSITIONS_COLUMNS, count - rowStart);
    const col = i - rowStart;
    const rowWidth = (colsInRow - 1) * GENERATE_POSITIONS_SPACING_X;
    return {
      x: Math.round(centerX - rowWidth / 2 + col * GENERATE_POSITIONS_SPACING_X),
      y: Math.round(centerY - totalHeight / 2 + row * GENERATE_POSITIONS_SPACING_Y),
    };
  });
}
