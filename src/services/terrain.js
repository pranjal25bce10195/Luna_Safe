// Procedural lunar terrain. 1 world unit = 20 m. Replace with DEM data from the backend later.
export const SIZE = 100, N = 100, UNIT_M = 20;
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const far = (p, m) => Math.hypot(p.x + 40, p.z - 40) > p.r + m && Math.hypot(p.x - 40, p.z + 40) > p.r + m; // keep default start/dest clear

export const CRATERS = Array.from({ length: 22 }, () => ({ x: (rnd() - 0.5) * 80, z: (rnd() - 0.5) * 80, r: 4 + rnd() * 8 })).filter((c) => far(c, 5)).slice(0, 14);
export const ROCKS = Array.from({ length: 40 }, () => ({ x: (rnd() - 0.5) * 90, z: (rnd() - 0.5) * 90, r: 0.8 + rnd() * 1.2 })).filter((c) => far(c, 3)).slice(0, 26);
export const HAZARDS = [...CRATERS.map((c) => ({ type: 'Crater', ...c })), ...ROCKS.map((c) => ({ type: 'Rock', ...c }))];

export function height(x, z) {
  let h = 3 * Math.sin(x * 0.05) * Math.cos(z * 0.04) + 1.5 * Math.sin(x * 0.13 + z * 0.09) + 0.6 * Math.sin(x * 0.4) * Math.cos(z * 0.37);
  for (const c of CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z) / c.r;
    if (d < 1) h -= (1 - d * d) * c.r * 0.35;
    else if (d < 1.4) h += Math.exp(-((d - 1.1) ** 2) * 30) * c.r * 0.12;
  }
  return h;
}
export function slopeDeg(x, z) {
  const dx = (height(x + 1, z) - height(x - 1, z)) / 2, dz = (height(x, z + 1) - height(x, z - 1)) / 2;
  return (Math.atan(Math.hypot(dx, dz)) * 180) / Math.PI;
}
export const classify = (s) => (s < 12 ? 0 : s < 22 ? 1 : 2); // 0 safe, 1 caution, 2 danger
export function terrainSplit() {
  const c = [0, 0, 0];
  for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) c[classify(slopeDeg((i / 40 - 0.5) * SIZE, (j / 40 - 0.5) * SIZE))]++;
  return c.map((v) => Math.round(v / 16));
}
