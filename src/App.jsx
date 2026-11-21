import { useState } from 'react';
import Boot from './components/Boot';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MissionProvider } from './store';
import Layout from './components/Layout';
import { Empty } from './components/ui';
import Overview from './pages/Overview';
import Explorer from './pages/Explorer';
import Navigation from './pages/Navigation';
import Hazards from './pages/Hazards';
import Simulation from './pages/Simulation';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  const [boot, setBoot] = useState(true);
  return (
    <MissionProvider>
      {boot && <Boot onDone={() => setBoot(false)} />}
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="terrain" element={<Explorer />} />
            <Route path="navigation" element={<Navigation />} />
            <Route path="hazards" element={<Hazards />} />
            <Route path="simulation" element={<Simulation />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Empty text="Page not found. Use the sidebar to return to a mission view." />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MissionProvider>
  );
}
