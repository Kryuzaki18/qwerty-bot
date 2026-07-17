import { useEffect, useState } from 'react';
import { Keyboard, MousePointer2, RefreshCw } from 'lucide-react';
import type { Point, ScreenSize } from '../../../src/shared/ipc';

function Dashboard(): React.JSX.Element {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [screenSize, setScreenSize] = useState<ScreenSize | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [typedText, setTypedText] = useState('');

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

      <section className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={!available}
          className="inline-flex items-center gap-2 rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <button
          type="button"
          onClick={() => void (available && window.robot.moveMouse(200, 200))}
          disabled={!available}
          className="inline-flex items-center gap-2 rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <MousePointer2 className="h-4 w-4" />
          Move mouse to 200, 200
        </button>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <input
          value={typedText}
          onChange={(event) => setTypedText(event.target.value)}
          placeholder="Text to type"
          className="rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-900"
        />
        <button
          type="button"
          onClick={() => void (available && typedText && window.robot.typeString(typedText))}
          disabled={!available || !typedText}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Keyboard className="h-4 w-4" />
          Type
        </button>
      </section>
    </div>
  );
}

export default Dashboard;
