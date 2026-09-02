// ─────────────────────────────────────────────────────────────────────────────
// src/components/calculators/WinterPenaltyMeter.tsx
// Sub-Zero Winter Penalty Visual Meter — React Island client:visible
// Shows -15°C winter performance vs summer baseline with Canadian cold tips
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import type { Vehicle } from '../../lib/calculations.js';
import { calcWinterPenalty, isBEV, isPHEV, isHEV } from '../../lib/calculations.js';

interface Props {
  vehicle: Vehicle;
}

const TEMPS = [
  { label: '0°C',   penalty: 0.40 },
  { label: '-5°C',  penalty: 0.60 },
  { label: '-10°C', penalty: 0.80 },
  { label: '-15°C', penalty: 1.00 },
  { label: '-20°C', penalty: 1.20 },
  { label: '-25°C', penalty: 1.35 },
  { label: '-30°C', penalty: 1.50 },
];

export default function WinterPenaltyMeter({ vehicle }: Props) {
  const [tempIdx, setTempIdx] = useState(3); // -15°C default
  const base = calcWinterPenalty(vehicle);

  const scaledLossPct = base.lossPct * TEMPS[tempIdx].penalty;
  const isEV = isBEV(vehicle);
  const isPlugin = isPHEV(vehicle);
  const isHybrid = isHEV(vehicle);

  const winterValue = isEV
    ? Math.round((vehicle.electricRangeKm ?? 0) * (1 - scaledLossPct / 100))
    : base.winterConsumption
    ? +(base.winterConsumption * TEMPS[tempIdx].penalty + (base.summerBaseline ?? 0) * (1 - TEMPS[tempIdx].penalty)).toFixed(1)
    : null;

  const severity = scaledLossPct >= 40 ? 'Severe' : scaledLossPct >= 25 ? 'Moderate' : scaledLossPct >= 10 ? 'Mild' : 'Minimal';
  const severityColor = scaledLossPct >= 40 ? '#FF2E4D' : scaledLossPct >= 25 ? '#F97316' : scaledLossPct >= 10 ? '#F59E0B' : '#10B981';

  return (
    <div className="rounded-2xl p-6 space-y-5"
      style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(30,37,54,0.8)', backdropFilter: 'blur(12px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ background: 'rgba(255,46,77,0.1)', border: '1px solid rgba(255,46,77,0.2)' }}>
          🌨️
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-lg">Canadian Winter Penalty</h3>
          <p className="text-xs text-slate-500">Sub-zero performance vs summer baseline</p>
        </div>
      </div>

      {/* Temperature selector */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Temperature
          </label>
          <span className="font-mono font-bold text-lg" style={{ color: '#00F0FF' }}>
            {TEMPS[tempIdx].label}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={TEMPS.length - 1}
          step={1}
          value={tempIdx}
          onChange={e => setTempIdx(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #00F0FF ${(tempIdx / (TEMPS.length - 1)) * 100}%, #1E2536 0%)`,
          }}
          aria-label="Temperature selector"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0°C</span>
          <span>-30°C</span>
        </div>
      </div>

      {/* Severity bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Winter Severity</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: severityColor, background: `${severityColor}20`, border: `1px solid ${severityColor}40` }}>
            {severity}
          </span>
        </div>
        <div className="winter-bar-track">
          <div className="winter-bar-fill" style={{ width: `${Math.min(scaledLossPct / 60 * 100, 100)}%` }} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Summer baseline */}
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="text-xs text-slate-400 mb-1">☀️ Summer Rated</div>
          <div className="font-mono font-bold text-efficiency-green text-xl">
            {isEV
              ? `${vehicle.electricRangeKm} km`
              : `${base.summerBaseline} L/100km`}
          </div>
          <div className="text-xs text-slate-500">NRCan Rating</div>
        </div>

        {/* Winter result */}
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,46,77,0.07)', border: '1px solid rgba(255,46,77,0.15)' }}>
          <div className="text-xs text-slate-400 mb-1">🌨️ At {TEMPS[tempIdx].label}</div>
          <div className="font-mono font-bold text-canadian-crimson text-xl">
            {isEV
              ? `~${winterValue} km`
              : winterValue
              ? `~${winterValue} L/100km`
              : '—'}
          </div>
          <div className="text-xs text-slate-500">
            {isEV ? `−${scaledLossPct.toFixed(0)}% range` : `+${scaledLossPct.toFixed(0)}% fuel`}
          </div>
        </div>
      </div>

      {/* Vehicle type badge */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">Type:</span>
        {isEV && (
          <span className="fuel-pill-bev">Battery Electric — Cold-weather range loss significant</span>
        )}
        {isPlugin && (
          <span className="fuel-pill-phev">Plug-in Hybrid — EV range reduced, ICE compensates</span>
        )}
        {isHybrid && (
          <span className="fuel-pill-hybrid">Full Hybrid — Moderate cold penalty vs ICE</span>
        )}
        {!isEV && !isPlugin && !isHybrid && (
          <span className="fuel-pill-petrol">Gasoline ICE — Standard Canadian cold-weather penalty</span>
        )}
      </div>

      {/* Tips */}
      {base.advice.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            🍁 Canadian Winter Driving Tips
          </div>
          <ul className="space-y-1.5">
            {base.advice.map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
                <span className="shrink-0 mt-0.5" style={{ color: '#00F0FF' }}>›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-slate-600">
        Winter model based on Canadian Climate Atlas -15°C baseline. Actual degradation varies by battery state of charge, driving speed, and cabin heating usage.
      </p>
    </div>
  );
}
