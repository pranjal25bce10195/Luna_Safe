// Local A* planner. Isolated here so it can be replaced by the Python backend's A*.
import { SIZE, UNIT_M, slopeDeg, classify, ROCKS, HAZARDS } from './terrain';

export const DEFAULT_PARAMS = { start: { x: -40, z: 40 }, dest: { x: 40, z: -40 }, battery: 100, maxSlope: 20, priority: 'safety' };
const G = 50, CELL = SIZE / G;
const toW = (i) => (i - G / 2 + 0.5) * CELL;
const toC = (w) => Math.min(G - 1, Math.max(0, Math.floor(w / CELL + G / 2)));
let slopes;
const S = () => slopes || (slopes = Array.from({ length: G * G }, (_, k) => slopeDeg(toW(k % G), toW(Math.floor(k / G)))));

export function planRoute({ start, dest, maxSlope, priority, obstacles = [], battery = 100 }) {
  const s = S();
  const blocks = [...ROCKS.map((r) => ({ ...r, r: r.r + 1.2 })), ...obstacles];
  const blocked = (k) => { const x = toW(k % G), z = toW(Math.floor(k / G)); return s[k] > maxSlope || blocks.some((b) => Math.hypot(x - b.x, z - b.z) < b.r); };
  const cost = (k) => (priority === 'distance' ? 1 : priority === 'energy' ? 1 + s[k] * 0.25 : 1 + (s[k] * s[k]) / 25 + classify(s[k]) * 4);
  const sk = toC(start.z) * G + toC(start.x), gk = toC(dest.z) * G + toC(dest.x);
  const h = (k) => Math.hypot((k % G) - (gk % G), Math.floor(k / G) - Math.floor(gk / G));
  const g = new Map([[sk, 0]]), f = new Map([[sk, h(sk)]]), prev = new Map(), closed = new Set(), open = [sk];
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (f.get(open[i]) < f.get(open[bi])) bi = i;
    const c = open.splice(bi, 1)[0];
    if (c === gk) break;
    closed.add(c);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const nx = (c % G) + dx, ny = Math.floor(c / G) + dy, n = ny * G + nx;
      if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= G || ny >= G || closed.has(n) || (n !== gk && blocked(n))) continue;
      const ng = g.get(c) + Math.hypot(dx, dy) * cost(n);
      if (ng < (g.get(n) ?? Infinity)) { g.set(n, ng); prev.set(n, c); f.set(n, ng + h(n)); if (!open.includes(n)) open.push(n); }
    }
  }
  if (sk !== gk && !prev.has(gk)) throw new Error('No traversable route found. Raise the maximum slope or move the start/destination.');
  const cells = [gk];
  while (cells[0] !== sk) cells.unshift(prev.get(cells[0]));
  const path = cells.map((k) => ({ x: toW(k % G), z: toW(Math.floor(k / G)) }));
  path[0] = { ...start }; path[path.length - 1] = { ...dest };
  let len = 0, sum = 0, peak = 0;
  path.forEach((p, i) => { if (i) len += Math.hypot(p.x - path[i - 1].x, p.z - path[i - 1].z); const sl = s[cells[i]]; sum += sl; peak = Math.max(peak, sl); });
  const km = (len * UNIT_M) / 1000, avg = sum / path.length;
  const batteryPct = +(km * 8 * (1 + avg / 30)).toFixed(1);
  const near = HAZARDS.filter((hz) => Math.min(...path.map((p) => Math.hypot(p.x - hz.x, p.z - hz.z))) < 10).length;
  return {
    path,
    metrics: {
      distanceKm: +km.toFixed(2), batteryPct, hazardsAvoided: near, timeMin: Math.round((km / 0.8) * 60),
      safety: Math.round(Math.max(0, 100 - avg * 3 - peak * 1.2)), feasible: batteryPct <= battery,
    },
  };
}
