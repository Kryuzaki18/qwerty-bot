import { useEffect, useState } from 'react';
import { Moon, Power, Sun } from 'lucide-react';
import { THEME_TOGGLE_ARIA_LABELS } from '../constants/theme.constant';
import { useThemeStore } from '../store/useThemeStore';
import ForceCloseDialog from './ForceCloseDialog';

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps): React.JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';
  const [isForceCloseOpen, setIsForceCloseOpen] = useState(false);

  useEffect(() => {
    return window.appWindow.onRequestForceQuit(() => setIsForceCloseOpen(true));
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={THEME_TOGGLE_ARIA_LABELS[theme]}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setIsForceCloseOpen(true)}
          aria-label="Force close qwerty-bot"
          title="Force close"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-red-100 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <Power className="h-4 w-4" />
        </button>
      </div>

      <ForceCloseDialog
        open={isForceCloseOpen}
        onCancel={() => setIsForceCloseOpen(false)}
        onConfirm={() => void window.appWindow.forceQuit()}
      />
    </header>
  );
}

export default Header;
