import { useState, useEffect } from 'react';

interface Props {
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    trim: string;
    year: number;
    fuelType: string;
    combinedL100km: number | null;
    kwhPer100km: number | null;
    electricRangeKm: number | null;
    fuelTankLitres: number | null;
    msrpCAD: number;
    co2GPerKm: number;
  }>;
  provinces: Array<{
    code: string;
    name: string;
    gasolineCentsPerL: number;
    electricityCentsPerKwh: number;
  }>;
}

export default function CanadianComparisonTool({ vehicles = [], provinces }: Props) {
  const [vehicleList, setVehicleList] = useState(vehicles);
  const [veh1Id, setVeh1Id] = useState(vehicles[0]?.id || '');
  const [veh2Id, setVeh2Id] = useState(vehicles[1]?.id || vehicles[0]?.id || '');
  const [selectedProvCode, setSelectedProvCode] = useState('ON');
  const [annualKm, setAnnualKm] = useState(20000);

  useEffect(() => {
    if (vehicles && vehicles.length >= 100) {
      setVehicleList(vehicles);
      return;
    }
    fetch('/data/search-vehicles.json')
      .then(res => res.json())
      .then((data) => {
        setVehicleList(data);
        if (!veh1Id && data[0]) setVeh1Id(data[0].id);
        if (!veh2Id && data[1]) setVeh2Id(data[1].id);
      })
      .catch(() => {});
  }, [vehicles]);

  const v1 = vehicleList.find(v => v.id === veh1Id) || vehicleList[0];
  const v2 = vehicleList.find(v => v.id === veh2Id) || vehicleList[1] || vehicleList[0];
  const prov = provinces.find(p => p.code === selectedProvCode) || provinces[0];

  function calcCost(v: typeof v1) {
    if (!v) return 0;
    if (v.fuelType === 'BEV') {
      const kwhNeeded = (annualKm / 100) * (v.kwhPer100km || 18.0);
      return Math.round(kwhNeeded * (prov.electricityCentsPerKwh / 100));
    }
    const litresNeeded = (annualKm / 100) * (v.combinedL100km || 8.0);
    return Math.round(litresNeeded * (prov.gasolineCentsPerL / 100));
  }

  const cost1 = calcCost(v1);
  const cost2 = calcCost(v2);
  const diff = Math.abs(cost1 - cost2);
  const winner = cost1 < cost2 ? v1 : v2;

  return (
    <div className="w-full rounded-2xl bg-[#0D1117] border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
            🍁 Interactive Canadian Comparison Engine
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
            Compare Any 2 Vehicles Head-to-Head
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            See real NRCan ratings, provincial pump vs hydro costs, and winter cold range loss.
          </p>
        </div>

        {/* Province Selector */}
        <div className="flex items-center gap-2 bg-[#07090E] p-1.5 rounded-xl border border-white/[0.06]">
          <span className="text-xs font-mono text-slate-400 pl-2">Province:</span>
          <select
            value={selectedProvCode}
            onChange={e => setSelectedProvCode(e.target.value)}
            aria-label="Select Canadian Province"
            className="bg-[#161B25] text-white text-xs font-mono font-bold py-1.5 px-3 rounded-lg border border-white/[0.08] focus:outline-none focus:border-cyan-400"
          >
            {provinces.map(p => (
              <option key={p.code} value={p.code}>
                {p.name} ({p.gasolineCentsPerL.toFixed(1)}¢/L)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Vehicle 1 */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold text-cyan-400">
            Vehicle A (Select Car or SUV)
          </label>
          <select
            value={veh1Id}
            onChange={e => setVeh1Id(e.target.value)}
            aria-label="Select First Vehicle"
            className="w-full bg-[#07090E] text-white text-sm font-semibold p-3 rounded-xl border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
          >
            {vehicleList.map(v => (
              <option key={`v1-${v.id}`} value={v.id}>
                {v.year} {v.make} {v.model} - {v.trim} ({v.fuelType})
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle 2 */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold text-purple-400">
            Vehicle B (Select Rival Model)
          </label>
          <select
            value={veh2Id}
            onChange={e => setVeh2Id(e.target.value)}
            aria-label="Select Second Vehicle"
            className="w-full bg-[#07090E] text-white text-sm font-semibold p-3 rounded-xl border border-purple-500/30 focus:outline-none focus:border-purple-400"
          >
            {vehicleList.map(v => (
              <option key={`v2-${v.id}`} value={v.id}>
                {v.year} {v.make} {v.model} - {v.trim} ({v.fuelType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Direct Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="p-5 rounded-xl bg-[#07090E] border border-cyan-500/20">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              {v1.fuelType}
            </span>
            <span className="text-xs font-mono text-slate-400">MSRP: ${v1.msrpCAD.toLocaleString()} CAD</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-1">
            {v1.year} {v1.make} {v1.model}
          </h4>
          <p className="text-xs font-mono text-slate-400 mb-4">{v1.trim}</p>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded-lg bg-[#0D1117] border border-white/[0.04]">
              <span className="text-slate-400">NRCan Combined Rating:</span>
              <span className="font-bold text-emerald-400">
                {v1.combinedL100km ? `${v1.combinedL100km} L/100km` : `${v1.kwhPer100km} kWh/100km`}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-[#0D1117] border border-white/[0.04]">
              <span className="text-slate-400">Annual {prov.code} Energy Cost:</span>
              <span className="font-bold text-cyan-400">${cost1.toLocaleString()} CAD/yr</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-[#0D1117] border border-white/[0.04]">
              <span className="text-slate-400">Winter Cold (-15°C):</span>
              <span className="font-bold text-rose-400">
                {v1.fuelType === 'BEV' ? `~${Math.round((v1.electricRangeKm || 400) * 0.68)} km Range (-32%)` : `+15% Fuel Burn`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-xl bg-[#07090E] border border-purple-500/20">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
              {v2.fuelType}
            </span>
            <span className="text-xs font-mono text-slate-400">MSRP: ${v2.msrpCAD.toLocaleString()} CAD</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-1">
            {v2.year} {v2.make} {v2.model}
          </h4>
          <p className="text-xs font-mono text-slate-400 mb-4">{v2.trim}</p>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded-lg bg-[#0D1117] border border-white/[0.04]">
              <span className="text-slate-400">NRCan Combined Rating:</span>
              <span className="font-bold text-emerald-400">
                {v2.combinedL100km ? `${v2.combinedL100km} L/100km` : `${v2.kwhPer100km} kWh/100km`}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-[#0D1117] border border-white/[0.04]">
              <span className="text-slate-400">Annual {prov.code} Energy Cost:</span>
              <span className="font-bold text-purple-400">${cost2.toLocaleString()} CAD/yr</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-[#0D1117] border border-white/[0.04]">
              <span className="text-slate-400">Winter Cold (-15°C):</span>
              <span className="font-bold text-rose-400">
                {v2.fuelType === 'BEV' ? `~${Math.round((v2.electricRangeKm || 400) * 0.68)} km Range (-32%)` : `+15% Fuel Burn`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Result Strip */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#0D1117] to-cyan-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="text-xs font-mono text-slate-400 block">Annual Difference in {prov.name}:</span>
          <span className="text-sm font-bold text-white">
            {winner.make} {winner.model} saves approximately{' '}
            <strong className="text-emerald-400 font-mono text-base font-black">${diff.toLocaleString()} CAD/year</strong> on fuel.
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Commute:</span>
          {[15000, 20000, 25000].map(km => (
            <button
              key={km}
              type="button"
              onClick={() => setAnnualKm(km)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                annualKm === km
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-[#07090E] text-slate-400 border border-white/[0.06] hover:text-white'
              }`}
            >
              {(km / 1000).toFixed(0)}k km
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
