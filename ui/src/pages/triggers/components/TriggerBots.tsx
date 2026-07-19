import { useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { KEY_OPTIONS, MAX_TRIGGER_BOTS } from "../../../constants/trigger.constant";
import {
  ICON_BUTTON,
  ICON_BUTTON_DANGER_HOVER,
  ICON_BUTTON_DISABLED,
  ICON_BUTTON_NEUTRAL,
} from "../../../constants/button.constant";
import {
  useTriggerBotsStore,
  type TriggerBot,
} from "../../../store/useTriggerBotsStore";
import type { CaptureState } from "../../../types/capture";
import DelayOptions from "./DelayOptions";

interface TriggerBotsProps {
  collapsedBotIds: Set<string>;
  visibleBotId: string | null;
  runningBotId: string | null;
  isRunning: boolean;
  capture: CaptureState;
  onToggleCollapse: (botId: string) => void;
  onToggleView: (bot: TriggerBot) => void;
  onStartAddLocation: (bot: TriggerBot) => void;
  onCopyBot: (bot: TriggerBot) => void;
  onDelete: (botId: string) => void;
  onTrigger: (bot: TriggerBot) => void;
  onDeletePosition: (botId: string, positionIndex: number) => void;
  onExport: () => void;
  onImport: (jsonText: string) => void;
}

function TriggerBots({
  collapsedBotIds,
  visibleBotId,
  runningBotId,
  isRunning,
  capture,
  onToggleCollapse,
  onToggleView,
  onStartAddLocation,
  onCopyBot,
  onDelete,
  onTrigger,
  onDeletePosition,
  onExport,
  onImport,
}: TriggerBotsProps): React.JSX.Element {
  const {
    triggerBots,
    renameBot,
    updatePositionDelay,
    updatePositionKey,
    updatePositionKeyDelay,
  } = useTriggerBotsStore();
  const {
    isCapturing,
    capturedPositions,
    addingLocationBotId,
    onCancelCapture,
    onDeleteCapturedPosition,
    onSave,
  } = capture;

  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  const isActionDisabled = isRunning || isCapturing || capturedPositions.length > 0;

  const handleImportClick = (): void => {
    importInputRef.current?.click();
  };

  const handleImportFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImport(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleStartRename = (bot: TriggerBot): void => {
    setEditingBotId(bot.id);
    setEditingName(bot.name);
  };

  const handleCancelRename = (): void => {
    setEditingBotId(null);
    setEditingName("");
  };

  const handleConfirmRename = (): void => {
    const trimmedName = editingName.trim();
    if (!trimmedName || !editingBotId) {
      handleCancelRename();
      return;
    }
    renameBot(editingBotId, trimmedName);
    handleCancelRename();
  };

  return (
    <section className="flex min-h-0 flex-col gap-3 bg-neutral-50 dark:bg-neutral-900/30 p-3 rounded-lg">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Trigger Bots
        </h2>
        <div className="flex items-center gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFileChange}
          />
          <button
            type="button"
            onClick={handleImportClick}
            disabled={isActionDisabled || triggerBots.length >= MAX_TRIGGER_BOTS}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={isActionDisabled || triggerBots.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {triggerBots.length}/{MAX_TRIGGER_BOTS}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {triggerBots.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No trigger sets saved yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {triggerBots.map((bot) => (
              <li
                key={bot.id}
                className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800 bg-white dark:bg-transparent"
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-neutral-400 dark:text-neutral-500">
                  <p>
                    Created{" "}
                    {new Date(bot.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p>{bot.positions.length} position(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleCollapse(bot.id)}
                    aria-label={
                      collapsedBotIds.has(bot.id)
                        ? `Expand ${bot.name}`
                        : `Collapse ${bot.name}`
                    }
                    className="inline-flex shrink-0 items-center justify-center rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${collapsedBotIds.has(bot.id) ? "-rotate-90" : ""}`}
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    {editingBotId === bot.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleConfirmRename();
                          if (event.key === "Escape") handleCancelRename();
                        }}
                        className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                      />
                    ) : (
                      <p
                        title={bot.name}
                        className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100"
                      >
                        {bot.name}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {editingBotId === bot.id ? (
                      <>
                        <button
                          type="button"
                          onClick={handleConfirmRename}
                          aria-label="Confirm rename"
                          className="inline-flex items-center justify-center rounded-md bg-emerald-600 p-2 text-white hover:bg-emerald-500"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          aria-label="Cancel rename"
                          className={`${ICON_BUTTON} ${ICON_BUTTON_NEUTRAL}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onToggleView(bot)}
                          disabled={
                            isRunning || isCapturing || capturedPositions.length > 0
                          }
                          aria-label={
                            visibleBotId === bot.id
                              ? `Hide ${bot.name} on screen`
                              : `Show ${bot.name} on screen`
                          }
                          className={`${ICON_BUTTON} ${ICON_BUTTON_DISABLED} ${
                            visibleBotId === bot.id
                              ? "bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/25 dark:text-emerald-400"
                              : ICON_BUTTON_NEUTRAL
                          }`}
                        >
                          {visibleBotId === bot.id ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onStartAddLocation(bot)}
                          disabled={
                            isRunning || isCapturing || capturedPositions.length > 0
                          }
                          aria-label={`Add location to ${bot.name}`}
                          className={`${ICON_BUTTON} ${ICON_BUTTON_NEUTRAL} ${ICON_BUTTON_DISABLED}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartRename(bot)}
                          disabled={isRunning || isCapturing || capturedPositions.length > 0}
                          aria-label={`Rename ${bot.name}`}
                          className={`${ICON_BUTTON} ${ICON_BUTTON_NEUTRAL} ${ICON_BUTTON_DISABLED}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onCopyBot(bot)}
                          disabled={
                            isRunning || isCapturing || capturedPositions.length > 0 || triggerBots.length >= MAX_TRIGGER_BOTS
                          }
                          aria-label={`Copy ${bot.name}`}
                          className={`${ICON_BUTTON} ${ICON_BUTTON_NEUTRAL} ${ICON_BUTTON_DISABLED}`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(bot.id)}
                          disabled={isRunning || isCapturing || capturedPositions.length > 0}
                          aria-label={`Delete ${bot.name}`}
                          className={`${ICON_BUTTON} bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${ICON_BUTTON_DANGER_HOVER} ${ICON_BUTTON_DISABLED}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onTrigger(bot)}
                          disabled={isRunning || isCapturing || capturedPositions.length > 0}
                          aria-label={
                            runningBotId === bot.id
                              ? `Running ${bot.name}`
                              : `Trigger ${bot.name}`
                          }
                          className={`inline-flex items-center justify-center rounded-md bg-emerald-600 p-2 text-white hover:bg-emerald-500 ${ICON_BUTTON_DISABLED}`}
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!collapsedBotIds.has(bot.id) && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {bot.positions.map((position, index) => (
                      <li
                        key={`${bot.id}-${index}`}
                        className="flex flex-col gap-2 rounded-md bg-neutral-100 p-2 dark:bg-neutral-900"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                              #{index + 1} — {position.x}, {position.y}
                            </p>
                          </div>
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

                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex flex-col gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                            Click delay
                            <select
                              value={position.delayMs}
                              onChange={(event) =>
                                updatePositionDelay(
                                  bot.id,
                                  index,
                                  Number(event.target.value),
                                )
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
                              onChange={(event) =>
                                updatePositionKey(
                                  bot.id,
                                  index,
                                  event.target.value,
                                )
                              }
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
                                updatePositionKeyDelay(
                                  bot.id,
                                  index,
                                  Number(event.target.value),
                                )
                              }
                              disabled={isRunning || position.key === ""}
                              className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                            >
                              {position.key === "" && (
                                <option value="">N/A</option>
                              )}
                              <DelayOptions />
                            </select>
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {addingLocationBotId === bot.id && (
                  <div className="mt-3 flex flex-col gap-2 rounded-md border border-emerald-600/30 bg-emerald-500/10 p-3">
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      {isCapturing
                        ? "Capturing — press Space anywhere on screen to add a position, Escape to stop."
                        : "Capture stopped."}
                    </p>
                    {capturedPositions.length > 0 && (
                      <ul className="flex flex-col gap-1">
                        {capturedPositions.map((point, index) => (
                          <li
                            key={`new-${bot.id}-${index}-${point.x}-${point.y}`}
                            className="flex items-center justify-between gap-2 rounded-md bg-white px-2 py-1 text-xs dark:bg-neutral-950"
                          >
                            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                              <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              #{index + 1} — {point.x}, {point.y}
                            </span>
                            <button
                              type="button"
                              onClick={() => onDeleteCapturedPosition(index)}
                              aria-label={`Delete captured position ${index + 1}`}
                              className={`${ICON_BUTTON} bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${ICON_BUTTON_DANGER_HOVER}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={onCancelCapture}
                        className="inline-flex items-center gap-1.5 rounded-md bg-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-red-600/20 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={onSave}
                        disabled={capturedPositions.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Add position(s)
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default TriggerBots;
