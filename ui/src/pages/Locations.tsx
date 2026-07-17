import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  MapPin,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { Point } from "../../../src/shared/ipc";
import { DEFAULT_DELAY_MS, DELAY_OPTIONS } from "../constants/locations";

interface TriggerPosition extends Point {
  delayMs: number;
}

interface TriggerBot {
  id: string;
  name: string;
  positions: TriggerPosition[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Locations(): React.JSX.Element {
  const [triggerBots, setTriggerBots] = useState<TriggerBot[]>([]);
  const [runningBotId, setRunningBotId] = useState<string | null>(null);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [collapsedBotIds, setCollapsedBotIds] = useState<Set<string>>(
    new Set(),
  );

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPositions, setCapturedPositions] = useState<Point[]>([]);
  const [setName, setSetName] = useState("");

  useEffect(() => {
    const unsubscribePoint = window.capture.onPointCaptured((point) => {
      setCapturedPositions((prev) => [...prev, point]);
    });
    const unsubscribeStopped = window.capture.onStopped(() => {
      setIsCapturing(false);
    });

    return () => {
      unsubscribePoint();
      unsubscribeStopped();
      if (isCapturing) void window.capture.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSets = (): void => {
    setCapturedPositions([]);
    setIsCapturing(true);
    void window.capture.start();
  };

  const handleCancelCapture = (): void => {
    void window.capture.stop();
    setCapturedPositions([]);
  };

  const handleSave = (): void => {
    const trimmedName = setName.trim();
    if (!trimmedName || capturedPositions.length === 0) return;
    const newBot: TriggerBot = {
      id: `${trimmedName}-${Date.now()}`,
      name: trimmedName,
      positions: capturedPositions.map((point) => ({
        ...point,
        delayMs: DEFAULT_DELAY_MS,
      })),
    };
    setTriggerBots((prev) => [...prev, newBot]);
    setCollapsedBotIds((prev) => new Set(prev).add(newBot.id));
    setSetName("");
    setCapturedPositions([]);
  };

  const updatePositionDelay = (
    botId: string,
    positionIndex: number,
    delayMs: number,
  ): void => {
    setTriggerBots((prev) =>
      prev.map((bot) =>
        bot.id === botId
          ? {
              ...bot,
              positions: bot.positions.map((p, i) =>
                i === positionIndex ? { ...p, delayMs } : p,
              ),
            }
          : bot,
      ),
    );
  };

  const handleDelete = (botId: string): void => {
    setTriggerBots((prev) => prev.filter((bot) => bot.id !== botId));
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
    const botId = editingBotId;
    setTriggerBots((prev) =>
      prev.map((bot) =>
        bot.id === botId ? { ...bot, name: trimmedName } : bot,
      ),
    );
    handleCancelRename();
  };

  const handleToggleCollapse = (botId: string): void => {
    setCollapsedBotIds((prev) => {
      const next = new Set(prev);
      if (next.has(botId)) next.delete(botId);
      else next.add(botId);
      return next;
    });
  };

  const handleDeleteCapturedPosition = (index: number): void => {
    setCapturedPositions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTrigger = async (bot: TriggerBot): Promise<void> => {
    setRunningBotId(bot.id);
    try {
      for (const position of bot.positions) {
        await window.robot.moveMouse(position.x, position.y);
        await sleep(50);
        await window.robot.clickMouse();
        await sleep(position.delayMs);
      }
    } finally {
      setRunningBotId(null);
    }
  };

  const isRunning = runningBotId !== null;

  return (
    <div className="grid h-full grid-cols-2 gap-6">
      <section className="flex min-h-0 flex-col gap-3">
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Trigger Bots
        </h2>
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
                  className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCollapse(bot.id)}
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
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") handleConfirmRename();
                            if (event.key === "Escape") handleCancelRename();
                          }}
                          className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                        />
                      ) : (
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {bot.name}
                        </p>
                      )}
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {bot.positions.length} position(s)
                      </p>
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
                            className="inline-flex items-center justify-center rounded-md bg-neutral-200 p-2 text-neutral-500 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleTrigger(bot)}
                            disabled={isRunning}
                            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Play className="h-4 w-4" />
                            {runningBotId === bot.id ? "Running…" : "Trigger"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartRename(bot)}
                            disabled={isRunning}
                            aria-label={`Rename ${bot.name}`}
                            className="inline-flex items-center justify-center rounded-md bg-neutral-200 p-2 text-neutral-500 hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(bot.id)}
                            disabled={isRunning}
                            aria-label={`Delete ${bot.name}`}
                            className="inline-flex items-center justify-center rounded-md bg-neutral-200 p-2 text-neutral-500 hover:bg-red-600/20 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
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
                          className="flex items-center justify-between gap-2 rounded-md bg-neutral-100 px-3 py-2 dark:bg-neutral-900"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                              #{index + 1} — {position.x}, {position.y}
                            </p>
                          </div>
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
                            {DELAY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="flex min-h-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            Trigger Set Positions
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddSets}
              disabled={isCapturing}
              className="inline-flex items-center gap-2 rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <Plus className="h-4 w-4" />
              Add sets
            </button>
            {isCapturing && (
              <button
                type="button"
                onClick={handleCancelCapture}
                className="inline-flex items-center gap-2 rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-red-600/20 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {isCapturing && (
          <p className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
            Capturing — press Space anywhere on screen to add the mouse
            position, Escape to stop.
          </p>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {capturedPositions.length === 0 && !isCapturing ? (
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
                    onClick={() => handleDeleteCapturedPosition(index)}
                    aria-label={`Delete position ${index + 1}`}
                    className="inline-flex items-center justify-center rounded-md bg-neutral-200 p-2 text-neutral-500 hover:bg-red-600/20 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <input
            value={setName}
            onChange={(event) => setSetName(event.target.value)}
            placeholder="Trigger set name"
            className="flex-1 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!setName.trim() || capturedPositions.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            Save sets
          </button>
        </div>
      </section>
    </div>
  );
}

export default Locations;
