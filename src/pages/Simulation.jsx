import { Play, Pause, RotateCcw, OctagonAlert, BatteryWarning, Shuffle, Route as RouteIcon } from 'lucide-react';
import { Card, Btn, Bar, Empty } from '../components/ui';
import Terrain3D from '../components/Terrain3D';
import { useMission } from '../store';
import Copilot from '../components/Copilot';

export default function Simulation() {
  const m = useMission();
  const { route, running, busy, status, battery, progress, log } = m;
  if (!route) return (
    <Empty icon={RouteIcon} text="No route loaded. Generate one to run the simulation.">
      <Btn onClick={() => m.generate()} disabled={busy}>{busy ? 'Computing…' : 'Generate default route'}</Btn>
      {m.error && <p className="text-red-300">{m.error}</p>}
    </Empty>
  );
  const atEnd = status === 'ARRIVED';
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card title="Live traverse" className="xl:col-span-2"><Terrain3D h="500px" /></Card>
      <div className="space-y-4">
        <Card title="Controls">
          <div className="grid grid-cols-2 gap-2">
            {running ? <Btn onClick={m.pause}><Pause size={13} className="mr-1 inline" />Pause</Btn> : <Btn onClick={m.start} disabled={busy || battery <= 0}><Play size={13} className="mr-1 inline" />{progress > 0 && !atEnd ? 'Resume' : 'Start'}</Btn>}
            <Btn variant="ghost" onClick={m.reset}><RotateCcw size={13} className="mr-1 inline" />Reset</Btn>
            <Btn variant="ghost" onClick={m.addObstacle} disabled={busy || atEnd} title="Place an obstacle ahead and trigger rerouting"><OctagonAlert size={13} className="mr-1 inline" />New obstacle</Btn>
            <Btn variant="ghost" onClick={m.drain} title="Remove 15% battery"><BatteryWarning size={13} className="mr-1 inline" />Drain battery</Btn>
            <Btn variant="danger" className="col-span-2" onClick={() => m.reroute()} disabled={busy || atEnd}><Shuffle size={13} className="mr-1 inline" />Emergency reroute</Btn>
          </div>
        </Card>
        <Card title="Telemetry">
          <p className="mb-1 text-xs">Status: <b className="text-neon">{status}{busy && ' …'}</b></p>
          <p className="text-xs text-slate-400">Progress {progress}%</p><Bar v={progress} tone="bg-cyan-400" />
          <p className="mt-3 text-xs text-slate-400">Battery {battery.toFixed(0)}%</p><Bar v={battery} tone={battery < 20 ? 'bg-red-500' : 'bg-neon'} />
        </Card>
        <Copilot /><Card title="Event log"><ul className="max-h-48 space-y-1 overflow-auto text-xs">{log.map((l, i) => <li key={i} className={l.level === 'warn' ? 'text-yellow-200' : ''}><span className="font-mono text-slate-500">{l.t}</span> {l.m}</li>)}</ul></Card>
      </div>
    </div>
  );
}
