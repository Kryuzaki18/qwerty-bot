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
import { clearOverlay, setOverlayDots, toOverlayPoints } from "../../services/overlayService";
import type { CaptureState } from "../../types/capture";
import { sleep } from "../../utils/async.util";
import { generateGridPositions } from "../../utils/gridPositions.util";
import {
  createTriggerBot,
  generateCopyName,
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
        setTriggerBots((prev) => updatePositionPoint(prev, botId, index, point));
      },
    );
    return unsubscribe;
  }, []);

  const hideVisibleBot = (): void => {
    if (!visibleBotId) return;
    clearOverlay(visibleBotId);
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
    });
    setTriggerBots((prev) => appendPositions(prev, botId, newPositions));
    if (visibleBotId === botId) {
      const bot = triggerBots.find((b) => b.id === botId);
      if (bot) {
        setOverlayDots(botId, toOverlayPoints([...bot.positions, ...newPositions]));
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
    if (visibleBotId === botId) {
      const bot = triggerBots.find((b) => b.id === botId);
      if (bot) {
        const nextPositions = bot.positions.filter(
          (_, i) => i !== positionIndex,
        );
        setOverlayDots(botId, toOverlayPoints(nextPositions));
      }
    }
  };

  const handleDelete = (botId: string): void => {
    setTriggerBots((prev) => prev.filter((bot) => bot.id !== botId));
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
    const isVisible = visibleBotId === bot.id;
    if (isVisible) {
      setVisibleBotId(null);
      clearOverlay(bot.id);
      return;
    }
    const previousBotId = visibleBotId;
    setVisibleBotId(bot.id);
    if (previousBotId) clearOverlay(previousBotId);
    setOverlayDots(bot.id, toOverlayPoints(bot.positions));
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
    hideVisibleBot();
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
        runningBotId={runningBotId}
        isRunning={isRunning}
        capture={captureState}
        onToggleCollapse={handleToggleCollapse}
        onToggleView={handleToggleView}
        onStartAddLocation={handleStartAddLocation}
        onCopyBot={handleCopyBot}
        onDelete={handleDelete}
        onTrigger={(bot) => void handleTrigger(bot)}
        onDeletePosition={handleDeletePosition}
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
