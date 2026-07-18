import { APP_COPYRIGHT, APP_LOGO_ALT, APP_LOGO_SRC, APP_NAME, APP_VERSION } from '../constants/app.constant';
import { NAV_ITEM_ACTIVE_CLASS, NAV_ITEM_INACTIVE_CLASS, PAGE_ICONS, PAGES } from '../constants/nav.constant';
import type { Page } from '../types/nav';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

function Sidebar({ activePage, onNavigate }: SidebarProps): React.JSX.Element {
  return (
    <nav className="flex w-56 flex-col gap-1 border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4 flex items-center gap-2 px-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        <img src={APP_LOGO_SRC} alt={APP_LOGO_ALT} className="h-6 w-6 rounded-md" />
        {APP_NAME}
      </div>
      {PAGES.map((page) => {
        const Icon = PAGE_ICONS[page];
        const isActive = page === activePage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onNavigate(page)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? NAV_ITEM_ACTIVE_CLASS : NAV_ITEM_INACTIVE_CLASS
            }`}
          >
            <Icon className="h-4 w-4" />
            {page}
          </button>
        );
      })}
      <div className="text-center mt-auto px-2 pt-4 text-[10px] text-neutral-600 dark:text-neutral-400">
        <p>{APP_VERSION}</p>
        <p>{APP_COPYRIGHT}</p>
      </div>
    </nav>
  );
}

export default Sidebar;
