import { FileText, LayoutDashboard, MapPin, Settings, type LucideIcon } from 'lucide-react';
import type { Page } from '../types/nav';

export const PAGES = ['Dashboard', 'Locations', 'Logs', 'Settings'] as const;

export const PAGE_ICONS: Record<Page, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Locations: MapPin,
  Logs: FileText,
  Settings: Settings,
};
