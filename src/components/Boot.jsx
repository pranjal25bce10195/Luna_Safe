import { useEffect, useState } from 'react';
const L = ['Mission control v0.1', 'Loading lunar elevation model … OK', 'Calibrating hazard classifier (simulated) … OK', 'Starting A* route planner … OK', 'Telemetry link established'];
export default function Boot({ onDone }) {
  const [n, setN] = useState(0);
  useEffect(() => { const id = setInterval(() => setN((x) => x + 1), 400); return () => clearInterval(id); }, []);
  useEffect(() => { if (n > L.length + 1) onDone(); }, [n]);
  return (
    <div onClick={onDone} className="fixed inset-0 z-50 grid cursor-pointer place-items-center bg-ink">
      <div className="w-[min(90vw,28rem)] font-mono text-sm">
        <p className="mb-4 text-3xl font-bold tracking-[.3em] text-neon">LUNA-SAFE</p>
        {L.slice(0, n).map((l) => <p key={l} className="text-cyan-200">&gt; {l}</p>)}
        <div className="mt-4 h-1 bg-slate-800"><div className="h-full bg-neon transition-all duration-300" style={{ width: `${Math.min(100, (n / (L.length + 1)) * 100)}%` }} /></div>
        <p className="mt-3 text-xs text-slate-500">Click to skip</p>
      </div>
    </div>
  );
}
