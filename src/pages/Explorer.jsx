import { useEffect, useState } from 'react';
import { Card, Legend, Btn } from '../components/ui';
import Terrain3D from '../components/Terrain3D';
import { useMission } from '../store';
import { analyzeTerrain } from '../services/api';

export default function Explorer() {
  const { settings, setSettings } = useMission();
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => { analyzeTerrain().then(setInfo).catch((e) => setErr(e.message)); }, []);
  return (
    <>
      <Card title="Lunar terrain explorer">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Legend />
          <Btn variant="ghost" onClick={() => setSettings({ ...settings, overlay: !settings.overlay })} title="Show or hide hazard colouring">{settings.overlay ? 'Hide' : 'Show'} hazard overlay</Btn>
        </div>
        <Terrain3D h="560px" />
        <p className="mt-2 text-xs text-slate-400">Drag to rotate, scroll to zoom, right-drag to pan. Procedurally generated surface (simulated).</p>
      </Card>
      <Card title="Terrain analysis">
        {err ? <p className="text-sm text-red-300">{err}</p> : !info ? <p className="text-sm text-slate-400">Analysing terrain…</p> : (
          <p className="font-mono text-sm">Safe {info.split[0]}% · Caution {info.split[1]}% · Danger {info.split[2]}% · {info.craters} craters · {info.rocks} large rocks</p>
        )}
      </Card>
    </>
  );
}
