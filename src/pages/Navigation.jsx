import { Card, Btn, Field, inputCls, Legend } from '../components/ui';
import Terrain3D from '../components/Terrain3D';
import { useMission } from '../store';
import MiniMap from '../components/MiniMap';
import Strategies from '../components/Strategies';

const PRI = [['safety', 'Maximum safety'], ['distance', 'Minimum distance'], ['energy', 'Energy efficiency']];
const clamp = (v) => Math.max(-48, Math.min(48, Number.isFinite(v) ? v : 0));

export default function Navigation() {
  const { params, setParams, generate, busy, error, route } = useMission();
  const pt = (k, a) => (e) => setParams((p) => ({ ...p, [k]: { ...p[k], [a]: clamp(+e.target.value) } }));
  const m = route?.metrics;
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card title="Route planner">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start X"><input type="number" className={inputCls} value={params.start.x} onChange={pt('start', 'x')} /></Field>
          <Field label="Start Z"><input type="number" className={inputCls} value={params.start.z} onChange={pt('start', 'z')} /></Field>
          <Field label="Destination X"><input type="number" className={inputCls} value={params.dest.x} onChange={pt('dest', 'x')} /></Field>
          <Field label="Destination Z"><input type="number" className={inputCls} value={params.dest.z} onChange={pt('dest', 'z')} /></Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label={`Battery level: ${params.battery}%`}><input type="range" min="10" max="100" className="w-full accent-green-400" value={params.battery} onChange={(e) => setParams({ ...params, battery: +e.target.value })} /></Field>
          <Field label={`Maximum slope: ${params.maxSlope}°`}><input type="range" min="8" max="35" className="w-full accent-green-400" value={params.maxSlope} onChange={(e) => setParams({ ...params, maxSlope: +e.target.value })} /></Field>
          <div className="space-y-1">{PRI.map(([k, l]) => (<label key={k} className="flex items-center gap-2 text-sm"><input type="radio" name="pri" checked={params.priority === k} onChange={() => setParams({ ...params, priority: k })} />{l}</label>))}</div>
          <Btn className="w-full" onClick={() => generate()} disabled={busy}>{busy ? 'COMPUTING ROUTE…' : 'GENERATE SAFE ROUTE'}</Btn>
          {error && <p role="alert" className="rounded border border-red-500/40 bg-red-950/50 p-2 text-xs text-red-200">{error}</p>}
        </div>
      </Card>
      <div className="space-y-4 xl:col-span-2">
        <Card title="Proposed route (cyan) vs alternatives"><Legend /><div className="mt-3"><Terrain3D h="440px" ghosts /></div></Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Tactical map: click sets destination, shift-click sets start"><MiniMap onPick={(x, z, s) => setParams((p) => ({ ...p, [s ? 'start' : 'dest']: { x: Math.round(clamp(x)), z: Math.round(clamp(z)) } }))} /></Card>
          <Strategies />
        </div>
        {m ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[['Distance', m.distanceKm + ' km'], ['Battery use', m.batteryPct + '%'], ['Hazards avoided', m.hazardsAvoided], ['Travel time', Math.floor(m.timeMin / 60) + 'h ' + (m.timeMin % 60) + 'm'], ['Safety score', m.safety + '/100']].map(([l, v]) => (
              <Card key={l}><p className="text-xs text-slate-400">{l}</p><p className="font-mono text-lg text-neon">{v}</p></Card>
            ))}
            {!m.feasible && <p className="col-span-full text-sm text-yellow-300">Warning: this route needs more battery than the level you set.</p>}
          </div>
        ) : <p className="text-sm text-slate-400">Set the parameters and generate a route to see its metrics.</p>}
      </div>
    </div>
  );
}
