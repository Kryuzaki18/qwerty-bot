import { FileText, LayoutDashboard, MapPin, Settings, type LucideIcon } from 'lucide-react';
import type { Page } from '../types/nav';
import Dashboard from '../pages/Dashboard';
import Triggers from '../pages/triggers/Triggers';
import Logs from '../pages/Logs';
import SettingsPage from '../pages/Settings';

export const PAGES = ['Dashboard', 'Triggers', 'Logs', 'Settings'] as const;

export const DEFAULT_PAGE: Page = 'Dashboard';

export const NAV_ITEM_ACTIVE_CLASS = 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400';
export const NAV_ITEM_INACTIVE_CLASS = 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100';

export const PAGE_ICONS: Record<Page, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Triggers: MapPin,
  Logs: FileText,
  Settings: Settings,
};

export const PAGE_COMPONENTS: Record<Page, () => React.JSX.Element> = {
  Dashboard,
  Triggers,
  Logs,
  Settings: SettingsPage,
};
