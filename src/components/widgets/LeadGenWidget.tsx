// ─────────────────────────────────────────────────────────────────────────────
// src/components/widgets/LeadGenWidget.tsx
// High-ticket Canadian lead-gen & affiliate callouts — React Island client:visible
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';

interface Props {
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  isEV?: boolean;
}

export default function LeadGenWidget({ vehicleMake, vehicleModel, vehicleYear, isEV = false }: Props) {
  const [activeTab, setActiveTab] = useState<'insurance' | 'tradein' | 'tires'>('insurance');

  const tabs = [
    { id: 'insurance' as const, icon: '🛡️', label: 'Insurance' },
    { id: 'tradein'   as const, icon: '🔄', label: 'Trade-In Value' },
    { id: 'tires'    as const, icon: isEV ? '⚡' : '❄️', label: isEV ? 'EV Charger' : 'Winter Tires' },
  ];

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(30,37,54,0.8)' }}>

      {/* Tab bar */}
      <div className="flex border-b border-slate-border/50">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold transition-all duration-150"
            style={{
              color: activeTab === t.id ? '#00F0FF' : '#94A3B8',
              background: activeTab === t.id ? 'rgba(0,240,255,0.05)' : 'transparent',
              borderBottom: activeTab === t.id ? '2px solid #00F0FF' : '2px solid transparent',
            }}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {activeTab === 'insurance' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-display font-bold text-white text-base mb-1">
                Compare Canadian Auto Insurance Rates
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get competitive quotes from 30+ Canadian insurers. Drivers save an average of $542/yr by comparing rates.
                {vehicleMake && ` Get a ${vehicleYear} ${vehicleMake} ${vehicleModel}-specific quote.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {['TD Insurance', 'Intact Insurance', 'Aviva Canada', 'Economical'].map(ins => (
                <div key={ins} className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-efficiency-green" />
                  {ins}
                </div>
              ))}
            </div>

            <a
              href="https://www.lowestrates.ca/insurance/auto"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-neon w-full justify-center text-sm"
              id="cta-insurance-compare"
            >
              Compare Rates — Free, No Obligation →
            </a>
            <p className="text-xs text-slate-600 text-center">Sponsored · LowestRates.ca · Licensed Canadian broker</p>
          </div>
        )}

        {activeTab === 'tradein' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-display font-bold text-white text-base mb-1">
                Get an Instant Canadian Trade-In Offer
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get a guaranteed cash offer for your current vehicle in 2 minutes. No dealer games.
                Canadian market valuations from AutoTrader and CARFAX Canada data.
              </p>
            </div>

            <div className="rounded-xl p-3 space-y-2.5" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Vehicle</span>
                <span className="text-white font-medium">
                  {vehicleYear} {vehicleMake} {vehicleModel}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Market</span>
                <span className="text-efficiency-green font-mono font-bold">Canada</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Currency</span>
                <span className="text-efficiency-green font-mono font-bold">CAD $</span>
              </div>
            </div>

            <a
              href="https://www.clutch.ca/sell"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-green w-full justify-center text-sm"
              id="cta-tradein-offer"
            >
              Get My Instant Cash Offer →
            </a>
            <p className="text-xs text-slate-600 text-center">Sponsored · Clutch.ca · Canada&apos;s online car marketplace</p>
          </div>
        )}

        {activeTab === 'tires' && isEV && (
          <div className="space-y-4">
            <div>
              <h4 className="font-display font-bold text-white text-base mb-1">
                Level 2 Home EV Charger Installation
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Charge overnight at home. Level 2 (240V) EVSE chargers add 30–60 km of range per hour,
                perfect for Canadian winters when daily range is critical. Qualifies for federal and provincial rebates.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {['FLO Home', 'ChargePoint Home', 'Wallbox Pulsar', 'Eaton Green'].map(brand => (
                <div key={brand} className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-ev" />
                  {brand}
                </div>
              ))}
            </div>

            <a
              href="https://www.flo.com/ev-charging-home"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border text-purple-ev border-purple-ev hover:bg-purple-ev/10 transition-all duration-200"
              id="cta-ev-charger"
            >
              Shop Home EV Chargers + Rebates →
            </a>
            <p className="text-xs text-slate-600 text-center">Affiliate · FLO Canada · Eligible for federal iZEV EV charger incentive</p>
          </div>
        )}

        {activeTab === 'tires' && !isEV && (
          <div className="space-y-4">
            <div>
              <h4 className="font-display font-bold text-white text-base mb-1">
                Canadian Winter Tires — Essential for Safety
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Winter tires reduce braking distance by up to 25% on snow and ice vs all-seasons.
                Required by law October 15 – April 15 in Quebec. Heavily recommended across all Canadian provinces.
              </p>
            </div>

            <div className="rounded-xl p-3 text-xs space-y-1.5" style={{ background: 'rgba(255,46,77,0.05)', border: '1px solid rgba(255,46,77,0.15)' }}>
              <div className="flex items-center gap-2 text-canadian-crimson font-semibold">
                <span>⚠️</span> Quebec Law: Winter tires mandatory Dec 1 – Mar 15
              </div>
              <div className="text-slate-400">Mountain snowflake (3PMSF) symbol required for winter use</div>
            </div>

            <a
              href="https://www.canadiantire.ca/en/cat/automotive/tires-wheels/winter-tires-DC0001858.html"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-crimson w-full justify-center text-sm font-bold"
              id="cta-winter-tires"
            >
              Shop Canadian Tire Winter Package →
            </a>
            <p className="text-xs text-slate-600 text-center">Affiliate · 500+ Canadian stores · Professional installation nationwide</p>
          </div>
        )}
      </div>
    </div>
  );
}
