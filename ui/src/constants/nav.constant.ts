import { FileText, LayoutDashboard, MapPin, Settings, type LucideIcon } from 'lucide-react';
import type { Page } from '../types/nav';
import Dashboard from '../pages/Dashboard';
import Locations from '../pages/Locations';
import Logs from '../pages/Logs';
import SettingsPage from '../pages/Settings';

export const PAGES = ['Dashboard', 'Locations', 'Logs', 'Settings'] as const;

export const PAGE_ICONS: Record<Page, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Locations: MapPin,
  Logs: FileText,
  Settings: Settings,
};

export const PAGE_COMPONENTS: Record<Page, () => React.JSX.Element> = {
  Dashboard,
  Locations,
  Logs,
  Settings: SettingsPage,
};
