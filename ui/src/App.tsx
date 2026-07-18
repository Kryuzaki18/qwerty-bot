import { useEffect, useState } from 'react';
import Header from './commons/Header';
import Sidebar from './commons/Sidebar';
import type { Page } from './types/nav';
import { DEFAULT_PAGE, PAGE_COMPONENTS } from './constants/nav.constant';
import { useThemeStore } from './store/useThemeStore';

function App(): React.JSX.Element {
  const [activePage, setActivePage] = useState<Page>(DEFAULT_PAGE);
  const theme = useThemeStore((state) => state.theme);
  const PageComponent = PAGE_COMPONENTS[activePage];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={activePage} />
        <main className="flex-1 overflow-y-auto p-8">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}

export default App;
