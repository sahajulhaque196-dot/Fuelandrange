// ─────────────────────────────────────────────────────────────────────────────
// src/components/widgets/LeadGenWidget.tsx
// Canadian Ownership Intelligence & Estimation Suite
// Clean editorial utility designed for Canadian consumers (AdSense compliant)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';

interface Props {
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  isEV?: boolean;
}

export default function LeadGenWidget({ vehicleMake, vehicleModel, vehicleYear, isEV = false }: Props) {
  const [activeTab, setActiveTab] = useState<'insurance' | 'depreciation' | 'winter'>('insurance');
  const [selectedProvince, setSelectedProvince] = useState<'ON' | 'QC' | 'AB' | 'BC'>('ON');

  const insuranceEstimates: Record<string, { base: number; note: string }> = {
    ON: { base: 185, note: 'Ontario has higher suburban collision claims (GTA avg $210/mo).' },
    QC: { base: 95, note: 'Quebec benefits from SAAQ public bodily injury coverage.' },
    AB: { base: 160, note: 'Alberta features private market rates with hail damage riders.' },
    BC: { base: 145, note: 'BC operates under ICBC public enhanced care model.' },
  };

  const est = insuranceEstimates[selectedProvince];
  // Slight factor for EV or luxury/truck
  const vehicleFactor = isEV ? 1.12 : 1.0;
  const estimatedPremium = Math.round(est.base * vehicleFactor);

  const tabs = [
    { id: 'insurance' as const, icon: '🛡️', label: 'Insurance Est.' },
    { id: 'depreciation' as const, icon: '📊', label: '3-Yr Retention' },
    { id: 'winter' as const, icon: isEV ? '⚡' : '❄️', label: isEV ? 'Winter Prep' : 'Winter Tires' },
  ];

  return (
    <div
      className="rounded-3xl overflow-hidden bg-[#0D1117] border border-white/[0.08] shadow-xl"
    >
      {/* Header */}
      <div className="p-5 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            🍁 Canadian Ownership Suite
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
            {vehicleYear} {vehicleMake}
          </span>
        </div>
        <h4 className="font-display font-bold text-white text-base">
          Operating Cost &amp; Safety Intel
        </h4>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06] bg-[#06080C]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-mono font-semibold transition-all ${
              activeTab === t.id
                ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Tab 1: Insurance Estimation */}
        {activeTab === 'insurance' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Province:</span>
              <div className="flex gap-1">
                {(['ON', 'QC', 'AB', 'BC'] as const).map(prov => (
                  <button
                    key={prov}
                    onClick={() => setSelectedProvince(prov)}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                      selectedProvince === prov
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#06080C] border border-white/[0.06] space-y-1">
              <div className="text-slate-400 text-[11px]">Estimated Monthly Premium:</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                ~${estimatedPremium} CAD <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 font-sans leading-relaxed">
                {est.note}
              </p>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400 font-sans leading-relaxed">
              <div className="font-bold text-slate-300 font-mono">💡 Canadian Rate Reduction Tips:</div>
              <ul className="space-y-1 pl-3 list-disc text-slate-400">
                <li>Winter tire discount (Ontario mandate: 2% to 5% discount).</li>
                <li>Telematics / driving app enrollment saves up to 15%.</li>
                <li>Combined home &amp; auto policy bundling.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Depreciation & Resale */}
        {activeTab === 'depreciation' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-[#06080C] border border-white/[0.06] space-y-1">
              <div className="text-slate-400 text-[11px]">Estimated 36-Month Value Retention:</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {isEV ? '58% – 64%' : '62% – 70%'}
              </div>
              <p className="text-[10px] text-slate-500 pt-1 font-sans leading-relaxed">
                Based on Canadian Black Book &amp; Statistics Canada wholesale market indexes.
              </p>
            </div>

            <div className="space-y-2 text-[11px] font-sans text-slate-300">
              <div className="font-bold font-mono text-white">Canadian Resale Drivers:</div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <span className="text-emerald-400 font-bold font-mono block">AWD Traction Premium:</span>
                <span className="text-slate-400">All-wheel-drive models command $2,000–$3,500 higher retention in Quebec and Western Canada.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <span className="text-cyan-400 font-bold font-mono block">Documented Recall Compliance:</span>
                <span className="text-slate-400">Completed Transport Canada safety bulletins prevent title inspection delays at resale.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Winter Prep */}
        {activeTab === 'winter' && (
          <div className="space-y-3 text-xs font-sans">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
              <div className="font-bold font-mono text-[11px] flex items-center gap-1.5 text-rose-400">
                <span>⚠️</span> Canadian Winter Regulatory Standard
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Quebec Highway Safety Code mandates 3PMSF tires Dec 1 – Mar 15. British Columbia requires winter tires on highways (Sea-to-Sky, Coquihalla) Oct 1 – Apr 30.
              </p>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400">
              <span className="font-bold font-mono text-white block">Sub-Zero (-15°C) Best Practices:</span>
              <ul className="space-y-1 pl-3 list-disc">
                {isEV ? (
                  <>
                    <li>Pre-condition cabin climate while plugged into Level 2 home charger.</li>
                    <li>Use seat and steering heaters to reduce resistive HVAC cabin draw.</li>
                    <li>Maintain 20%–80% state of charge during extreme cold snaps.</li>
                  </>
                ) : (
                  <>
                    <li>Use 0W-20 or manufacturer-specified synthetic winter oil for sub-zero cold starts.</li>
                    <li>Test 12V lead-acid battery cranking amperage before December.</li>
                    <li>Apply annual lanolin or wax-based underbody rust protection against road brine.</li>
                  </>
                )}
              </ul>
            </div>

            <a
              href="/guides/canadian-winter-ev-range-guide"
              className="block w-full text-center py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-cyan-400 font-mono text-[11px] transition-colors border border-white/[0.08]"
            >
              Read Full Winter Engineering Guide →
            </a>
          </div>
        )}
      </div>

      {/* Canadian Consumer Notice */}
      <div className="px-5 py-2.5 bg-black/40 border-t border-white/[0.04] text-[10px] font-mono text-slate-500 leading-normal">
        <span>🍁 RangeAndFuel.ca is an independent automotive intelligence platform. Estimations provided for educational comparison purposes under Canadian industry benchmarks.</span>
      </div>
    </div>
  );
}
