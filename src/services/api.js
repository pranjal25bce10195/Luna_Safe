// Central API layer. Every function mirrors a planned FastAPI endpoint and returns the same shape in mock mode.
import { planRoute, DEFAULT_PARAMS } from './pathfinding';
import { CRATERS, ROCKS, terrainSplit } from './terrain';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, path, body, mock, delay = 600) {
  if (USE_MOCK) { await wait(delay); return mock(body); }
  const isForm = body instanceof FormData;
  const res = await fetch(API_BASE + path, { method, headers: isForm || !body ? {} : { 'Content-Type': 'application/json' }, body: isForm ? body : body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${method} ${path} failed (${res.status})`);
  return res.json();
}

export const analyzeTerrain = (region = {}) => call('POST', '/api/terrain/analyze', region, () => ({ split: terrainSplit(), craters: CRATERS.length, rocks: ROCKS.length }));
export const generateRoute = (p) => call('POST', '/api/navigation/generate-route', p, planRoute);
export const rerouteMission = (p) => call('POST', '/api/mission/reroute', p, planRoute, 900);
export const startMission = (p) => call('POST', '/api/mission/start', p, () => ({ missionId: 'LS-2027-001', status: 'ACTIVE' }));
export const getMissionStatus = () => call('GET', '/api/mission/status', null, () => ({ missionId: 'LS-2027-001', status: 'ACTIVE' }));

export const compareStrategies = (p) => call('POST', '/api/navigation/compare', p, (b) => ['safety', 'distance', 'energy'].flatMap((priority) => { try { return [{ priority, ...planRoute({ ...b, priority, obstacles: [] }) }]; } catch { return []; } }), 150);

const CATS = ['Crater', 'Large rock', 'Steep slope', 'Uneven terrain'];
export function detectHazards(file) {
  const fd = new FormData(); fd.append('image', file);
  return call('POST', '/api/hazards/detect', fd, () => {
    let s = (file.size % 9973) + 1;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return { simulated: true, detections: Array.from({ length: 4 + Math.floor(r() * 4) }, (_, i) => ({ id: i + 1, category: CATS[Math.floor(r() * 4)], confidence: +(0.72 + r() * 0.26).toFixed(2), box: { x: r() * 65, y: r() * 60, w: 12 + r() * 20, h: 12 + r() * 20 } })) };
  }, 1800);
}

export const getAnalytics = () => call('GET', '/api/analytics', null, () => {
  const run = (priority) => planRoute({ ...DEFAULT_PARAMS, priority });
  const safe = run('safety'), short = run('distance'), en = run('energy');
  return {
    comparison: [['Shortest', short], ['Energy', en], ['Safest', safe]].map(([name, r]) => ({ name, distance: r.metrics.distanceKm, battery: r.metrics.batteryPct, safety: r.metrics.safety })),
    battery: Array.from({ length: 11 }, (_, i) => ({ progress: i * 10, safest: +(100 - (safe.metrics.batteryPct * i) / 10).toFixed(1), shortest: +(100 - (short.metrics.batteryPct * i) / 10).toFixed(1), minutes: Math.round((safe.metrics.timeMin * i) / 10) })),
    hazards: [{ type: 'Craters', count: CRATERS.length }, { type: 'Large rocks', count: ROCKS.length }, { type: 'Steep slopes', count: 19 }, { type: 'Uneven', count: 11 }],
    split: terrainSplit(), safe: safe.metrics,
  };
});
