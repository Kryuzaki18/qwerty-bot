import { Eye, EyeOff, GripVertical, MapPin, Trash2 } from "lucide-react";
import { KEY_OPTIONS } from "../../../constants/trigger.constant";
import {
  ICON_BUTTON,
  ICON_BUTTON_DANGER_HOVER,
  ICON_BUTTON_DISABLED,
  ICON_BUTTON_NEUTRAL,
} from "../../../constants/button.constant";
import { useTriggerBotsStore, type TriggerBot } from "../../../store/useTriggerBotsStore";
import { useDragReorder } from "../../../hooks/useDragReorder";
import { useFlipAnimation } from "../../../hooks/useFlipAnimation";
import { getObjectId } from "../../../utils/objectId.util";
import DragPreview from "../../../commons/DragPreview";
import DelayOptions from "./DelayOptions";

interface TriggerBotPositionsProps {
  bot: TriggerBot;
  visibleBotId: string | null;
  hiddenPositionIndices: Record<string, Set<number>>;
  isRunning: boolean;
  onTogglePositionVisibility: (botId: string, positionIndex: number) => void;
  onDeletePosition: (botId: string, positionIndex: number) => void;
  onReorderPositions: (botId: string, fromIndex: number, toIndex: number) => void;
}

function TriggerBotPositions({
  bot,
  visibleBotId,
  hiddenPositionIndices,
  isRunning,
  onTogglePositionVisibility,
  onDeletePosition,
  onReorderPositions,
}: TriggerBotPositionsProps): React.JSX.Element {
  const {
    updatePositionDelay,
    updatePositionKey,
    updatePositionKeyDelay,
    updatePositionMouseButton,
  } = useTriggerBotsStore();

  const { draggedIndex, dragOverIndex, pointerPosition, getHandleProps, getDropTargetProps } =
    useDragReorder(
      (fromIndex, toIndex) => onReorderPositions(bot.id, fromIndex, toIndex),
      isRunning,
    );

  const getPositionFlipRef = useFlipAnimation(bot.positions.map(getObjectId));

  return (
    <>
      <ul className="mt-3 flex flex-col gap-2">
        {bot.positions.map((position, index) => (
          <li
            key={getObjectId(position)}
            ref={getPositionFlipRef(getObjectId(position))}
            {...getDropTargetProps(index)}
            className={`flex flex-col gap-2 rounded-md bg-neutral-100 p-2 dark:bg-neutral-900 transition-opacity ${
              draggedIndex === index ? "opacity-40" : ""
            } ${
              dragOverIndex === index && draggedIndex !== index
                ? "ring-2 ring-emerald-500"
                : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  {...getHandleProps(index)}
                  aria-label={`Reorder position ${index + 1} of ${bot.name}`}
                  className={`inline-flex cursor-grab items-center justify-center text-neutral-400 hover:text-neutral-600 active:cursor-grabbing dark:text-neutral-500 dark:hover:text-neutral-300 ${
                    isRunning ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  #{index + 1} — {position.x}, {position.y}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {(() => {
                  const isBotVisible = visibleBotId === bot.id;
                  const isPositionHidden =
                    hiddenPositionIndices[bot.id]?.has(index) ?? false;
                  const isPositionVisible = isBotVisible && !isPositionHidden;
                  return (
                    <button
                      type="button"
                      onClick={() => onTogglePositionVisibility(bot.id, index)}
                      disabled={isRunning}
                      aria-label={
                        isPositionVisible
                          ? `Hide position ${index + 1} of ${bot.name} on screen`
                          : `Show position ${index + 1} of ${bot.name} on screen`
                      }
                      className={`${ICON_BUTTON} ${ICON_BUTTON_DISABLED} ${
                        isPositionVisible
                          ? "bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/25 dark:text-emerald-400"
                          : ICON_BUTTON_NEUTRAL
                      }`}
                    >
                      {isPositionVisible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => onDeletePosition(bot.id, index)}
                  disabled={isRunning}
                  aria-label={`Delete position ${index + 1} from ${bot.name}`}
                  className={`${ICON_BUTTON} bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${ICON_BUTTON_DANGER_HOVER} ${ICON_BUTTON_DISABLED}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex flex-col gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                Click delay
                <select
                  value={position.delayMs}
                  onChange={(event) =>
                    updatePositionDelay(bot.id, index, Number(event.target.value))
                  }
                  disabled={isRunning}
                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  <DelayOptions />
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                Key
                <select
                  value={position.key}
                  onChange={(event) => updatePositionKey(bot.id, index, event.target.value)}
                  disabled={isRunning}
                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  {KEY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                After key delay
                <select
                  value={position.key === "" ? "" : position.keyDelayMs}
                  onChange={(event) =>
                    updatePositionKeyDelay(bot.id, index, Number(event.target.value))
                  }
                  disabled={isRunning || position.key === ""}
                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  {position.key === "" && <option value="">N/A</option>}
                  <DelayOptions />
                </select>
              </label>
              <div className="flex flex-col gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                Click type
                <div className="inline-flex overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => updatePositionMouseButton(bot.id, index, "left")}
                    disabled={isRunning}
                    aria-pressed={(position.mouseButton ?? "left") === "left"}
                    className={`px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                      (position.mouseButton ?? "left") === "left"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    }`}
                  >
                    Left Click
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePositionMouseButton(bot.id, index, "right")}
                    disabled={isRunning}
                    aria-pressed={position.mouseButton === "right"}
                    className={`border-l border-neutral-200 px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 ${
                      position.mouseButton === "right"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    }`}
                  >
                    Right Click
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {draggedIndex !== null && (
        <DragPreview position={pointerPosition}>
          <div className="flex items-center gap-2 rounded-md border border-emerald-500 bg-white px-2 py-1.5 text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-200">
            <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            #{draggedIndex + 1} — {bot.positions[draggedIndex]?.x},{" "}
            {bot.positions[draggedIndex]?.y}
          </div>
        </DragPreview>
      )}
    </>
  );
}

export default TriggerBotPositions;
