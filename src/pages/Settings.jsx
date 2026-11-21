import { Card, Field, Btn, inputCls } from '../components/ui';
import { useMission } from '../store';

export default function Settings() {
  const { settings: s, setSettings, params, setParams, add } = useMission();
  const set = (k) => (e) => setSettings({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Rover configuration">
        <div className="space-y-3">
          <Field label="Rover name"><input className={inputCls} value={s.rover} onChange={set('rover')} /></Field>
          <Field label="Battery capacity (Wh)"><input type="number" min="500" className={inputCls} value={s.capacity} onChange={set('capacity')} /></Field>
        </div>
      </Card>
      <Card title="Navigation and hazards">
        <div className="space-y-3">
          <Field label="Default navigation priority">
            <select className={inputCls} value={params.priority} onChange={(e) => setParams({ ...params, priority: e.target.value })}>
              <option value="safety">Maximum safety</option><option value="distance">Minimum distance</option><option value="energy">Energy efficiency</option>
            </select>
          </Field>
          <Field label="Hazard sensitivity">
            <select className={inputCls} value={s.sensitivity} onChange={set('sensitivity')}><option>low</option><option>medium</option><option>high</option></select>
          </Field>
        </div>
      </Card>
      <Card title="Display preferences">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.overlay} onChange={set('overlay')} />Colour terrain by hazard level</label>
        <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={s.stars} onChange={set('stars')} />Show starfield</label>
        <Btn className="mt-4" onClick={() => add('Settings applied', 'warn')}>Save settings</Btn>
      </Card>
    </div>
  );
}
