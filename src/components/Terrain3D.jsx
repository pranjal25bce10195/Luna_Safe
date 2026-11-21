import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { SIZE, N, height, slopeDeg, classify, ROCKS, CRATERS } from '../services/terrain';
import { useMission } from '../store';
import { GHOST } from './ui';

const TINT = [[0.2, 1, 0.5], [1, 0.8, 0.1], [1, 0.2, 0.2]];
const roverV = new THREE.Vector3(), tmp = new THREE.Vector3(), off = new THREE.Vector3();

function Surface({ overlay }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, N, N);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, col = [], k = overlay ? 0.45 : 0;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      p.setY(i, height(x, z) + 0.12 * Math.sin(x * 3.1) * Math.sin(z * 2.7));
      const n = 0.5 + 0.12 * Math.sin(x * 1.7) * Math.sin(z * 2.1) + 0.07 * Math.sin(x * 5 + z * 3);
      const t = TINT[classify(slopeDeg(x, z))];
      col.push(n * (1 - k) + t[0] * k * n, n * (1 - k) + t[1] * k * n, n * (1 - k) + t[2] * k * n);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [overlay]);
  return <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={1} flatShading /></mesh>;
}

function Earth() {
  const r = useRef();
  useFrame((_, d) => { r.current.rotation.y += d * 0.05; });
  return (
    <group position={[-130, 95, -170]}>
      <mesh ref={r}><sphereGeometry args={[16, 48, 48]} /><meshStandardMaterial color="#2f6fe0" emissive="#0b2a6b" emissiveIntensity={0.7} roughness={0.8} /></mesh>
      <mesh><sphereGeometry args={[17.8, 48, 48]} /><meshBasicMaterial color="#60a5fa" transparent opacity={0.18} side={THREE.BackSide} /></mesh>
    </group>
  );
}

function Rover() {
  const { pos, route, idx } = useMission();
  const g = useRef(), ring = useRef();
  useFrame(({ clock }, d) => {
    tmp.set(pos.x, height(pos.x, pos.z) + 0.9, pos.z);
    g.current.position.lerp(tmp, Math.min(1, d * 6));
    const nx = route?.path[Math.min(idx + 1, route.path.length - 1)];
    if (nx && (nx.x !== pos.x || nx.z !== pos.z)) g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, Math.atan2(nx.x - pos.x, nx.z - pos.z), 0.1);
    roverV.copy(g.current.position);
    const t = (clock.elapsedTime % 2) / 2;
    ring.current.scale.setScalar(1 + t * 8); ring.current.material.opacity = 0.5 * (1 - t);
  });
  return (
    <group ref={g} position={[pos.x, height(pos.x, pos.z) + 0.9, pos.z]}>
      <mesh><boxGeometry args={[1.8, 0.7, 2.8]} /><meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[0, 0.65, -0.2]}><boxGeometry args={[2.8, 0.08, 1.5]} /><meshStandardMaterial color="#1e3a8a" emissive="#1d4ed8" emissiveIntensity={0.5} /></mesh>
      {[[-1.1, 1], [1.1, 1], [-1.1, -1], [1.1, -1]].map(([x, z], i) => (<mesh key={i} position={[x, -0.3, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.5, 0.5, 0.4, 14]} /><meshStandardMaterial color="#374151" /></mesh>))}
      <mesh position={[0, 1.2, 0.8]}><cylinderGeometry args={[0.06, 0.06, 1, 6]} /><meshStandardMaterial color="#9ca3af" /></mesh>
      <mesh position={[0, 1.75, 0.8]}><sphereGeometry args={[0.22, 12, 12]} /><meshBasicMaterial color="#22d3ee" /></mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}><ringGeometry args={[0.9, 1, 48]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function Beacon({ p, color, beam }) {
  const r = useRef();
  useFrame(({ clock }) => { const t = (clock.elapsedTime % 1.5) / 1.5; r.current.scale.setScalar(1 + t * 5); r.current.material.opacity = 0.7 * (1 - t); });
  return (
    <group position={[p.x, height(p.x, p.z), p.z]}>
      {beam && <mesh position={[0, 15, 0]}><cylinderGeometry args={[0.15, 0.15, 30, 8]} /><meshBasicMaterial color={color} transparent opacity={0.5} /></mesh>}
      <mesh position={[0, 1.2, 0]}><coneGeometry args={[0.9, 2.4, 10]} /><meshBasicMaterial color={color} /></mesh>
      <mesh ref={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}><ringGeometry args={[1.6, 2, 48]} /><meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function CraterRings() {
  const rings = useMemo(() => CRATERS.map((c) => Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2, x = c.x + Math.cos(a) * c.r * 1.15, z = c.z + Math.sin(a) * c.r * 1.15; return [x, height(x, z) + 0.6, z]; })), []);
  return rings.map((pts, i) => <Line key={i} points={pts} color="#ffb020" lineWidth={1.2} transparent opacity={0.7} />);
}

function Rig({ view }) {
  const c = useThree((s) => s.controls), cam = useThree((s) => s.camera);
  useEffect(() => {
    if (!c) return;
    if (view === 'top') { cam.position.set(0, 150, 0.1); c.target.set(0, 0, 0); }
    else if (view === 'orbit') { cam.position.set(70, 55, 70); c.target.set(0, 0, 0); }
    else { cam.position.set(roverV.x + 14, roverV.y + 9, roverV.z + 14); c.target.copy(roverV); }
    c.update();
  }, [view, c]);
  useFrame(() => { if (view === 'follow' && c) { off.copy(cam.position).sub(c.target); c.target.lerp(roverV, 0.1); cam.position.copy(c.target).add(off); } });
  return null;
}

const toPts = (path) => path.map((p) => [p.x, height(p.x, p.z) + 1, p.z]);

export default function Terrain3D({ h = '420px', ghosts = false }) {
  const { route, pos, params, obstacles, settings, idx, ghosts: G, view, setView } = useMission();
  const done = route ? route.path.slice(0, idx + 1) : [], rest = route ? route.path.slice(idx) : [];
  return (
    <div style={{ height: h }} className="relative overflow-hidden rounded-xl border border-cyan-400/15 bg-black">
      <div className="absolute right-2 top-2 z-10 flex gap-1">
        {['orbit', 'follow', 'top'].map((v) => <button key={v} onClick={() => setView(v)} className={`rounded px-2 py-1 text-[11px] ${view === v ? 'bg-neon text-black' : 'bg-black/60 text-cyan-200 hover:bg-black'}`}>{v}</button>)}
      </div>
      <div className="pointer-events-none absolute bottom-2 left-3 z-10 font-mono text-[11px] text-cyan-200">X {(pos.x * 0.02).toFixed(2)} km · Z {(pos.z * 0.02).toFixed(2)} km · slope {slopeDeg(pos.x, pos.z).toFixed(1)}°</div>
      <Canvas camera={{ position: [70, 55, 70], fov: 50 }}>
        <fog attach="fog" args={['#05080f', 140, 340]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[-60, 25, 30]} intensity={2.4} color="#fff4e0" />
        {settings.stars && <Stars radius={220} depth={60} count={3000} factor={5} fade />}
        <Earth />
        <Sparkles count={70} scale={[100, 10, 100]} position={[0, 6, 0]} size={1.6} speed={0.2} color="#cbd5e1" />
        <Surface overlay={settings.overlay} />
        {settings.overlay && <CraterRings />}
        {ROCKS.map((r, i) => (<mesh key={i} position={[r.x, height(r.x, r.z) + r.r * 0.4, r.z]}><dodecahedronGeometry args={[r.r * 0.8]} /><meshStandardMaterial color="#8a8a8a" flatShading /></mesh>))}
        {obstacles.map((o, i) => (<mesh key={i} position={[o.x, height(o.x, o.z) + 1.5, o.z]}><cylinderGeometry args={[o.r, o.r, 3, 16]} /><meshBasicMaterial color="#ff3344" transparent opacity={0.55} /></mesh>))}
        {ghosts && G.map((g) => <Line key={g.priority} points={toPts(g.path)} color={GHOST[g.priority]} lineWidth={1.5} transparent opacity={0.55} />)}
        {rest.length > 1 && <Line points={toPts(rest)} color="#22d3ee" lineWidth={3} dashed dashSize={1.2} gapSize={0.6} />}
        {done.length > 1 && <Line points={toPts(done)} color="#39ff88" lineWidth={4} />}
        <Beacon p={params.start} color="#39ff88" />
        <Beacon p={params.dest} color="#ff3355" beam />
        <Rover />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={8} maxDistance={200} />
        <Rig view={view} />
      </Canvas>
    </div>
  );
}
