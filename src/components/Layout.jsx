import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Mountain, Route as RouteIcon, ScanSearch, PlayCircle, BarChart3, Settings as Cog, Moon, Wifi, User, Menu, X, Bot } from 'lucide-react';
import { useMission } from '../store';

const NAV = [['/', 'Mission Overview', LayoutDashboard], ['/terrain', 'Lunar Terrain Explorer', Mountain], ['/navigation', 'Rover Navigation', RouteIcon], ['/hazards', 'AI Hazard Detection', ScanSearch], ['/simulation', 'Mission Simulation', PlayCircle], ['/analytics', 'Analytics & Reports', BarChart3], ['/settings', 'Settings', Cog]];

export default function Layout() {
  const { status, toast } = useMission();
  const [open, setOpen] = useState(false);
  const [s, setS] = useState(0);
  useEffect(() => { const i = setInterval(() => setS((x) => x + 1), 1000); return () => clearInterval(i); }, []);
  const T = 'T+' + [s / 3600, (s / 60) % 60, s % 60].map((v) => String(Math.floor(v)).padStart(2, '0')).join(':');
  return (
    <div className="flex min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-cyan-400/10 bg-ink/95 p-4 transition-transform md:static md:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center gap-2 text-neon"><Moon size={22} /><span className="font-mono text-lg font-bold tracking-widest">LUNA-SAFE</span></div>
        <nav className="space-y-1">
          {NAV.map(([to, label, I]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-neon/10 text-neon' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <I size={17} />{label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-cyan-400/10 bg-ink/80 px-4 py-3 text-xs backdrop-blur">
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
          <span className="font-mono font-bold text-neon">LUNA-SAFE</span>
          <span className="font-mono text-slate-300">Mission ID: LS-2027-001</span>
          <span className="flex items-center gap-1 text-cyan-300" title="Telemetry is simulated; no backend connected"><Wifi size={14} />Simulated link</span>
          <span className="font-mono text-slate-300">{T}</span>
          <span className="flex items-center gap-1 text-slate-300"><Bot size={14} />Rover: <b className="text-neon">{status}</b></span>
          <span className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-cyan-400/30 text-cyan-200" title="Mission operator"><User size={15} /></span>
        </header>
        <main className="space-y-4 p-4"><Outlet /></main>
      </div>
      {toast && <div role="status" className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-xl ${toast.level === 'warn' ? 'border-yellow-400/50 bg-yellow-950/90 text-yellow-100' : 'border-cyan-400/50 bg-slate-900/95'}`}>{toast.m}</div>}
    </div>
  );
}
