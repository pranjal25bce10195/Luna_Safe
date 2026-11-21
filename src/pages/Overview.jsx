import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { TriangleAlert } from 'lucide-react';
import { useMission } from '../store';
import { Card, Gauge, Btn } from '../components/ui';
import Terrain3D from '../components/Terrain3D';
import MiniMap from '../components/MiniMap';
import Copilot from '../components/Copilot';
import { HAZARDS } from '../services/terrain';

const Spark = ({ data, k, color, label, unit }) => (
  <Card>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="font-mono text-lg" style={{ color }}>{data.length ? data[data.length - 1][k] : '—'}{unit}</p>
    <div className="h-16">{data.length > 1 ? <ResponsiveContainer><AreaChart data={data}><YAxis hide domain={[0, 'auto']} /><Area dataKey={k} stroke={color} fill={color + '33'} isAnimationActive={false} dot={false} /></AreaChart></ResponsiveContainer> : <p className="pt-4 text-xs text-slate-500">Start the simulation to stream telemetry.</p>}</div>
  </Card>
);

export default function Overview() {
  const { route, pos, battery, status, progress, log, hist } = useMission();
  const m = route?.metrics;
  const alerts = log.filter((l) => l.level === 'warn').slice(0, 4);
  return (
    <>
      <div className="relative">
        <Terrain3D h="540px" />
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-xs">
          <p className="font-mono text-[11px] text-cyan-300">MISSION LS-2027-001</p>
          <h1 className="text-2xl font-bold leading-tight text-white">Lunar south pole traverse</h1>
          <p className="mt-1 flex items-center gap-2 text-xs"><i className="h-2 w-2 animate-pulse rounded-full bg-neon" />{status}</p>
        </div>
        {!route && <div className="absolute inset-x-0 bottom-12 z-10 grid place-items-center"><Link to="/navigation"><Btn>Plan a route</Btn></Link></div>}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Mission gauges"><div className="flex justify-around"><Gauge v={battery} label="Battery" color={battery < 20 ? '#ff4d4d' : '#39ff88'} /><Gauge v={progress} label="Completion" color="#22d3ee" /><Gauge v={m ? m.safety : 0} label="Safety score" color="#facc15" /></div></Card>
        <Card title="Tactical map"><MiniMap /></Card>
        <Copilot />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Spark data={hist} k="b" color="#39ff88" label="Battery stream" unit="%" />
        <Spark data={hist} k="s" color="#facc15" label="Terrain slope under rover" unit="°" />
        <Card><p className="text-xs text-slate-400">Key numbers</p><p className="mt-1 font-mono text-sm leading-6">Distance {m ? m.distanceKm + ' km' : '—'}<br />Hazards mapped {HAZARDS.length}<br />Position {(pos.x * 0.02).toFixed(2)}, {(pos.z * 0.02).toFixed(2)} km</p></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Hazard alerts" icon={TriangleAlert}>{alerts.length ? alerts.map((a, i) => <p key={i} className="border-b border-slate-800 py-1.5 text-xs text-yellow-200">{a.t} · {a.m}</p>) : <p className="text-xs text-slate-400">No active alerts.</p>}</Card>
        <Card title="Mission activity"><ul className="max-h-40 space-y-2 overflow-auto">{log.map((l, i) => <li key={i} className="flex gap-3 text-xs"><span className="font-mono text-slate-500">{l.t}</span><span className={l.level === 'warn' ? 'text-yellow-200' : ''}>{l.m}</span></li>)}</ul></Card>
      </div>
    </>
  );
}
