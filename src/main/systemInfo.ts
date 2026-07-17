import { app } from 'electron';
import os from 'node:os';
import type { SystemInfo } from '../shared/ipc';

interface GpuDevice {
  deviceString?: string;
  vendorString?: string;
}

interface GpuInfo {
  gpuDevice?: GpuDevice[];
}

async function getGpuDescription(): Promise<string> {
  const gpuInfo = (await app.getGPUInfo('basic').catch(() => null)) as GpuInfo | null;
  const device = gpuInfo?.gpuDevice?.[0];
  return device?.deviceString ?? device?.vendorString ?? 'Unknown GPU';
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const cpus = os.cpus();
  const gpu = await getGpuDescription();

  return {
    platform: os.platform(),
    osVersion: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpuModel: cpus[0]?.model.trim() ?? 'Unknown CPU',
    cpuCores: cpus.length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    gpu,
    uptime: os.uptime(),
  };
}
