import { useEffect, useRef } from 'react';
import { SIZE, slopeDeg, classify, CRATERS } from '../services/terrain';
import { useMission } from '../store';
import { GHOST } from './ui';

const R = 100, COL = [[40, 150, 80], [170, 140, 30], [170, 45, 45]];
let cache;
function base() {
  if (cache) return cache;
  const c = document.createElement('canvas'); c.width = c.height = R;
  const x = c.getContext('2d'), im = x.createImageData(R, R);
  for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
    const s = slopeDeg((i / R - 0.5) * SIZE, (j / R - 0.5) * SIZE), k = COL[classify(s)], n = 0.55 + Math.min(1, s / 30) * 0.35;
    im.data.set([k[0] * n, k[1] * n, k[2] * n, 255], (j * R + i) * 4);
  }
  x.putImageData(im, 0, 0);
  return (cache = c);
}

export default function MiniMap({ onPick }) {
  const ref = useRef();
  const { route, pos, params, obstacles, ghosts } = useMission();
  const W = 300, P = (v) => (v / SIZE + 0.5) * W;
  useEffect(() => {
    const x = ref.current.getContext('2d');
    x.imageSmoothingEnabled = false; x.drawImage(base(), 0, 0, W, W);
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1;
    CRATERS.forEach((c) => { x.beginPath(); x.arc(P(c.x), P(c.z), (c.r / SIZE) * W, 0, 7); x.stroke(); });
    const line = (pts, col, w) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(P(p.x), P(p.z)) : x.moveTo(P(p.x), P(p.z)))); x.stroke(); };
    ghosts.forEach((g) => line(g.path, GHOST[g.priority], 1.5));
    if (route) line(route.path, '#22d3ee', 3);
    obstacles.forEach((o) => { x.fillStyle = 'rgba(255,50,70,.75)'; x.beginPath(); x.arc(P(o.x), P(o.z), (o.r / SIZE) * W, 0, 7); x.fill(); });
    [[params.start, '#39ff88', 5], [params.dest, '#ff3355', 5], [pos, '#fff', 4]].forEach(([p, c, r]) => { x.fillStyle = c; x.beginPath(); x.arc(P(p.x), P(p.z), r, 0, 7); x.fill(); });
  }, [route, pos, params, obstacles, ghosts]);
  const click = (e) => { if (!onPick) return; const b = e.currentTarget.getBoundingClientRect(); onPick(((e.clientX - b.left) / b.width - 0.5) * SIZE, ((e.clientY - b.top) / b.height - 0.5) * SIZE, e.shiftKey); };
  return <canvas ref={ref} width={W} height={W} onClick={click} className={`w-full rounded-lg border border-cyan-400/20 ${onPick ? 'cursor-crosshair' : ''}`} />;
}
