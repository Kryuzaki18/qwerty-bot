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

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

function StatCard({ label, value, hint }: StatCardProps): React.JSX.Element {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-lg font-medium">{value}</p>
      {hint !== undefined && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      )}
    </div>
  );
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

  const stats: StatCardProps[] = [
    {
      label: 'Screen size',
      value: screenSize ? `${screenSize.width} x ${screenSize.height}` : '—',
    },
    {
      label: 'CPU',
      value: systemInfo ? systemInfo.cpuModel : '—',
      hint: systemInfo ? `${systemInfo.cpuCores} core(s)` : '',
    },
    {
      label: 'RAM',
      value:
        systemInfo && usedMemory !== null
          ? `${formatBytes(usedMemory)} / ${formatBytes(systemInfo.totalMemory)}`
          : '—',
    },
    { label: 'GPU', value: systemInfo ? systemInfo.gpu : '—' },
    {
      label: 'OS',
      value: systemInfo ? `${systemInfo.platform} ${systemInfo.osVersion}` : '—',
      hint: systemInfo?.arch ?? '',
    },
    { label: 'Hostname', value: systemInfo ? systemInfo.hostname : '—' },
    { label: 'Uptime', value: systemInfo ? formatUptime(systemInfo.uptime) : '—' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {available === false && (
        <p className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          Automation is unavailable on this platform — nut.js failed to load its native binding.
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
