import { useState } from 'react';
import { Upload, ScanSearch } from 'lucide-react';
import { Card, Empty } from '../components/ui';
import { detectHazards } from '../services/api';

const COLOR = { Crater: '#22d3ee', 'Large rock': '#facc15', 'Steep slope': '#ff4d4d', 'Uneven terrain': '#a78bfa' };

export default function Hazards() {
  const [url, setUrl] = useState(null);
  const [res, setRes] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState(null);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return setErr('Unsupported file. Upload a PNG, JPG or WebP image.');
    setErr(null); setRes(null); setUrl(URL.createObjectURL(f)); setScanning(true);
    try { setRes(await detectHazards(f)); } catch (x) { setErr(x.message); } finally { setScanning(false); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Terrain image analysis" icon={ScanSearch} className="lg:col-span-2">
        <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-400/30 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/10">
          <Upload size={14} />Upload lunar image<input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        {err && <p role="alert" className="mb-3 text-sm text-red-300">{err}</p>}
        {url ? (
          <div className="relative overflow-hidden rounded-lg border border-slate-700">
            <img src={url} alt="Uploaded lunar terrain" className="block w-full" />
            {scanning && <div className="scanline" />}
            {res?.detections.map((d) => (
              <div key={d.id} className="absolute border-2" style={{ left: `${d.box.x}%`, top: `${d.box.y}%`, width: `${d.box.w}%`, height: `${d.box.h}%`, borderColor: COLOR[d.category] || '#22d3ee' }}>
                <span className="absolute -top-5 left-0 whitespace-nowrap bg-black/80 px-1 text-[10px]" style={{ color: COLOR[d.category] || '#22d3ee' }}>#{d.id} {d.category} {Math.round(d.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        ) : <Empty icon={Upload} text="Upload a lunar surface image to scan it for hazards." />}
      </Card>
      <Card title="Detections">
        <p className="mb-3 rounded border border-green-400/30 bg-green-950/30 p-2 text-xs text-green-200"> YOLO AI detection service connected. {res?.model && ` Model: ${res.model}`} </p>
        {scanning && <p className="text-sm text-cyan-300">Scanning image…</p>}
        {res && !res.detections.length && <p className="text-sm text-slate-400">No hazards detected.</p>}
        <ul className="space-y-2">{res?.detections.map((d) => (
          <li key={d.id} className="flex justify-between rounded border border-slate-800 px-3 py-2 text-sm"><span style={{ color: COLOR[d.category] }}>#{d.id} {d.category}</span><span className="font-mono">{Math.round(d.confidence * 100)}%</span></li>
        ))}</ul>
        {!res && !scanning && <p className="text-sm text-slate-400">Results appear here after a scan.</p>}
      </Card>
    </div>
  );
}
