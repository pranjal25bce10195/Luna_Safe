import { useEffect, useMemo, useState } from 'react';
import { Bot } from 'lucide-react';
import { Card } from './ui';
import { useMission } from '../store';
import { explain } from '../services/copilot';

const TONE = { info: 'text-slate-200', good: 'text-neon', warn: 'text-yellow-300', bad: 'text-red-400' };
export default function Copilot() {
  const { route, params } = useMission();
  const lines = useMemo(() => (route ? explain(route, params) : []), [route]);
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); const id = setInterval(() => setN((x) => (x >= lines.length ? x : x + 1)), 650); return () => clearInterval(id); }, [lines]);
  return (
    <Card title="Mission copilot (rule-based, simulated)" icon={Bot}>
      {!route ? <p className="text-sm text-slate-400">Generate a route and the copilot will explain its decisions.</p> : (
        <ul className="space-y-2 text-sm">{lines.slice(0, n).map((l, i) => <li key={i} className={TONE[l.tone]}>&gt; {l.text}</li>)}{n < lines.length && <li className="animate-pulse text-cyan-300">&gt; analysing…</li>}</ul>
      )}
    </Card>
  );
}
