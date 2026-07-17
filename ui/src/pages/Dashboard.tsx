import { useEffect, useState } from 'react';
import type { Point, ScreenSize } from '../../../src/shared/ipc';

function Dashboard(): React.JSX.Element {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [screenSize, setScreenSize] = useState<ScreenSize | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);

  const refresh = async (): Promise<void> => {
    const isAvailable = await window.robot.isAvailable();
    setAvailable(isAvailable);
    if (!isAvailable) return;
    setScreenSize(await window.robot.getScreenSize());
    setMousePos(await window.robot.getMousePos());
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {available === false && (
        <p className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          Automation is unavailable on this platform — nut.js failed to load its native binding.
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Screen size</p>
          <p className="text-lg font-medium">
            {screenSize ? `${screenSize.width} x ${screenSize.height}` : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Mouse position</p>
          <p className="text-lg font-medium">{mousePos ? `${mousePos.x}, ${mousePos.y}` : '—'}</p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
