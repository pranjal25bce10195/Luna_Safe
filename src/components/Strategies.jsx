import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { Card, GHOST } from './ui';
import { useMission } from '../store';

const NAME = { safety: 'Safest', distance: 'Shortest', energy: 'Energy-saver' };
export default function Strategies() {
  const { ghosts } = useMission();
  if (!ghosts.length) return <Card title="Strategy comparison"><p className="text-sm text-slate-400">Generate a route to compare the safest, shortest and energy-saving options.</p></Card>;
  const mn = (k) => Math.min(...ghosts.map((g) => g.metrics[k]));
  const axes = [['Safety', (g) => g.metrics.safety], ['Speed', (g) => (100 * mn('timeMin')) / g.metrics.timeMin], ['Energy', (g) => (100 * mn('batteryPct')) / g.metrics.batteryPct], ['Distance', (g) => (100 * mn('distanceKm')) / g.metrics.distanceKm]];
  const data = axes.map(([axis, f]) => ({ axis, ...Object.fromEntries(ghosts.map((g) => [g.priority, Math.round(f(g))])) }));
  return (
    <Card title="Strategy comparison">
      <div className="h-48"><ResponsiveContainer><RadarChart data={data}><PolarGrid stroke="#1e293b" /><PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />{ghosts.map((g) => <Radar key={g.priority} dataKey={g.priority} stroke={GHOST[g.priority]} fill={GHOST[g.priority]} fillOpacity={0.12} />)}<Tooltip contentStyle={{ background: '#0b1220', border: '1px solid #164e63' }} /></RadarChart></ResponsiveContainer></div>
      <table className="mt-2 w-full text-xs"><tbody className="font-mono">{ghosts.map((g) => (
        <tr key={g.priority}><td style={{ color: GHOST[g.priority] }}>● {NAME[g.priority]}</td><td>{g.metrics.distanceKm} km</td><td>{g.metrics.batteryPct}%</td><td>safety {g.metrics.safety}</td></tr>
      ))}</tbody></table>
    </Card>
  );
}
