export const inputCls = 'w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400';
export const Card = ({ title, icon: I, children, className = '' }) => (
  <section className={`glass rounded-xl p-4 ${className}`}>
    {title && <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-300">{I && <I size={15} />}{title}</h3>}
    {children}
  </section>
);
export const Stat = ({ label, value, unit, icon: I, tone = 'text-white' }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div><p className="text-xs text-slate-400">{label}</p><p className={`mt-1 font-mono text-2xl ${tone}`}>{value}<span className="ml-1 text-xs text-slate-400">{unit}</span></p></div>
      {I && <I className="text-neon/70" size={18} />}
    </div>
  </Card>
);
export const Btn = ({ variant = 'primary', className = '', ...p }) => (
  <button {...p} className={`rounded-lg px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${variant === 'primary' ? 'bg-neon text-black hover:brightness-110' : variant === 'danger' ? 'bg-red-500/90 text-white hover:bg-red-500' : 'border border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10'} ${className}`} />
);
export const Field = ({ label, children }) => (<label className="block text-xs text-slate-400"><span className="mb-1 block">{label}</span>{children}</label>);
export const Empty = ({ icon: I, text, children }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">{I && <I size={28} />}<p>{text}</p>{children}</div>
);
export const Bar = ({ v, tone = 'bg-neon' }) => (<div className="h-1.5 rounded bg-slate-800"><div className={`h-full rounded ${tone}`} style={{ width: `${Math.max(0, Math.min(100, v))}%` }} /></div>);
export const Legend = () => (
  <div className="flex flex-wrap gap-4 text-xs text-slate-300">
    {[['bg-green-400', 'Safe (<12°)'], ['bg-yellow-400', 'Caution (12–22°)'], ['bg-red-500', 'Danger (>22°)']].map(([c, t]) => (<span key={t} className="flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-sm ${c}`} />{t}</span>))}
  </div>
);
export const GHOST = { safety: '#39ff88', distance: '#ff9f1c', energy: '#c084fc' };
export const Gauge = ({ v, label, color = '#39ff88' }) => {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r={r} stroke="#1e293b" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, Math.max(0, v)) / 100)} style={{ transition: 'stroke-dashoffset .6s', filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-mono text-lg">{Math.round(v)}<span className="text-[10px] text-slate-400">%</span></div>
      </div>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
};
