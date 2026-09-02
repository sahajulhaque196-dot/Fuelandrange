// ─────────────────────────────────────────────────────────────────────────────
// src/components/widgets/SearchBar.tsx
// Fuse.js fuzzy search with autocomplete dropdown — React Island client:load
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { Vehicle } from '../../lib/calculations.js';
import { fuelTypePill, fuelTypeLabel, toSlug } from '../../lib/calculations.js';

interface Props {
  vehicles: Vehicle[];
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ vehicles, placeholder = 'Search any Canadian vehicle… e.g. RAV4, Tesla, F-150', className = '' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuseRef  = useRef<Fuse<Vehicle>>(null!);

  useEffect(() => {
    fuseRef.current = new Fuse(vehicles, {
      keys: [
        { name: 'make',  weight: 0.4 },
        { name: 'model', weight: 0.4 },
        { name: 'trim',  weight: 0.15 },
        { name: 'year',  weight: 0.05 },
      ],
      threshold: 0.35,
      distance: 100,
      includeScore: true,
    });
  }, [vehicles]);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    const hits = fuseRef.current.search(q, { limit: 8 }).map(r => r.item);
    setResults(hits);
    setOpen(hits.length > 0);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  const goto = (v: Vehicle) => {
    const url = `/makes/${toSlug(v.make)}/${toSlug(v.model)}/${v.year}`;
    window.location.href = url;
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Input */}
      <div
        className="relative flex items-center"
        style={{
          boxShadow: focused ? '0 0 0 2px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.15)' : '0 0 0 1px rgba(30,37,54,0.8)',
          borderRadius: '0.75rem',
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Search icon */}
        <svg className="absolute left-4 w-5 h-5 text-neon-cyan pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length) setOpen(true); }}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-12 pr-14 py-4 rounded-xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none"
          style={{ background: 'rgba(13,17,23,0.9)', backdropFilter: 'blur(12px)' }}
          aria-label="Search Canadian vehicles"
          id="vehicle-search"
        />
        {/* CAD badge */}
        <span className="absolute right-4 px-2 py-1 rounded text-xs font-mono font-bold"
          style={{ color: '#00F0FF', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
          L/100km
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(13,17,23,0.97)',
            border: '1px solid rgba(0,240,255,0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {results.map((v, i) => (
            <button
              key={v.id}
              onMouseDown={() => goto(v)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors duration-100 group"
              style={{ borderBottom: i < results.length - 1 ? '1px solid rgba(30,37,54,0.5)' : 'none' }}
            >
              {/* Year badge */}
              <span className="shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)' }}>
                {v.year}
              </span>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{v.make} {v.model}</span>
                  <span className={`text-xs ${fuelTypePill(v.fuelType)}`}>{fuelTypeLabel(v.fuelType).split(' ')[0]}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{v.trim} · {v.vehicleClass}</div>
              </div>

              {/* Efficiency */}
              <div className="shrink-0 text-right">
                {v.combinedL100km ? (
                  <div>
                    <div className="text-sm font-mono font-bold" style={{ color: '#10B981' }}>{v.combinedL100km}</div>
                    <div className="text-xs text-slate-500">L/100km</div>
                  </div>
                ) : v.kwhPer100km ? (
                  <div>
                    <div className="text-sm font-mono font-bold" style={{ color: '#8B5CF6' }}>{v.kwhPer100km}</div>
                    <div className="text-xs text-slate-500">kWh/100km</div>
                  </div>
                ) : null}
              </div>

              {/* Arrow */}
              <svg className="shrink-0 w-4 h-4 text-slate-600 group-hover:text-neon-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}

          {/* See all */}
          <div className="px-4 py-2.5 border-t border-slate-border/50">
            <a href={`/search?q=${encodeURIComponent(query)}`}
              className="text-xs font-medium hover:text-neon-cyan transition-colors"
              style={{ color: '#00C8D4' }}>
              See all results for &ldquo;{query}&rdquo; →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
