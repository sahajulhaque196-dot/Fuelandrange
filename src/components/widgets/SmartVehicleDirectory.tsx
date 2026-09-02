import { useState, useMemo, useEffect } from 'react';
import type { Vehicle } from '../../lib/calculations.js';
import { fuelTypePill, fuelTypeLabel, toSlug } from '../../lib/calculations.js';

interface Props {
  vehicles: Vehicle[];
}

export default function SmartVehicleDirectory({ vehicles }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bev' | 'hybrid' | 'ice' | 'truck'>('all');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'efficiency' | 'range' | 'price-low' | 'price-high' | 'year-desc'>('efficiency');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Exactly 2 lines of 3 cards on desktop

  // Parse URL search parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    const classParam = params.get('class');
    const makeParam = params.get('make');
    const catParam = params.get('cat');

    if (qParam) {
      setSearchQuery(qParam);
    } else if (classParam) {
      setSearchQuery(classParam);
    }

    if (makeParam) {
      const match = vehicles.find(v => v.make.toLowerCase() === makeParam.toLowerCase());
      if (match) setSelectedMake(match.make);
    }

    if (catParam && ['all', 'bev', 'hybrid', 'ice', 'truck'].includes(catParam.toLowerCase())) {
      setSelectedCategory(catParam.toLowerCase() as any);
    }
  }, [vehicles]);

  // Extract unique sorted makes
  const availableMakes = useMemo(() => {
    const makes = Array.from(new Set(vehicles.map(v => v.make))).sort();
    return makes;
  }, [vehicles]);

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];

    // 1. Text Search Filter (Make, Model, Trim, Class)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.trim.toLowerCase().includes(q) ||
        v.vehicleClass.toLowerCase().includes(q) ||
        v.year.toString().includes(q)
      );
    }

    // 2. Category / Powertrain Filter
    if (selectedCategory === 'bev') {
      list = list.filter(v => v.fuelType === 'BEV');
    } else if (selectedCategory === 'hybrid') {
      list = list.filter(v => v.fuelType === 'HEV' || v.fuelType === 'PHEV');
    } else if (selectedCategory === 'ice') {
      list = list.filter(v => v.fuelType === 'X' || v.fuelType === 'Z' || v.fuelType === 'D');
    } else if (selectedCategory === 'truck') {
      list = list.filter(v => v.vehicleClass.toLowerCase().includes('pickup') || v.vehicleClass.toLowerCase().includes('truck'));
    }

    // 3. Make Brand Filter
    if (selectedMake !== 'all') {
      list = list.filter(v => v.make.toLowerCase() === selectedMake.toLowerCase());
    }

    // 4. Sorting
    list.sort((a, b) => {
      if (sortBy === 'efficiency') {
        const effA = a.combinedL100km ?? (a.kwhPer100km ? a.kwhPer100km / 8.9 : 99);
        const effB = b.combinedL100km ?? (b.kwhPer100km ? b.kwhPer100km / 8.9 : 99);
        return effA - effB;
      }
      if (sortBy === 'range') {
        const rangeA = a.electricRangeKm ?? 0;
        const rangeB = b.electricRangeKm ?? 0;
        return rangeB - rangeA;
      }
      if (sortBy === 'price-low') {
        return a.msrpCAD - b.msrpCAD;
      }
      if (sortBy === 'price-high') {
        return b.msrpCAD - a.msrpCAD;
      }
      if (sortBy === 'year-desc') {
        return b.year - a.year;
      }
      return 0;
    });

    return list;
  }, [vehicles, searchQuery, selectedCategory, selectedMake, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  const handleCategoryChange = (cat: typeof selectedCategory) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    setCurrentPage(1);
  };

  return (
    <div className="w-full">
      {/* ── Control Console / Filter Bar ─────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-[#0D1117] border border-white/[0.08] shadow-2xl mb-10">
        
        {/* Search Input Box */}
        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by make, model, trim (e.g. RAV4, Tesla, F-150, Ioniq, Hybrid)..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#06080C] border border-white/[0.1] text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
            >
              Clear ✕
            </button>
          )}
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-5 pb-5 border-b border-white/[0.06]">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-neon-cyan text-cyber-slate shadow-lg shadow-neon-cyan/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            All Vehicles ({vehicles.length})
          </button>
          <button
            onClick={() => handleCategoryChange('bev')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'bev'
                ? 'bg-neon-cyan text-cyber-slate shadow-lg shadow-neon-cyan/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span>⚡</span> Pure Electric (BEV)
          </button>
          <button
            onClick={() => handleCategoryChange('hybrid')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'hybrid'
                ? 'bg-emerald-400 text-cyber-slate shadow-lg shadow-emerald-400/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span>🌿</span> Hybrids & PHEV
          </button>
          <button
            onClick={() => handleCategoryChange('ice')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'ice'
                ? 'bg-amber-400 text-cyber-slate shadow-lg shadow-amber-400/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span>⛽</span> Gas & Diesel
          </button>
          <button
            onClick={() => handleCategoryChange('truck')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'truck'
                ? 'bg-rose-400 text-cyber-slate shadow-lg shadow-rose-400/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span>🛻</span> Pickup Trucks
          </button>
        </div>

        {/* Dropdowns Row: Make Filter + Sort By + View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Make Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Brand:</span>
              <select
                value={selectedMake}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="bg-[#06080C] text-white border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-neon-cyan"
              >
                <option value="all">All Brands ({availableMakes.length})</option>
                {availableMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#06080C] text-white border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-neon-cyan"
              >
                <option value="efficiency">Lowest Fuel/Energy (L/100km)</option>
                <option value="range">Highest Electric Range (km)</option>
                <option value="price-low">Lowest Starting MSRP CAD</option>
                <option value="price-high">Highest Starting MSRP CAD</option>
                <option value="year-desc">Model Year (Newest)</option>
              </select>
            </div>
          </div>

          {/* Results Count & View Toggle */}
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <span className="text-xs font-mono text-slate-400">
              Found <strong className="text-white">{filteredVehicles.length}</strong> trims
            </span>

            <div className="flex items-center bg-[#06080C] p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-neon-cyan' : 'text-slate-500 hover:text-slate-300'}`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-white/10 text-neon-cyan' : 'text-slate-500 hover:text-slate-300'}`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── Vehicle Results View ──────────────────────────────────────── */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-20 bg-[#0D1117] rounded-3xl border border-white/[0.08] p-8">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-white mb-1">No Canadian vehicles matched your filter</h3>
          <p className="text-xs text-slate-400 mb-6">Try clearing your search query or selecting "All Vehicles".</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedMake('all'); }}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-neon-cyan text-cyber-slate hover:bg-cyan-300 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedVehicles.map(v => {
            const isElectric = v.fuelType === 'BEV';
            
            return (
              <a
                key={v.id}
                href={`/makes/${toSlug(v.make)}/${toSlug(v.model)}/${v.year}/${toSlug(v.trim)}`}
                className="group p-6 rounded-3xl bg-[#0D1117] border border-white/[0.08] hover:border-neon-cyan/40 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                      {v.year}
                    </span>
                    <span className={fuelTypePill(v.fuelType)}>
                      {fuelTypeLabel(v.fuelType).split(' ')[0]}
                    </span>
                  </div>

                  {/* Title & Trim */}
                  <h3 className="font-display font-black text-white text-lg group-hover:text-neon-cyan transition-colors mb-1 leading-snug">
                    {v.make} {v.model}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mb-4">
                    {v.trim} · {v.driveType}
                  </p>

                  {/* Primary Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#06080C] border border-white/[0.04] mb-4">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Combined NRCan</div>
                      <div className="text-sm font-mono font-black text-emerald-400 mt-0.5">
                        {v.combinedL100km ? `${v.combinedL100km} L/100km` : `${v.kwhPer100km} kWh`}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        {isElectric ? 'Electric Range' : 'Starting MSRP'}
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                        {isElectric && v.electricRangeKm 
                          ? `${v.electricRangeKm} km` 
                          : `$${(v.msrpCAD / 1000).toFixed(1)}k CAD`}
                      </div>
                    </div>
                  </div>

                  {/* Canadian Winter Metric Badge */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2 py-1 rounded-lg bg-cyan-950/20 border border-cyan-500/10">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <span>❄️</span> -15°C Winter:
                    </span>
                    <span className="font-bold text-slate-300">
                      {isElectric && v.electricRangeKm 
                        ? `~${Math.round(v.electricRangeKm * 0.68)} km range`
                        : v.combinedL100km 
                        ? `~${(v.combinedL100km * 1.15).toFixed(1)} L/100km`
                        : 'Est. Winter Mode'}
                    </span>
                  </div>
                </div>

                {/* Footer Link Button */}
                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neon-cyan font-semibold">
                  <span>View Full Intel & Breakdown</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-3xl bg-[#0D1117] border border-white/[0.08] shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#06080C] text-slate-400 border-b border-white/[0.08]">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Powertrain</th>
                <th className="p-4">Class</th>
                <th className="p-4">NRCan Rating</th>
                <th className="p-4">Winter -15°C</th>
                <th className="p-4">MSRP (CAD)</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {paginatedVehicles.map(v => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-sans font-bold text-white">
                    {v.year} {v.make} {v.model}
                    <div className="text-[11px] font-mono text-slate-500 font-normal">{v.trim}</div>
                  </td>
                  <td className="p-4">
                    <span className={fuelTypePill(v.fuelType)}>{fuelTypeLabel(v.fuelType).split(' ')[0]}</span>
                  </td>
                  <td className="p-4 text-slate-400">{v.vehicleClass}</td>
                  <td className="p-4 font-bold text-emerald-400">
                    {v.combinedL100km ? `${v.combinedL100km} L/100km` : `${v.kwhPer100km} kWh/100km`}
                  </td>
                  <td className="p-4 text-cyan-400">
                    {v.electricRangeKm 
                      ? `${Math.round(v.electricRangeKm * 0.68)} km` 
                      : v.combinedL100km 
                      ? `${(v.combinedL100km * 1.15).toFixed(1)} L/100km` 
                      : '—'}
                  </td>
                  <td className="p-4 font-bold text-slate-200">
                    ${v.msrpCAD.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`/makes/${toSlug(v.make)}/${toSlug(v.model)}/${v.year}/${toSlug(v.trim)}`}
                      className="text-neon-cyan hover:underline font-bold"
                    >
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Symmetrical 2-Line Pagination Bar ────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/[0.08] flex-wrap">
          <div className="text-xs font-mono text-slate-400">
            Showing <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> – <strong className="text-white">{Math.min(currentPage * itemsPerPage, filteredVehicles.length)}</strong> of <strong className="text-white">{filteredVehicles.length}</strong> vehicles (Page {currentPage} of {totalPages})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = Math.max(1, currentPage - 1);
                setCurrentPage(next);
                document.getElementById('catalog-top')?.scrollIntoView({ behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#0D1117] border border-white/[0.1] text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 hover:border-neon-cyan/40 transition-all flex items-center gap-1"
            >
              ← Prev
            </button>

            {/* Smart Windowed Page Chips */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-1 text-slate-600 font-mono text-xs">…</span>
                      )}
                      <button
                        onClick={() => {
                          setCurrentPage(page);
                          document.getElementById('catalog-top')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                          currentPage === page
                            ? 'bg-neon-cyan text-cyber-slate shadow-lg shadow-neon-cyan/20 scale-105'
                            : 'bg-[#0D1117] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => {
                const next = Math.min(totalPages, currentPage + 1);
                setCurrentPage(next);
                document.getElementById('catalog-top')?.scrollIntoView({ behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#0D1117] border border-white/[0.1] text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 hover:border-neon-cyan/40 transition-all flex items-center gap-1"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

