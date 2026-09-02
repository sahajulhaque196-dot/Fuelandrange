import { useState, useEffect } from 'react';

interface VehicleTelemetry {
  name: string;
  year: number;
  trim: string;
  type: 'HYBRID' | 'GASOLINE' | 'BEV' | 'PHEV';
  typeColor: string;
  combinedL100km: number;
  hwyRangeKm: number;
  winterPenalty: string;
  winterRangeKm: number;
  co2Grams: number;
  tankOrBatt: string;
}

const VEHICLES: VehicleTelemetry[] = [
  {
    name: 'Toyota RAV4',
    year: 2024,
    trim: 'Hybrid XLE AWD',
    type: 'HYBRID',
    typeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    combinedL100km: 6.0,
    hwyRangeKm: 917,
    winterPenalty: '+18% Fuel Burn',
    winterRangeKm: 775,
    co2Grams: 139,
    tankOrBatt: '55L Tank'
  },
  {
    name: 'Tesla Model Y',
    year: 2024,
    trim: 'Long Range AWD',
    type: 'BEV',
    typeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    combinedL100km: 2.0,
    hwyRangeKm: 497,
    winterPenalty: '-32% Range Loss',
    winterRangeKm: 338,
    co2Grams: 0,
    tankOrBatt: '75 kWh Batt'
  },
  {
    name: 'Honda Civic',
    year: 2024,
    trim: 'Sedan 2.0L EX',
    type: 'GASOLINE',
    typeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    combinedL100km: 6.9,
    hwyRangeKm: 681,
    winterPenalty: '+15% Fuel Burn',
    winterRangeKm: 580,
    co2Grams: 162,
    tankOrBatt: '47L Tank'
  },
  {
    name: 'Ford F-150',
    year: 2024,
    trim: 'SuperCrew 3.5L 4x4',
    type: 'GASOLINE',
    typeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    combinedL100km: 12.0,
    hwyRangeKm: 816,
    winterPenalty: '+16% Fuel Burn',
    winterRangeKm: 690,
    co2Grams: 281,
    tankOrBatt: '98L Tank'
  }
];

const PROVINCES = [
  { code: 'ON', name: 'Ontario', gas: 1.58, kwh: 0.11, flag: '🍁' },
  { code: 'BC', name: 'British Columbia', gas: 1.82, kwh: 0.12, flag: '🌲' },
  { code: 'AB', name: 'Alberta', gas: 1.39, kwh: 0.14, flag: '🏔️' },
  { code: 'QC', name: 'Quebec', gas: 1.66, kwh: 0.08, flag: '⚜️' },
  { code: 'NS', name: 'Nova Scotia', gas: 1.69, kwh: 0.17, flag: '⚓' }
];

export default function CanadianLiveCockpit() {
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [provIdx, setProvIdx] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const annualKm = 20000;

  const curVehicle = VEHICLES[vehicleIdx];
  const curProvince = PROVINCES[provIdx];

  // Live Auto Cycle provinces every 3 seconds
  useEffect(() => {
    if (!isAutoCycling) return;
    const timer = setInterval(() => {
      setProvIdx(prev => (prev + 1) % PROVINCES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isAutoCycling]);

  // Calculate live CAD cost
  let annualCostCad = 0;
  if (curVehicle.type === 'BEV') {
    const kwhUsed = (annualKm / 100) * 17.5;
    annualCostCad = Math.round(kwhUsed * curProvince.kwh);
  } else {
    const litresUsed = (annualKm / 100) * curVehicle.combinedL100km;
    annualCostCad = Math.round(litresUsed * curProvince.gas);
  }

  return (
    <div 
      className="w-full relative rounded-[28px] p-[2.5px] overflow-hidden group"
      onMouseEnter={() => setIsAutoCycling(false)}
      onMouseLeave={() => setIsAutoCycling(true)}
    >
      {/* Dynamic Smooth Color-Changing Rotating Neon Border Light */}
      <span 
        className="absolute inset-[-1000%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#00F0FF_0%,#10B981_25%,#8B5CF6_50%,#FF2E4D_75%,#00F0FF_100%)] opacity-90"
        aria-hidden="true"
      />

      {/* Dynamic Ambient Outer Glow Halo */}
      <span 
        className="absolute inset-0 rounded-[28px] bg-[conic-gradient(from_0deg,#00F0FF,#10B981,#8B5CF6,#FF2E4D,#00F0FF)] blur-xl opacity-60 pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Inner Cockpit Box — Exactly matching site background (#07090E) */}
      <div className="relative w-full rounded-[26px] p-6 sm:p-7 bg-[#07090E] border border-white/[0.08] backdrop-blur-2xl overflow-hidden text-left z-10">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
              Live Canadian Telemetry
            </span>
          </div>

          {/* Auto-cycle indicator badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D1117] border border-white/[0.08] text-[10px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE PRICE FEED</span>
          </div>
        </div>

        {/* Vehicle Quick Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-5 relative z-10">
          {VEHICLES.map((v, i) => (
            <button
              key={v.name}
              type="button"
              onClick={() => setVehicleIdx(i)}
              className={`px-2.5 py-2 rounded-xl text-left transition-all border text-xs font-semibold ${
                vehicleIdx === i
                  ? 'bg-[#161B25] text-white border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'bg-[#0D1117] text-slate-400 border-white/[0.04] hover:bg-[#161B25] hover:text-slate-200'
              }`}
            >
              <span className="block font-bold text-[11px] leading-tight truncate">{v.name}</span>
              <span className="block text-[9px] font-mono text-slate-500 truncate">{v.trim.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Main Real-Time Telemetry HUD Display Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1117] border border-cyan-500/25 shadow-lg mb-4 relative z-10">
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {curVehicle.year} {curVehicle.name}
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${curVehicle.typeColor}`}>
                  {curVehicle.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {curVehicle.trim} · {curVehicle.tankOrBatt}
              </p>
            </div>

            {/* Primary Efficiency Rating Badge */}
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-400 block uppercase">NRCan Combined</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block leading-tight">
                {curVehicle.combinedL100km} <span className="text-xs font-bold text-slate-400">{curVehicle.type === 'BEV' ? 'Le/100km' : 'L/100km'}</span>
              </span>
            </div>
          </div>

          {/* Live Provincial Cost Calculation Bar */}
          <div className="p-3 rounded-xl bg-[#07090E] border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                <span>{curProvince.flag}</span>
                <span className="font-bold text-white">{curProvince.name}</span>
                <span className="text-slate-500">·</span>
                <span className="text-amber-400 font-bold">
                  {curVehicle.type === 'BEV' ? `${(curProvince.kwh * 100).toFixed(1)}¢/kWh` : `$${curProvince.gas.toFixed(2)}/L`}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                Based on {annualKm.toLocaleString()} km/yr commute
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Estimated Annual Cost</span>
              <span className="text-base font-black font-mono text-cyan-400 block leading-tight">
                ${annualCostCad.toLocaleString()} <span className="text-xs font-bold text-slate-400">CAD/yr</span>
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Metrics Grid: Cruising Range & Winter Penalty with Clean Highlight Borders */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 relative z-10">
          <div className="p-3 rounded-xl bg-[#0D1117] border border-purple-500/25">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Cruising Highway Range</span>
            <span className="text-sm font-mono font-bold text-purple-300 block">
              🛣️ ~{curVehicle.hwyRangeKm} km
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1117] border border-rose-500/25">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Winter Cold (-15°C)</span>
            <span className="text-sm font-mono font-bold text-rose-400 block">
              ❄️ {curVehicle.winterRangeKm} km <span className="text-[9px] font-normal text-slate-500">({curVehicle.winterPenalty})</span>
            </span>
          </div>
        </div>

        {/* Province Pill Selector (User can click any province to test price) */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/[0.06] relative z-10">
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">Compare Province:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PROVINCES.map((p, idx) => (
              <button
                key={p.code}
                type="button"
                onClick={() => {
                  setProvIdx(idx);
                  setIsAutoCycling(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  provIdx === idx
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'bg-[#0D1117] text-slate-400 border border-white/[0.04] hover:text-slate-200'
                }`}
              >
                {p.code}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
