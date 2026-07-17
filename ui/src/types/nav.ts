export const PAGES = ['Dashboard', 'Locations', 'Logs', 'Settings'] as const;

export type Page = (typeof PAGES)[number];
