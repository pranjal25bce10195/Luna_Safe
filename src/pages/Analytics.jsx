import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { FileText, Printer } from 'lucide-react';
import { Card, Btn } from '../components/ui';
import { getAnalytics } from '../services/api';

const AX = { stroke: '#64748b', fontSize: 11 };
const TIP = { contentStyle: { background: '#0b1220', border: '1px solid #164e63' } };
const Chart = ({ title, children }) => (<Card title={title}><div className="h-60"><ResponsiveContainer>{children}</ResponsiveContainer></div></Card>);

export default function Analytics() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState(null);
  const load = () => { setErr(null); setD(null); getAnalytics().then(setD).catch((e) => setErr(e.message)); };
  useEffect(load, []);
  if (err) return <Card><p className="text-red-300">{err}</p><Btn className="mt-3" onClick={load}>Retry</Btn></Card>;
  if (!d) return <p className="text-sm text-slate-400">Loading analytics…</p>;
  const pie = [['Safe', '#39ff88'], ['Caution', '#facc15'], ['Danger', '#ff4d4d']].map(([name, c], i) => ({ name, value: d.split[i], c }));
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Battery consumption (%)"><LineChart data={d.battery}><CartesianGrid stroke="#1e293b" /><XAxis dataKey="progress" {...AX} unit="%" /><YAxis {...AX} /><Tooltip {...TIP} /><Legend /><Line dataKey="safest" stroke="#39ff88" dot={false} /><Line dataKey="shortest" stroke="#22d3ee" dot={false} /></LineChart></Chart>
        <Chart title="Route comparison: distance (km)"><BarChart data={d.comparison}><CartesianGrid stroke="#1e293b" /><XAxis dataKey="name" {...AX} /><YAxis {...AX} /><Tooltip {...TIP} /><Legend /><Bar dataKey="distance" fill="#22d3ee" /><Bar dataKey="battery" fill="#facc15" name="battery %" /><Bar dataKey="safety" fill="#39ff88" name="safety score" /></BarChart></Chart>
        <Chart title="Hazards detected"><BarChart data={d.hazards}><CartesianGrid stroke="#1e293b" /><XAxis dataKey="type" {...AX} /><YAxis {...AX} /><Tooltip {...TIP} /><Bar dataKey="count" fill="#a78bfa" /></BarChart></Chart>
        <Chart title="Safe vs unsafe terrain (%)"><PieChart><Pie data={pie} dataKey="value" nameKey="name" outerRadius={85} label>{pie.map((p) => <Cell key={p.name} fill={p.c} />)}</Pie><Tooltip {...TIP} /><Legend /></PieChart></Chart>
        <Chart title="Mission progress over time"><AreaChart data={d.battery}><CartesianGrid stroke="#1e293b" /><XAxis dataKey="minutes" {...AX} unit="m" /><YAxis {...AX} unit="%" /><Tooltip {...TIP} /><Area dataKey="progress" stroke="#22d3ee" fill="#22d3ee33" /></AreaChart></Chart>
        <Card title="Shortest vs safest">
          <table className="w-full text-sm"><thead className="text-left text-xs text-slate-400"><tr><th>Route</th><th>km</th><th>Battery</th><th>Safety</th></tr></thead>
            <tbody className="font-mono">{d.comparison.map((r) => <tr key={r.name} className="border-t border-slate-800"><td>{r.name}</td><td>{r.distance}</td><td>{r.battery}%</td><td>{r.safety}</td></tr>)}</tbody></table>
        </Card>
      </div>
      <Card title="Mission report preview" icon={FileText}>
        <p className="mb-3 text-xs text-yellow-200">Preview only. PDF generation is not implemented; Print uses your browser's save-as-PDF.</p>
        <div className="rounded-lg bg-white p-6 text-sm text-slate-800">
          <h4 className="text-lg font-bold">Mission LS-2027-001: Traverse Report (simulated)</h4>
          <p className="mt-2">Recommended route (maximum safety): {d.safe.distanceKm} km, {d.safe.batteryPct}% battery, safety score {d.safe.safety}/100, {d.safe.hazardsAvoided} hazards avoided, ETA {d.safe.timeMin} min.</p>
          <p className="mt-2">Terrain: {d.split[0]}% safe, {d.split[1]}% caution, {d.split[2]}% dangerous.</p>
        </div>
        <Btn variant="ghost" className="mt-3" onClick={() => window.print()}><Printer size={13} className="mr-1 inline" />Print report</Btn>
      </Card>
    </>
  );
}
