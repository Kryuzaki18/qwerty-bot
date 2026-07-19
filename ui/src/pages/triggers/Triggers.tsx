import { useEffect, useState } from "react";
import type { Point } from "../../../../src/shared/ipc";
import {
  CAPTURING_OVERLAY_ID,
  MAX_TRIGGER_BOTS,
  MOUSE_CLICK_SETTLE_MS,
} from "../../constants/trigger.constant";
import { useTriggerSettingsStore } from "../../store/useTriggerSettingsStore";
import {
  useTriggerBotsStore,
  type TriggerBot,
} from "../../store/useTriggerBotsStore";
import TriggerBots from "./components/TriggerBots";
import TriggerSetPositions from "./components/TriggerSetPositions";
import {
  clearOverlay,
  setOverlayDots,
  shiftHiddenIndicesAfterDelete,
  toOverlayDots,
} from "../../services/overlayService";
import type { CaptureState } from "../../types/capture";
import { sleep } from "../../utils/async.util";
import { generateGridPositions } from "../../utils/gridPositions.util";
import {
  createTriggerBot,
  generateCopyName,
  mergeImportedTriggerBots,
  parseImportedTriggerBots,
  toTriggerPositions,
} from "../../utils/triggerBot.util";
import {
  appendPositions,
  deletePosition,
  updatePositionPoint,
} from "../../services/triggerBot.service";

function Locations(): React.JSX.Element {
  const { triggerBots, setTriggerBots } = useTriggerBotsStore();
  const [runningBotId, setRunningBotId] = useState<string | null>(null);
  const [collapsedBotIds, setCollapsedBotIds] = useState<Set<string>>(
    () => new Set(triggerBots.map((bot) => bot.id)),
  );
  const [visibleBotId, setVisibleBotId] = useState<string | null>(null);
  const [hiddenPositionIndices, setHiddenPositionIndices] = useState<
    Record<string, Set<number>>
  >({});

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
    setOverlayDots(
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
          updatePositionPoint(prev, botId, index, point),
        );
      },
    );
    return unsubscribe;
  }, []);

  const applyOverlayForBot = (
    botId: string,
    positions: TriggerBot["positions"],
    hidden: Set<number>,
  ): void => {
    setOverlayDots(botId, toOverlayDots(positions, hidden));
  };

  const clearHiddenPositions = (botId: string): void => {
    setHiddenPositionIndices((prev) => {
      if (!(botId in prev)) return prev;
      const next = { ...prev };
      delete next[botId];
      return next;
    });
  };

  const hideVisibleBot = (): void => {
    if (!visibleBotId) return;
    clearOverlay(visibleBotId);
    clearHiddenPositions(visibleBotId);
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
    setCapturedPositions(generateGridPositions(count, width, height));
  };

  const handleAddLocationsToBot = (botId: string): void => {
    if (capturedPositions.length === 0) return;
    const newPositions = toTriggerPositions(capturedPositions, {
      delayMs: defaultDelayMs,
      key: defaultKey,
      keyDelayMs: defaultKeyDelayMs,
      mouseButton: "left",
    });
    setTriggerBots((prev) => appendPositions(prev, botId, newPositions));
    if (visibleBotId === botId) {
      const bot = triggerBots.find((b) => b.id === botId);
      if (bot) {
        applyOverlayForBot(
          botId,
          [...bot.positions, ...newPositions],
          hiddenPositionIndices[botId] ?? new Set(),
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
    if (!trimmedName || triggerBots.length >= MAX_TRIGGER_BOTS) return;
    const newBot = createTriggerBot(
      trimmedName,
      toTriggerPositions(capturedPositions, {
        delayMs: defaultDelayMs,
        key: defaultKey,
        keyDelayMs: defaultKeyDelayMs,
        mouseButton: "left",
      }),
    );
    setTriggerBots((prev) => [...prev, newBot]);
    setCollapsedBotIds((prev) => new Set(prev).add(newBot.id));
    setSetName("");
    setCapturedPositions([]);
    void window.capture.stop();
    setIsCapturing(false);
  };

  const handleDeletePosition = (botId: string, positionIndex: number): void => {
    setTriggerBots((prev) => deletePosition(prev, botId, positionIndex));
    const nextHidden = shiftHiddenIndicesAfterDelete(
      hiddenPositionIndices[botId] ?? new Set(),
      positionIndex,
    );
    setHiddenPositionIndices((prev) => ({ ...prev, [botId]: nextHidden }));
    if (visibleBotId === botId) {
      const bot = triggerBots.find((b) => b.id === botId);
      if (bot) {
        const nextPositions = bot.positions.filter(
          (_, i) => i !== positionIndex,
        );
        applyOverlayForBot(botId, nextPositions, nextHidden);
      }
    }
  };

  const handleDelete = (botId: string): void => {
    setTriggerBots((prev) => prev.filter((bot) => bot.id !== botId));
    clearHiddenPositions(botId);
    if (visibleBotId === botId) {
      setVisibleBotId(null);
      clearOverlay(botId);
    }
  };

  const handleCopyBot = (bot: TriggerBot): void => {
    if (triggerBots.length >= MAX_TRIGGER_BOTS) return;
    const copyName = generateCopyName(triggerBots, bot.name);
    const newBot = createTriggerBot(
      copyName,
      bot.positions.map((position) => ({ ...position })),
    );
    setTriggerBots((prev) => [...prev, newBot]);
    setCollapsedBotIds((prev) => new Set(prev).add(newBot.id));
  };

  const handleToggleView = (bot: TriggerBot): void => {
    const isFullyVisible =
      visibleBotId === bot.id &&
      (hiddenPositionIndices[bot.id]?.size ?? 0) === 0;

    if (isFullyVisible) {
      const allHidden = new Set(bot.positions.map((_, i) => i));
      setHiddenPositionIndices((prev) => ({ ...prev, [bot.id]: allHidden }));
      applyOverlayForBot(bot.id, bot.positions, allHidden);
      return;
    }

    const previousBotId = visibleBotId;
    if (previousBotId && previousBotId !== bot.id) {
      clearOverlay(previousBotId);
      clearHiddenPositions(previousBotId);
    }
    setVisibleBotId(bot.id);
    setHiddenPositionIndices((prev) => ({ ...prev, [bot.id]: new Set() }));
    applyOverlayForBot(bot.id, bot.positions, new Set());
  };

  const handleTogglePositionVisibility = (
    botId: string,
    positionIndex: number,
  ): void => {
    const bot = triggerBots.find((b) => b.id === botId);
    if (!bot) return;

    if (visibleBotId !== botId) {
      const previousBotId = visibleBotId;
      if (previousBotId) {
        clearOverlay(previousBotId);
        clearHiddenPositions(previousBotId);
      }
      const onlyClickedVisible = new Set(
        bot.positions.map((_, i) => i).filter((i) => i !== positionIndex),
      );
      setVisibleBotId(botId);
      setHiddenPositionIndices((prev) => ({ ...prev, [botId]: onlyClickedVisible }));
      applyOverlayForBot(botId, bot.positions, onlyClickedVisible);
      return;
    }

    const nextHidden = new Set(hiddenPositionIndices[botId] ?? []);
    if (nextHidden.has(positionIndex)) nextHidden.delete(positionIndex);
    else nextHidden.add(positionIndex);
    setHiddenPositionIndices((prev) => ({ ...prev, [botId]: nextHidden }));
    applyOverlayForBot(botId, bot.positions, nextHidden);
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

  const handleExportTriggerBots = (): void => {
    if (triggerBots.length === 0) return;
    const dataStr = JSON.stringify(triggerBots, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trigger-bots-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTriggerBots = (jsonText: string): void => {
    let importedBots: TriggerBot[];
    try {
      importedBots = parseImportedTriggerBots(jsonText);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Invalid trigger bots file.",
      );
      return;
    }

    const availableSlots = MAX_TRIGGER_BOTS - triggerBots.length;
    if (availableSlots <= 0) {
      window.alert(
        `Cannot import: maximum of ${MAX_TRIGGER_BOTS} trigger bots reached.`,
      );
      return;
    }
    if (importedBots.length > availableSlots) {
      window.alert(
        `Only ${availableSlots} of ${importedBots.length} trigger bot(s) were imported (limit ${MAX_TRIGGER_BOTS}).`,
      );
    }

    const boundedImportedBots = importedBots.slice(0, availableSlots);
    setTriggerBots((prev) =>
      mergeImportedTriggerBots(prev, boundedImportedBots),
    );
  };

  const handleTrigger = async (bot: TriggerBot): Promise<void> => {
    hideVisibleBot();
    setRunningBotId(bot.id);
    try {
      await window.appWindow.minimize();
      for (const position of bot.positions) {
        await window.robot.moveMouse(position.x, position.y);
        await sleep(MOUSE_CLICK_SETTLE_MS);
        await window.robot.clickMouse(position.mouseButton);
        if (position.delayMs > 0) {
          await sleep(position.delayMs);
        }
        if (position.key) {
          await window.robot.pressKey(position.key);
          if(position.keyDelayMs > 0 ) {
            await sleep(position.keyDelayMs);
          }
        }
      }
    } finally {
      await window.appWindow.restore();
      setRunningBotId(null);
    }
  };

  const isRunning = runningBotId !== null;

  const captureState: CaptureState = {
    isCapturing,
    capturedPositions,
    addingLocationBotId,
    onCancelCapture: handleCancelCapture,
    onDeleteCapturedPosition: handleDeleteCapturedPosition,
    onSave: handleSave,
  };

  return (
    <div className="grid h-full grid-cols-2 gap-6">
      <TriggerBots
        collapsedBotIds={collapsedBotIds}
        visibleBotId={visibleBotId}
        hiddenPositionIndices={hiddenPositionIndices}
        runningBotId={runningBotId}
        isRunning={isRunning}
        capture={captureState}
        onToggleCollapse={handleToggleCollapse}
        onToggleView={handleToggleView}
        onTogglePositionVisibility={handleTogglePositionVisibility}
        onStartAddLocation={handleStartAddLocation}
        onCopyBot={handleCopyBot}
        onDelete={handleDelete}
        onTrigger={(bot) => void handleTrigger(bot)}
        onDeletePosition={handleDeletePosition}
        onExport={handleExportTriggerBots}
        onImport={handleImportTriggerBots}
      />

      <TriggerSetPositions
        isRunning={isRunning}
        capture={captureState}
        setName={setName}
        onSetNameChange={setSetName}
        onGeneratePositions={(count) => void handleGeneratePositions(count)}
        onAddSets={handleAddSets}
      />
    </div>
  );
}

export default Locations;
