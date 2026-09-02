// ─────────────────────────────────────────────────────────────────────────────
// src/components/calculators/FuelCostCalculator.tsx
// Interactive Provincial Annual Fuel Cost Calculator — React Island client:visible
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import type { Vehicle, Province } from '../../lib/calculations.js';
import { calcAnnualCost, formatCAD, isBEV, isPHEV, isHEV } from '../../lib/calculations.js';

interface Props {
  vehicle: Vehicle;
  provinces: Province[];
  defaultProvinceCode?: string;
}

const KM_MIN  = 10000;
const KM_MAX  = 40000;
const KM_STEP = 1000;

export default function FuelCostCalculator({ vehicle, provinces, defaultProvinceCode = 'ON' }: Props) {
  const [provinceCode, setProvinceCode] = useState(defaultProvinceCode);
  const [kmPerYear, setKmPerYear]       = useState(20000);

  const province = useMemo(() =>
    provinces.find(p => p.code === provinceCode) ?? provinces[0],
    [provinces, provinceCode]
  );

  const result = useMemo(() =>
    calcAnnualCost(vehicle, province, kmPerYear),
    [vehicle, province, kmPerYear]
  );

  const fuelEmoji = isBEV(vehicle) ? '⚡' : isPHEV(vehicle) ? '🔋' : isHEV(vehicle) ? '🔋' : '⛽';
  const fuelColor = isBEV(vehicle) ? '#8B5CF6' : isPHEV(vehicle) ? '#10B981' : isHEV(vehicle) ? '#10B981' : '#F59E0B';
  const priceLabel = result.unit === 'kWh'
    ? `${province.electricityCentsPerKwh}¢/kWh`
    : `${result.fuelPriceCentsPerUnit.toFixed(1)}¢/L`;

  const fiveYearTotal = result.annualCAD * 5;

  return (
    <div className="rounded-2xl p-6 space-y-6"
      style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(30,37,54,0.8)', backdropFilter: 'blur(12px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
          🇨🇦
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-lg">Provincial Fuel Cost Calculator</h3>
          <p className="text-xs text-slate-500">Real CAD prices · All 10 provinces</p>
        </div>
      </div>

      {/* Province selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Select Province
        </label>
        <div className="flex flex-wrap gap-2">
          {provinces.map(p => (
            <button
              key={p.code}
              onClick={() => setProvinceCode(p.code)}
              className={`province-chip text-xs font-semibold ${provinceCode === p.code ? 'active' : ''}`}
            >
              {p.code}
            </button>
          ))}
        </div>
      </div>

      {/* KM Slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Annual Distance
          </label>
          <span className="font-mono font-bold text-neon-cyan text-sm">
            {kmPerYear.toLocaleString('en-CA')} km/yr
          </span>
        </div>
        <input
          type="range"
          min={KM_MIN}
          max={KM_MAX}
          step={KM_STEP}
          value={kmPerYear}
          onChange={e => setKmPerYear(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #00F0FF ${((kmPerYear - KM_MIN) / (KM_MAX - KM_MIN)) * 100}%, #1E2536 0%)`,
          }}
          aria-label="Annual kilometres driven"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>10,000 km</span>
          <span>40,000 km</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3">
        {/* Annual Cost */}
        <div className="col-span-2 rounded-xl p-4 text-center"
          style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)' }}>
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Annual Fuel Cost — {province.name}</div>
          <div className="text-3xl font-display font-black" style={{ color: fuelColor }}>
            {formatCAD(result.annualCAD)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{fuelEmoji} {priceLabel} · {kmPerYear.toLocaleString()} km/yr</div>
        </div>

        {/* Monthly */}
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="text-xs text-slate-400 mb-1">Monthly</div>
          <div className="text-xl font-mono font-bold text-efficiency-green">{formatCAD(result.monthlyCAD)}</div>
        </div>

        {/* 5-year */}
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="text-xs text-slate-400 mb-1">5-Year Total</div>
          <div className="text-xl font-mono font-bold text-amber-fuel">{formatCAD(fiveYearTotal)}</div>
        </div>
      </div>

      {/* Efficiency bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Fuel Efficiency Rating</span>
          <span className="font-mono font-bold" style={{ color: fuelColor }}>
            {result.unit === 'kWh'
              ? `${result.combinedEfficiency} kWh/100km`
              : `${result.combinedEfficiency} L/100km`}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1E2536' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(10, Math.min(100, result.unit === 'kWh'
                ? (1 - (result.combinedEfficiency - 12) / 28) * 100
                : (1 - (result.combinedEfficiency - 3) / 18) * 100
              ))}%`,
              background: `linear-gradient(90deg, ${fuelColor}, #00F0FF)`,
              boxShadow: `0 0 8px ${fuelColor}60`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>Most Efficient</span>
          <span>Least Efficient</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-600 leading-relaxed">
        Based on NRCan combined rating & {province.name} {result.unit === 'kWh' ? 'electricity' : 'fuel'} prices.
        Actual costs vary with driving conditions. Prices updated regularly from Statistics Canada.
      </p>
    </div>
  );
}
