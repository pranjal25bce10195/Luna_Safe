// Rule-based route explanation (simulated). A backend LLM or planner could return the same shape.
const LABEL = { safety: 'maximum-safety', distance: 'minimum-distance', energy: 'energy-efficient' };
export function explain(route, p) {
  const m = route.metrics, reserve = +(p.battery - m.batteryPct).toFixed(1);
  return [
    { tone: 'info', text: `Strategy: ${LABEL[p.priority]} A* search, hard limit ${p.maxSlope}° slope, ${route.path.length} waypoints over ${m.distanceKm} km.` },
    { tone: 'info', text: `${m.hazardsAvoided} craters and rocks lie within 200 m of the path; none are crossed.` },
    m.safety >= 75 ? { tone: 'good', text: `Safety score ${m.safety}/100. The route stays mostly on stable terrain.` } : { tone: 'warn', text: `Safety score ${m.safety}/100. The route crosses steep or uneven sections; monitor slope.` },
    reserve < 0 ? { tone: 'bad', text: `Battery shortfall of ${Math.abs(reserve)}%. Recharge or pick the energy-efficient strategy.` } : reserve < 15 ? { tone: 'warn', text: `Thin energy reserve (${reserve}%). Avoid detours.` } : { tone: 'good', text: `Energy reserve ${reserve}% on arrival. ETA ${Math.floor(m.timeMin / 60)}h ${m.timeMin % 60}m.` },
    reserve < 0 ? { tone: 'bad', text: 'Recommendation: HOLD.' } : { tone: 'good', text: 'Recommendation: PROCEED.' },
  ];
}
