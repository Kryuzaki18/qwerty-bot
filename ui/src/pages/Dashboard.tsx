import { useEffect, useState } from 'react';
import type { ScreenSize, SystemInfo } from '../../../src/shared/ipc';

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [days && `${days}d`, hours && `${hours}h`, `${minutes}m`].filter(Boolean).join(' ');
}

function Dashboard(): React.JSX.Element {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [screenSize, setScreenSize] = useState<ScreenSize | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  const refresh = async (): Promise<void> => {
    const isAvailable = await window.robot.isAvailable();
    setAvailable(isAvailable);
    if (isAvailable) setScreenSize(await window.robot.getScreenSize());
    setSystemInfo(await window.system.getInfo());
  };

  useEffect(() => {
    void refresh();
  }, []);

  const usedMemory = systemInfo ? systemInfo.totalMemory - systemInfo.freeMemory : null;

  return (
    <div className="flex flex-col gap-6">
      {available === false && (
        <p className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          Automation is unavailable on this platform — nut.js failed to load its native binding.
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Screen size</p>
          <p className="text-lg font-medium">
            {screenSize ? `${screenSize.width} x ${screenSize.height}` : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">CPU</p>
          <p className="text-lg font-medium">{systemInfo ? systemInfo.cpuModel : '—'}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {systemInfo ? `${systemInfo.cpuCores} core(s)` : ''}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">RAM</p>
          <p className="text-lg font-medium">
            {systemInfo && usedMemory !== null
              ? `${formatBytes(usedMemory)} / ${formatBytes(systemInfo.totalMemory)}`
              : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">GPU</p>
          <p className="text-lg font-medium">{systemInfo ? systemInfo.gpu : '—'}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">OS</p>
          <p className="text-lg font-medium">
            {systemInfo ? `${systemInfo.platform} ${systemInfo.osVersion}` : '—'}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{systemInfo?.arch ?? ''}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Hostname</p>
          <p className="text-lg font-medium">{systemInfo ? systemInfo.hostname : '—'}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Uptime</p>
          <p className="text-lg font-medium">{systemInfo ? formatUptime(systemInfo.uptime) : '—'}</p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
