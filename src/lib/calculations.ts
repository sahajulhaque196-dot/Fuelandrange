// ─────────────────────────────────────────────────────────────────────────────
// src/lib/calculations.ts
// Core fuel economy & winter degradation calculation utilities
// All figures use Canadian metric standards (L/100km, km, CAD)
// ─────────────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vehicleClass: string;
  engineSize: number;
  cylinders: number;
  transmission: string;
  driveType: string;
  fuelType: string; // X=Regular, Z=Premium, D=Diesel, BEV, HEV, PHEV
  cityL100km: number | null;
  hwyL100km: number | null;
  combinedL100km: number | null;
  cityLe100km: number | null;
  hwyLe100km: number | null;
  combinedLe100km: number | null;
  kwhPer100km: number | null;
  electricRangeKm: number | null;
  co2GPerKm: number;
  fuelTankLitres: number | null;
  msrpCAD: number;
}

export interface Province {
  code: string;
  name: string;
  gasolineCentsPerL: number;
  premiumCentsPerL: number;
  dieselCentsPerL: number;
  electricityCentsPerKwh: number;
  carbonTax: boolean;
}

// ── Winter Penalty Constants (Canadian -15°C Baseline) ──────────────────────
export const WINTER_ICE_PENALTY_PCT   = 0.15;   // +15% fuel consumption
export const WINTER_EV_RANGE_LOSS_PCT = 0.32;   // -32% range (cabin heating)
export const WINTER_HEV_PENALTY_PCT   = 0.12;   // +12% for hybrid (smaller EV buffer)
export const WINTER_PHEV_EV_LOSS_PCT  = 0.35;   // -35% EV-only range
export const WINTER_BASELINE_CELSIUS  = -15;

// ── Fuel type helpers ────────────────────────────────────────────────────────
export function isBEV(v: Vehicle): boolean  { return v.fuelType === 'BEV'; }
export function isPHEV(v: Vehicle): boolean { return v.fuelType === 'PHEV'; }
export function isHEV(v: Vehicle): boolean  { return v.fuelType === 'HEV'; }
export function isICE(v: Vehicle): boolean  { return ['X','Z','D','E'].includes(v.fuelType); }
export function isElectric(v: Vehicle): boolean { return isBEV(v) || isPHEV(v); }

export function fuelTypeLabel(fuelType: string): string {
  const labels: Record<string, string> = {
    X: 'Regular Gasoline', Z: 'Premium Gasoline', D: 'Diesel',
    E: 'Ethanol E85', BEV: 'Battery Electric', HEV: 'Full Hybrid',
    PHEV: 'Plug-in Hybrid', B: 'Battery Electric',
  };
  return labels[fuelType] ?? fuelType;
}

export function fuelTypePill(fuelType: string): string {
  const cls: Record<string, string> = {
    X: 'fuel-pill-petrol', Z: 'fuel-pill-premium', D: 'fuel-pill-diesel',
    BEV: 'fuel-pill-bev', B: 'fuel-pill-bev',
    HEV: 'fuel-pill-hybrid', PHEV: 'fuel-pill-phev',
  };
  return cls[fuelType] ?? 'fuel-pill-petrol';
}

// ── Annual Fuel Cost Calculation (CAD) ──────────────────────────────────────
export interface AnnualCostResult {
  annualCAD: number;
  monthlyCAD: number;
  fuelPriceCentsPerUnit: number;
  unit: 'L' | 'kWh';
  kmDriven: number;
  combinedEfficiency: number; // L/100km or kWh/100km
  fuelType: 'gasoline' | 'premium' | 'diesel' | 'electric' | 'hybrid' | 'phev';
}

export function calcAnnualCost(
  vehicle: Vehicle,
  province: Province,
  kmPerYear: number,
): AnnualCostResult {
  if (isBEV(vehicle) && vehicle.kwhPer100km) {
    const eff = vehicle.kwhPer100km;
    const price = province.electricityCentsPerKwh / 100; // $ per kWh
    const annualKwh = (eff / 100) * kmPerYear;
    const annualCAD = annualKwh * price;
    return {
      annualCAD: Math.round(annualCAD),
      monthlyCAD: Math.round(annualCAD / 12),
      fuelPriceCentsPerUnit: province.electricityCentsPerKwh,
      unit: 'kWh',
      kmDriven: kmPerYear,
      combinedEfficiency: eff,
      fuelType: 'electric',
    };
  }

  if (isPHEV(vehicle) && vehicle.kwhPer100km && vehicle.combinedL100km) {
    // 60% EV mode, 40% ICE mode (typical Canadian PHEV usage)
    const evFraction = 0.60;
    const iceFraction = 0.40;
    const evKm  = kmPerYear * evFraction;
    const iceKm = kmPerYear * iceFraction;
    const evCost  = (vehicle.kwhPer100km / 100) * evKm * (province.electricityCentsPerKwh / 100);
    const icePriceL = getPricePerLitre(vehicle.fuelType, province) / 100;
    const iceCost = (vehicle.combinedL100km / 100) * iceKm * icePriceL;
    const annualCAD = evCost + iceCost;
    return {
      annualCAD: Math.round(annualCAD),
      monthlyCAD: Math.round(annualCAD / 12),
      fuelPriceCentsPerUnit: province.electricityCentsPerKwh,
      unit: 'kWh',
      kmDriven: kmPerYear,
      combinedEfficiency: vehicle.kwhPer100km,
      fuelType: 'phev',
    };
  }

  // ICE or HEV path
  const eff = vehicle.combinedL100km ?? 10;
  const priceL = getPricePerLitre(vehicle.fuelType, province) / 100; // $ per L
  const annualLitres = (eff / 100) * kmPerYear;
  const annualCAD = annualLitres * priceL;
  return {
    annualCAD: Math.round(annualCAD),
    monthlyCAD: Math.round(annualCAD / 12),
    fuelPriceCentsPerUnit: getPricePerLitre(vehicle.fuelType, province),
    unit: 'L',
    kmDriven: kmPerYear,
    combinedEfficiency: eff,
    fuelType: vehicle.fuelType === 'D' ? 'diesel' : isHEV(vehicle) ? 'hybrid' : 'gasoline',
  };
}

function getPricePerLitre(fuelType: string, province: Province): number {
  if (fuelType === 'D') return province.dieselCentsPerL;
  if (fuelType === 'Z') return province.premiumCentsPerL;
  return province.gasolineCentsPerL;
}

// ── Highway Cruising Range ───────────────────────────────────────────────────
export function calcHwyRange(vehicle: Vehicle): number | null {
  if (isBEV(vehicle)) return vehicle.electricRangeKm;
  if (!vehicle.fuelTankLitres || !vehicle.hwyL100km) return null;
  return Math.round((vehicle.fuelTankLitres / vehicle.hwyL100km) * 100);
}

// ── Winter Penalty Calculations ──────────────────────────────────────────────
export interface WinterPenaltyResult {
  winterConsumption: number | null;  // L/100km or kWh/100km in winter
  winterRange: number | null;         // km in winter (EVs)
  summerBaseline: number | null;
  lossPct: number;
  tempC: number;
  advice: string[];
}

export function calcWinterPenalty(vehicle: Vehicle): WinterPenaltyResult {
  const advice: string[] = [];

  if (isBEV(vehicle)) {
    const base = vehicle.electricRangeKm;
    if (!base) return { winterConsumption: null, winterRange: null, summerBaseline: null, lossPct: WINTER_EV_RANGE_LOSS_PCT * 100, tempC: WINTER_BASELINE_CELSIUS, advice: [] };
    const winterRange = Math.round(base * (1 - WINTER_EV_RANGE_LOSS_PCT));
    advice.push('Pre-condition battery while plugged in to minimize range loss.');
    advice.push('Use seat heaters instead of cabin air heating where possible.');
    advice.push('Plan charging stops: winter range is ~32% less than rated.');
    advice.push('Keep battery charge above 20% to preserve heat management capacity.');
    advice.push('Park in a garage where possible to reduce overnight battery cooling.');
    return {
      winterConsumption: vehicle.kwhPer100km ? +(vehicle.kwhPer100km * 1.47).toFixed(1) : null,
      winterRange,
      summerBaseline: base,
      lossPct: WINTER_EV_RANGE_LOSS_PCT * 100,
      tempC: WINTER_BASELINE_CELSIUS,
      advice,
    };
  }

  if (isPHEV(vehicle)) {
    const baseElecRange = vehicle.electricRangeKm;
    const winterRange = baseElecRange ? Math.round(baseElecRange * (1 - WINTER_PHEV_EV_LOSS_PCT)) : null;
    const baseIce = vehicle.combinedL100km;
    const winterIce = baseIce ? +(baseIce * (1 + WINTER_HEV_PENALTY_PCT)).toFixed(1) : null;
    advice.push('Pre-condition cabin via plug to conserve EV range.');
    advice.push('In extreme cold, ICE engine will run more to heat cabin — expect more fuel use.');
    advice.push('Switch to charge mode on highway to top up battery for city driving in winter.');
    return {
      winterConsumption: winterIce,
      winterRange,
      summerBaseline: baseElecRange,
      lossPct: WINTER_PHEV_EV_LOSS_PCT * 100,
      tempC: WINTER_BASELINE_CELSIUS,
      advice,
    };
  }

  if (isHEV(vehicle)) {
    const base = vehicle.combinedL100km;
    const winter = base ? +(base * (1 + WINTER_HEV_PENALTY_PCT)).toFixed(1) : null;
    advice.push('Hybrid fuel penalty is lower than pure ICE as battery pre-heating is minimal.');
    advice.push('Avoid extended idling — it reduces HEV fuel economy significantly.');
    advice.push('Switch to Eco mode to reduce cabin heating load on the battery.');
    return {
      winterConsumption: winter,
      winterRange: null,
      summerBaseline: base,
      lossPct: WINTER_HEV_PENALTY_PCT * 100,
      tempC: WINTER_BASELINE_CELSIUS,
      advice,
    };
  }

  // ICE
  const base = vehicle.combinedL100km;
  const winter = base ? +(base * (1 + WINTER_ICE_PENALTY_PCT)).toFixed(1) : null;
  advice.push('Allow 5–10 minutes warm-up in extreme cold before driving — reduces engine wear.');
  advice.push('Check tire pressure weekly in winter; cold air lowers PSI, raising rolling resistance.');
  advice.push('Use 0W-30 or 5W-30 synthetic oil for cold-start protection.');
  advice.push('Remove snow and ice from roof before driving to reduce aerodynamic drag.');
  advice.push('Avoid aggressive acceleration in slippery conditions to preserve economy.');
  return {
    winterConsumption: winter,
    winterRange: null,
    summerBaseline: base,
    lossPct: WINTER_ICE_PENALTY_PCT * 100,
    tempC: WINTER_BASELINE_CELSIUS,
    advice,
  };
}

// ── Slug helpers ─────────────────────────────────────────────────────────────
export function toSlug(str: string): string {
  return str.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[éêëè]/g, 'e')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function vehicleUrl(v: Vehicle, includeTrim = false): string {
  const base = `/makes/${toSlug(v.make)}/${toSlug(v.model)}/${v.year}`;
  return includeTrim ? `${base}/${toSlug(v.trim)}` : base;
}

export function classSlug(cls: string): string {
  return toSlug(cls);
}

export function makeUrl(make: string): string {
  return `/makes/${toSlug(make)}`;
}

// ── Compare slug ─────────────────────────────────────────────────────────────
export function compareSlug(v1: Vehicle, v2: Vehicle): string {
  return `${v1.year}-${toSlug(v1.make)}-${toSlug(v1.model)}-vs-${v2.year}-${toSlug(v2.make)}-${toSlug(v2.model)}-fuel-economy`;
}

// ── CO2 rating label ─────────────────────────────────────────────────────────
export function co2Label(co2: number): { label: string; color: string } {
  if (co2 === 0)   return { label: 'Zero Emissions', color: '#10B981' };
  if (co2 < 120)   return { label: 'Very Low',       color: '#10B981' };
  if (co2 < 160)   return { label: 'Low',            color: '#84CC16' };
  if (co2 < 200)   return { label: 'Moderate',       color: '#F59E0B' };
  if (co2 < 250)   return { label: 'High',           color: '#F97316' };
  return            { label: 'Very High',             color: '#FF2E4D' };
}

// ── Competitor lookup (same vehicleClass) ────────────────────────────────────
export function findCompetitors(vehicle: Vehicle, all: Vehicle[], n = 3): Vehicle[] {
  return all
    .filter(v => v.id !== vehicle.id
      && v.vehicleClass === vehicle.vehicleClass
      && Math.abs(v.year - vehicle.year) <= 2
    )
    .sort((a, b) => {
      // rank by fuel efficiency
      const aEff = a.combinedL100km ?? a.kwhPer100km ?? 99;
      const bEff = b.combinedL100km ?? b.kwhPer100km ?? 99;
      return aEff - bEff;
    })
    .slice(0, n);
}

// ── Format helpers ───────────────────────────────────────────────────────────
export function formatCAD(n: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}
