import { createContext, useContext, useEffect, useState } from 'react';
import * as api from './services/api';
import { DEFAULT_PARAMS } from './services/pathfinding';
import { slopeDeg } from './services/terrain';

const Ctx = createContext();
export const useMission = () => useContext(Ctx);

export function MissionProvider({ children }) {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [settings, setSettings] = useState({ rover: 'LS-Rover 1', capacity: 2400, sensitivity: 'medium', overlay: true, stars: true });
  const [route, setRoute] = useState(null);
  const [obstacles, setObstacles] = useState([]);
  const [idx, setIdx] = useState(0);
  const [battery, setBattery] = useState(100);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('STANDBY');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([{ t: '--:--:--', m: 'Mission LS-2027-001 initialised', level: 'info' }]);
  const [toast, setToast] = useState(null);
  const [ghosts, setGhosts] = useState([]);
  const [view, setView] = useState('orbit');
  const [hist, setHist] = useState([]);

  const add = (m, level = 'info') => {
    setLog((l) => [{ t: new Date().toLocaleTimeString([], { hour12: false }), m, level }, ...l].slice(0, 40));
    if (level !== 'info') { setToast({ m, level }); setTimeout(() => setToast(null), 3500); }
  };
  const pos = route ? route.path[Math.min(idx, route.path.length - 1)] : params.start;
  const progress = route ? Math.round((idx / (route.path.length - 1)) * 100) : 0;

  const generate = async (p = params) => {
    setBusy(true); setError(null); setRunning(false);
    try {
      const r = await api.generateRoute({ ...p, obstacles: [] });
      setRoute(r); setObstacles([]); setIdx(0); setHist([]); api.compareStrategies({ ...p }).then(setGhosts).catch(() => {}); setBattery(p.battery); setStatus('ROUTE READY');
      add(`Route generated (${p.priority}): ${r.metrics.distanceKm} km, safety ${r.metrics.safety}`);
      if (!r.metrics.feasible) add('Route needs more battery than available', 'warn');
    } catch (e) { setError(e.message); setStatus('ROUTE FAILED'); add(e.message, 'warn'); }
    finally { setBusy(false); }
  };

  const reroute = async (obs = obstacles) => {
    if (!route) return;
    setRunning(false); setStatus('REROUTING'); setBusy(true);
    try {
      const r = await api.rerouteMission({ ...params, start: pos, obstacles: obs });
      setRoute(r); setIdx(0); setStatus('REROUTED'); setRunning(true);
      add(`Alternative route ready: ${r.metrics.distanceKm} km remaining`);
    } catch (e) { setStatus('REROUTE FAILED'); add(e.message, 'warn'); }
    finally { setBusy(false); }
  };

  const addObstacle = () => {
    if (!route) return;
    const p = route.path[Math.min(idx + 8, route.path.length - 2)];
    const obs = [...obstacles, { x: p.x, z: p.z, r: 3.5 }];
    setObstacles(obs); setStatus('OBSTACLE DETECTED');
    add('New obstacle detected ahead. Generating alternative route.', 'warn');
    setTimeout(() => reroute(obs), 800);
  };

  const start = () => { if (!route) return; if (idx >= route.path.length - 1) setIdx(0); setRunning(true); setStatus('EN ROUTE'); api.startMission(params).catch(() => {}); add('Rover traverse started'); };
  const pause = () => { setRunning(false); setStatus('PAUSED'); add('Traverse paused'); };
  const reset = () => { setRunning(false); setHist([]); setIdx(0); setBattery(params.battery); setObstacles([]); setStatus(route ? 'ROUTE READY' : 'STANDBY'); add('Mission reset'); };
  const drain = () => { setBattery((b) => Math.max(0, b - 15)); add('Battery drain simulated (-15%)', 'warn'); };

  useEffect(() => {
    if (!running || !route) return;
    const id = setInterval(() => {
      setIdx((i) => Math.min(i + 1, route.path.length - 1));
      setBattery((b) => Math.max(0, b - route.metrics.batteryPct / route.path.length));
    }, 350);
    return () => clearInterval(id);
  }, [running, route]);
  useEffect(() => { if (route && running && idx >= route.path.length - 1) { setRunning(false); setStatus('ARRIVED'); add('Destination reached'); } }, [idx, route, running]);
  useEffect(() => { if (running && battery <= 0) { setRunning(false); setStatus('BATTERY DEPLETED'); add('Battery depleted. Rover halted.', 'warn'); } }, [battery, running]);

  useEffect(() => { if (running) setHist((h) => [...h.slice(-59), { b: +battery.toFixed(1), s: +slopeDeg(pos.x, pos.z).toFixed(1) }]); }, [idx]);

  return (
    <Ctx.Provider value={{ params, setParams, settings, setSettings, route, obstacles, idx, pos, progress, battery, running, status, busy, error, log, toast, ghosts, view, setView, hist, generate, reroute, addObstacle, start, pause, reset, drain, add }}>
      {children}
    </Ctx.Provider>
  );
}
