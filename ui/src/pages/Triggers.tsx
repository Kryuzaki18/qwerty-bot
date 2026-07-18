import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { Point } from "../../../src/shared/ipc";
import {
  CAPTURING_OVERLAY_ID,
  DELAY_OPTIONS,
  GENERATE_POSITIONS_COLUMNS,
  GENERATE_POSITIONS_OPTIONS,
  GENERATE_POSITIONS_SPACING_X,
  GENERATE_POSITIONS_SPACING_Y,
  KEY_OPTIONS,
  MOUSE_CLICK_SETTLE_MS,
} from "../constants/trigger.constant";
import {
  ICON_BUTTON,
  ICON_BUTTON_DANGER_HOVER,
  ICON_BUTTON_DISABLED,
  ICON_BUTTON_NEUTRAL,
} from "../constants/button.constant";
import { useTriggerSettingsStore } from "../store/useTriggerSettingsStore";

interface TriggerPosition extends Point {
  delayMs: number;
  key: string;
  keyDelayMs: number;
}

interface TriggerBot {
  id: string;
  name: string;
  positions: TriggerPosition[];
  createdAt: number;
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
  const [visibleBotId, setVisibleBotId] = useState<string | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPositions, setCapturedPositions] = useState<Point[]>([]);
  const [setName, setSetName] = useState("");
  const [addingLocationBotId, setAddingLocationBotId] = useState<
    string | null
  >(null);

  const { defaultDelayMs, defaultKey, defaultKeyDelayMs } =
    useTriggerSettingsStore();

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
      void window.capture.stop();
    };
  }, []);

  useEffect(() => {
    return () => {
      void window.overlay.clearAll();
    };
  }, []);

  useEffect(() => {
    void window.overlay.setBotDots(
      CAPTURING_OVERLAY_ID,
      capturedPositions.length > 0 ? capturedPositions : null,
    );
  }, [capturedPositions]);

  useEffect(() => {
    const unsubscribe = window.overlay.onPositionUpdated(
      (botId, index, point) => {
        if (botId === CAPTURING_OVERLAY_ID) {
          setCapturedPositions((prev) =>
            prev.map((position, i) => (i === index ? point : position)),
          );
          return;
        }
        setTriggerBots((prev) =>
          prev.map((bot) =>
            bot.id === botId
              ? {
                  ...bot,
                  positions: bot.positions.map((position, i) =>
                    i === index ? { ...position, ...point } : position,
                  ),
                }
              : bot,
          ),
        );
      },
    );
    return unsubscribe;
  }, []);

  const hideVisibleBot = (): void => {
    if (!visibleBotId) return;
    void window.overlay.setBotDots(visibleBotId, null);
    setVisibleBotId(null);
  };

  const handleAddSets = (): void => {
    hideVisibleBot();
    setAddingLocationBotId(null);
    setIsCapturing(true);
    void window.capture.start();
  };

  const handleStartAddLocation = (bot: TriggerBot): void => {
    setAddingLocationBotId(bot.id);
    setCapturedPositions([]);
    setIsCapturing(true);
    void window.capture.start();
  };

  const handleCancelCapture = (): void => {
    void window.capture.stop();
    setCapturedPositions([]);
    setAddingLocationBotId(null);
  };

  const handleGeneratePositions = async (count: number): Promise<void> => {
    hideVisibleBot();
    if (isCapturing) {
      void window.capture.stop();
      setIsCapturing(false);
    }
    const { width, height } = await window.robot.getScreenSize();
    const centerX = width / 2;
    const centerY = height / 2;
    const rowCount = Math.ceil(count / GENERATE_POSITIONS_COLUMNS);
    const totalHeight = (rowCount - 1) * GENERATE_POSITIONS_SPACING_Y;
    const points: Point[] = Array.from({ length: count }, (_, i) => {
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
    setCapturedPositions(points);
  };

  const handleAddLocationsToBot = (botId: string): void => {
    if (capturedPositions.length === 0) return;
    const newPositions = capturedPositions.map((point) => ({
      ...point,
      delayMs: defaultDelayMs,
      key: defaultKey,
      keyDelayMs: defaultKeyDelayMs,
    }));
    setTriggerBots((prev) =>
      prev.map((bot) =>
        bot.id === botId
          ? { ...bot, positions: [...bot.positions, ...newPositions] }
          : bot,
      ),
    );
    if (visibleBotId === botId) {
      const bot = triggerBots.find((b) => b.id === botId);
      if (bot) {
        const nextPositions = [...bot.positions, ...newPositions];
        void window.overlay.setBotDots(
          botId,
          nextPositions.map((position) => ({ x: position.x, y: position.y })),
        );
      }
    }
    setAddingLocationBotId(null);
    setCapturedPositions([]);
  };

  const handleSave = (): void => {
    if (capturedPositions.length === 0) return;
    if (addingLocationBotId) {
      handleAddLocationsToBot(addingLocationBotId);
      void window.capture.stop();
      setIsCapturing(false);
      return;
    }
    const trimmedName = setName.trim();
    if (!trimmedName) return;
    const newBot: TriggerBot = {
      id: `${trimmedName}-${Date.now()}`,
      name: trimmedName,
      positions: capturedPositions.map((point) => ({
        ...point,
        delayMs: defaultDelayMs,
        key: defaultKey,
        keyDelayMs: defaultKeyDelayMs,
      })),
      createdAt: Date.now(),
    };
    setTriggerBots((prev) => [...prev, newBot]);
    setCollapsedBotIds((prev) => new Set(prev).add(newBot.id));
    setSetName("");
    setCapturedPositions([]);
    void window.capture.stop();
    setIsCapturing(false);
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

  const updatePositionKey = (
    botId: string,
    positionIndex: number,
    key: string,
  ): void => {
    setTriggerBots((prev) =>
      prev.map((bot) =>
        bot.id === botId
          ? {
              ...bot,
              positions: bot.positions.map((p, i) =>
                i === positionIndex ? { ...p, key } : p,
              ),
            }
          : bot,
      ),
    );
  };

  const updatePositionKeyDelay = (
    botId: string,
    positionIndex: number,
    keyDelayMs: number,
  ): void => {
    setTriggerBots((prev) =>
      prev.map((bot) =>
        bot.id === botId
          ? {
              ...bot,
              positions: bot.positions.map((p, i) =>
                i === positionIndex ? { ...p, keyDelayMs } : p,
              ),
            }
          : bot,
      ),
    );
  };

  const handleDeletePosition = (botId: string, positionIndex: number): void => {
    setTriggerBots((prev) =>
      prev.map((bot) =>
        bot.id === botId
          ? {
              ...bot,
              positions: bot.positions.filter((_, i) => i !== positionIndex),
            }
          : bot,
      ),
    );
    if (visibleBotId === botId) {
      const bot = triggerBots.find((b) => b.id === botId);
      if (bot) {
        const nextPositions = bot.positions.filter(
          (_, i) => i !== positionIndex,
        );
        void window.overlay.setBotDots(
          botId,
          nextPositions.map((position) => ({ x: position.x, y: position.y })),
        );
      }
    }
  };

  const handleDelete = (botId: string): void => {
    setTriggerBots((prev) => prev.filter((bot) => bot.id !== botId));
    if (visibleBotId === botId) {
      setVisibleBotId(null);
      void window.overlay.setBotDots(botId, null);
    }
  };

  const handleCopyBot = (bot: TriggerBot): void => {
    const copyName = `${bot.name}-copy`;
    const newBot: TriggerBot = {
      ...bot,
      id: `${copyName}-${Date.now()}`,
      name: copyName,
      positions: bot.positions.map((position) => ({ ...position })),
      createdAt: Date.now(),
    };
    setTriggerBots((prev) => [...prev, newBot]);
    setCollapsedBotIds((prev) => new Set(prev).add(newBot.id));
  };

  const handleToggleView = (bot: TriggerBot): void => {
    const isVisible = visibleBotId === bot.id;
    if (isVisible) {
      setVisibleBotId(null);
      void window.overlay.setBotDots(bot.id, null);
      return;
    }
    const previousBotId = visibleBotId;
    setVisibleBotId(bot.id);
    if (previousBotId) void window.overlay.setBotDots(previousBotId, null);
    void window.overlay.setBotDots(
      bot.id,
      bot.positions.map((position) => ({ x: position.x, y: position.y })),
    );
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
      await window.appWindow.minimize();
      for (const position of bot.positions) {
        await window.robot.moveMouse(position.x, position.y);
        await sleep(MOUSE_CLICK_SETTLE_MS);
        await window.robot.clickMouse();
        await sleep(position.delayMs);
        if (position.key) {
          await window.robot.pressKey(position.key);
          await sleep(position.keyDelayMs);
        }
      }
    } finally {
      await window.appWindow.restore();
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
                            onClick={() => handleToggleView(bot)}
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
                            onClick={() => handleStartAddLocation(bot)}
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
                            disabled={isRunning}
                            aria-label={`Rename ${bot.name}`}
                            className={`${ICON_BUTTON} ${ICON_BUTTON_NEUTRAL} ${ICON_BUTTON_DISABLED}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyBot(bot)}
                            disabled={isRunning}
                            aria-label={`Copy ${bot.name}`}
                            className={`${ICON_BUTTON} ${ICON_BUTTON_NEUTRAL} ${ICON_BUTTON_DISABLED}`}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(bot.id)}
                            disabled={isRunning}
                            aria-label={`Delete ${bot.name}`}
                            className={`${ICON_BUTTON} bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${ICON_BUTTON_DANGER_HOVER} ${ICON_BUTTON_DISABLED}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleTrigger(bot)}
                            disabled={isRunning}
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
                              onClick={() =>
                                handleDeletePosition(bot.id, index)
                              }
                              disabled={isRunning}
                              aria-label={`Delete position ${index + 1} from ${bot.name}`}
                              className={`${ICON_BUTTON} bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${ICON_BUTTON_DANGER_HOVER} ${ICON_BUTTON_DISABLED}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
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
                                {DELAY_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
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
                            <label className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                              After key
                              <select
                                value={
                                  position.key === ""
                                    ? ""
                                    : position.keyDelayMs
                                }
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
                                {DELAY_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
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
                                onClick={() =>
                                  handleDeleteCapturedPosition(index)
                                }
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
                          onClick={handleCancelCapture}
                          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-red-600/20 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-red-400"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
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

      <section className="flex min-h-0 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            Trigger Set Positions
          </h2>
          <div className="flex items-center gap-2">
            <select
              value=""
              onChange={(event) => {
                const count = Number(event.target.value);
                if (count > 0) void handleGeneratePositions(count);
              }}
              disabled={isRunning}
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
                    onClick={() => handleDeleteCapturedPosition(index)}
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
        )}
      </section>
    </div>
  );
}

export default Locations;
