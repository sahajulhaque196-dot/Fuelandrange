// ─────────────────────────────────────────────────────────────────────────────
// src/components/calculators/CompetitorMatrix.tsx
// Side-by-side competitor comparison table — React Island client:visible
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import type { Vehicle } from '../../lib/calculations.js';
import { formatCAD, calcAnnualCost, calcHwyRange, isBEV, toSlug } from '../../lib/calculations.js';

interface Props {
  vehicle: Vehicle;
  competitors: Vehicle[];
  defaultProvinceCode?: string;
  gasPriceForProvince?: number;
  electricityPriceForProvince?: number;
}

interface SimpleProvince {
  code: string;
  name: string;
  gasolineCentsPerL: number;
  premiumCentsPerL: number;
  dieselCentsPerL: number;
  electricityCentsPerKwh: number;
  carbonTax: boolean;
}

export default function CompetitorMatrix({
  vehicle,
  competitors,
  defaultProvinceCode = 'ON',
  gasPriceForProvince = 151.2,
  electricityPriceForProvince = 14.2,
}: Props) {
  const [tab, setTab] = useState<'efficiency' | 'cost' | 'specs'>('efficiency');

  const mockProvince: SimpleProvince = {
    code: defaultProvinceCode,
    name: 'Ontario',
    gasolineCentsPerL: gasPriceForProvince,
    premiumCentsPerL: gasPriceForProvince * 1.14,
    dieselCentsPerL: gasPriceForProvince * 1.05,
    electricityCentsPerKwh: electricityPriceForProvince,
    carbonTax: true,
  };

  const all = [vehicle, ...competitors.slice(0, 3)];
  const km = 20000;

  function annualCost(v: Vehicle) {
    return calcAnnualCost(v, mockProvince, km).annualCAD;
  }

  const tabs = [
    { id: 'efficiency' as const, label: 'Fuel Economy' },
    { id: 'cost' as const,       label: 'Annual Cost' },
    { id: 'specs' as const,      label: 'Specs' },
  ];

  const getBestEff = () => {
    const effs = all.map(v => v.combinedL100km ?? v.kwhPer100km ?? 99);
    return Math.min(...effs);
  };
  const bestEff = getBestEff();

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(30,37,54,0.8)' }}>

      {/* Header */}
      <div className="p-5 border-b border-slate-border/50 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
            ⚖️
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg">Competitor Comparison</h3>
            <p className="text-xs text-slate-500">Same class · NRCan ratings · CAD fuel costs at 20,000 km/yr</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(30,37,54,0.6)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                background: tab === t.id ? 'rgba(0,240,255,0.15)' : 'transparent',
                color: tab === t.id ? '#00F0FF' : '#94A3B8',
                border: tab === t.id ? '1px solid rgba(0,240,255,0.25)' : '1px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left min-w-[140px]">Vehicle</th>
              {tab === 'efficiency' && (
                <>
                  <th>City</th>
                  <th>Highway</th>
                  <th>Combined</th>
                  <th>Best?</th>
                </>
              )}
              {tab === 'cost' && (
                <>
                  <th>Annual (20k km)</th>
                  <th>Monthly</th>
                  <th>5-Year</th>
                  <th>vs {vehicle.make}</th>
                </>
              )}
              {tab === 'specs' && (
                <>
                  <th>Engine</th>
                  <th>Drive</th>
                  <th>CO₂</th>
                  <th>Range</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {all.map((v, i) => {
              const isThis = i === 0;
              const thisEff = v.combinedL100km ?? v.kwhPer100km ?? 99;
              const isBest = Math.abs(thisEff - bestEff) < 0.01;
              const cost = annualCost(v);
              const baseCost = annualCost(vehicle);
              const diff = cost - baseCost;

              return (
                <tr key={v.id} style={isThis ? { background: 'rgba(0,240,255,0.04)' } : {}}>
                  {/* Name */}
                  <td>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <a href={`/makes/${toSlug(v.make)}/${toSlug(v.model)}/${v.year}`}
                          className="font-semibold text-white hover:text-neon-cyan transition-colors text-sm">
                          {v.year} {v.make} {v.model}
                        </a>
                        {isThis && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                            style={{ color: '#00F0FF', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 truncate max-w-[130px]">{v.trim}</span>
                    </div>
                  </td>

                  {tab === 'efficiency' && (
                    <>
                      <td className="font-mono text-sm text-amber-fuel">
                        {v.cityL100km ? `${v.cityL100km}` : v.kwhPer100km ? `${v.kwhPer100km}` : '—'}
                        <span className="text-xs text-slate-500 ml-0.5">{v.cityL100km ? 'L' : 'kWh'}</span>
                      </td>
                      <td className="font-mono text-sm text-efficiency-green">
                        {v.hwyL100km ? `${v.hwyL100km}` : '—'}
                        <span className="text-xs text-slate-500 ml-0.5">{v.hwyL100km ? 'L' : ''}</span>
                      </td>
                      <td className="font-mono font-bold text-sm text-white">
                        {v.combinedL100km
                          ? `${v.combinedL100km} L/100km`
                          : v.kwhPer100km
                          ? `${v.kwhPer100km} kWh/100km`
                          : '—'}
                      </td>
                      <td>
                        {isBest && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ color: '#10B981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                            ★ Best
                          </span>
                        )}
                      </td>
                    </>
                  )}

                  {tab === 'cost' && (
                    <>
                      <td className="font-mono font-bold text-white">{formatCAD(cost)}</td>
                      <td className="font-mono text-sm text-slate-300">{formatCAD(Math.round(cost / 12))}</td>
                      <td className="font-mono text-sm text-amber-fuel">{formatCAD(cost * 5)}</td>
                      <td className="font-mono text-sm font-bold">
                        {isThis ? (
                          <span className="text-neon-cyan">—</span>
                        ) : diff > 0 ? (
                          <span style={{ color: '#FF2E4D' }}>+{formatCAD(diff)}</span>
                        ) : (
                          <span style={{ color: '#10B981' }}>{formatCAD(diff)}</span>
                        )}
                      </td>
                    </>
                  )}

                  {tab === 'specs' && (
                    <>
                      <td className="text-sm">
                        {isBEV(v) ? 'Electric Motor' : `${v.engineSize}L ${v.cylinders}-cyl`}
                      </td>
                      <td className="text-sm font-mono text-neon-cyan">{v.driveType}</td>
                      <td className="text-sm font-mono">
                        <span style={{ color: v.co2GPerKm === 0 ? '#10B981' : '#94A3B8' }}>
                          {v.co2GPerKm === 0 ? '0 g/km ✓' : `${v.co2GPerKm} g/km`}
                        </span>
                      </td>
                      <td className="text-sm font-mono">
                        {isBEV(v) ? `${v.electricRangeKm} km EV` : calcHwyRange(v) ? `${calcHwyRange(v)} km` : '—'}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-border/50">
        <p className="text-xs text-slate-600">Annual costs use Ontario fuel prices. Switch province in the fuel calculator above. All figures from NRCan official ratings.</p>
      </div>
    </div>
  );
}
