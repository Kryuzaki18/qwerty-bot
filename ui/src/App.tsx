import { useState } from 'react';
import Header from './commons/Header';
import Sidebar from './commons/Sidebar';
import type { Page } from './types/nav';
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import Logs from './pages/Logs';
import Settings from './pages/Settings';

const PAGE_COMPONENTS: Record<Page, () => React.JSX.Element> = {
  Dashboard,
  Locations,
  Logs,
  Settings,
};

function App(): React.JSX.Element {
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const PageComponent = PAGE_COMPONENTS[activePage];

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
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
