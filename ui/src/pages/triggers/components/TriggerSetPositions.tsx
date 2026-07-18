import { MapPin, Plus, Save, Trash2, X } from "lucide-react";
import {
  GENERATE_POSITIONS_OPTIONS,
  MAX_TRIGGER_BOTS,
} from "../../../constants/trigger.constant";
import {
  ICON_BUTTON,
  ICON_BUTTON_DANGER_HOVER,
} from "../../../constants/button.constant";
import { useTriggerBotsStore } from "../../../store/useTriggerBotsStore";
import type { CaptureState } from "../../../types/capture";

interface TriggerSetPositionsProps {
  isRunning: boolean;
  capture: CaptureState;
  setName: string;
  onSetNameChange: (value: string) => void;
  onGeneratePositions: (count: number) => void;
  onAddSets: () => void;
}

function TriggerSetPositions({
  isRunning,
  capture,
  setName,
  onSetNameChange,
  onGeneratePositions,
  onAddSets,
}: TriggerSetPositionsProps): React.JSX.Element {
  const { triggerBots } = useTriggerBotsStore();
  const {
    isCapturing,
    capturedPositions,
    addingLocationBotId,
    onCancelCapture,
    onDeleteCapturedPosition,
    onSave,
  } = capture;

  return (
    <section className="flex min-h-0 flex-col gap-3 p-3">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Trigger Set Positions
        </h2>
        <div className="flex items-center gap-2">
          <select
            value=""
            onChange={(event) => {
              const count = Number(event.target.value);
              if (count > 0) onGeneratePositions(count);
            }}
            disabled={isRunning || isCapturing}
            aria-label="Generate positions"
            className="rounded-md border border-neutral-200 bg-neutral-200 px-3 py-2 text-sm font-medium outline-none hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <option value="" disabled>
              Generate Positions
            </option>
            {GENERATE_POSITIONS_OPTIONS.map((count) => (
              <option key={count} value={count}>
                Generate {count} Position{count === 1 ? "" : "s"}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddSets}
            disabled={isCapturing}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <Plus className="h-4 w-4" />
            Add sets
          </button>
          {(isCapturing || capturedPositions.length > 0) && (
            <button
              type="button"
              onClick={onCancelCapture}
              className="inline-flex items-center gap-2 rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-red-600/20 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-red-400"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {isCapturing && !addingLocationBotId && (
        <p className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
          Capturing — press Space anywhere on screen to add the mouse
          position, Escape to stop.
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {addingLocationBotId ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Capturing new positions for{" "}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {triggerBots.find((bot) => bot.id === addingLocationBotId)
                ?.name ?? "the selected trigger bot"}
            </span>{" "}
            — see its card in Trigger Bots.
          </p>
        ) : capturedPositions.length === 0 && !isCapturing ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No positions captured yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {capturedPositions.map((point, index) => (
              <li
                key={`${index}-${point.x}-${point.y}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    #{index + 1} — {point.x}, {point.y}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteCapturedPosition(index)}
                  aria-label={`Delete position ${index + 1}`}
                  className={`${ICON_BUTTON} bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${ICON_BUTTON_DANGER_HOVER}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!addingLocationBotId && (
        <div className="flex shrink-0 items-center gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <input
            value={setName}
            onChange={(event) => onSetNameChange(event.target.value)}
            placeholder="Trigger set name"
            className="flex-1 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={onSave}
            disabled={
              !setName.trim() ||
              capturedPositions.length === 0 ||
              triggerBots.length >= MAX_TRIGGER_BOTS
            }
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            Save sets
          </button>
        </div>
      )}
    </section>
  );
}

export default TriggerSetPositions;
