// ─────────────────────────────────────────────────────────────────────────────
// src/lib/schema.ts
// JSON-LD Schema.org generators for all page types
// Implements: Car, Product, BreadcrumbList, FAQPage, WebSite, Organization, ContactPage, Dataset
// ─────────────────────────────────────────────────────────────────────────────

import type { Vehicle } from './calculations.js';
import { fuelTypeLabel, calcHwyRange, toSlug } from './calculations.js';

const SITE_URL = 'https://rangeandfuel.ca';
const SITE_NAME = 'RangeAndFuel.ca';

// ── Organization ─────────────────────────────────────────────────────────────
export function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Canada's authoritative source for vehicle fuel consumption ratings (L/100km), real-world provincial CAD fuel costs, EV winter range, and Transport Canada safety recalls.",
    areaServed: { '@type': 'Country', name: 'Canada' },
    knowsAbout: ['Fuel Consumption', 'Electric Vehicles', 'Transport Canada Recalls', 'Canadian Automotive'],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'editorial',
        email: 'editorial@rangeandfuel.ca',
        areaServed: 'CA',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'technical support',
        email: 'data@rangeandfuel.ca',
        areaServed: 'CA',
      },
    ],
  };
}

// ── WebSite (Sitelinks Searchbox) ────────────────────────────────────────────
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ── BreadcrumbList ───────────────────────────────────────────────────────────
export interface BreadcrumbItem { name: string; url: string; }

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
}

// ── Vehicle / Car schema ─────────────────────────────────────────────────────
export function vehicleSchema(v: Vehicle, customUrl?: string) {
  const hwyRange = calcHwyRange(v);
  const isBEV = v.fuelType === 'BEV';
  const isPHEV = v.fuelType === 'PHEV';
  const isEV = isBEV || isPHEV;

  const pageUrl = customUrl
    ? `${SITE_URL}${customUrl.startsWith('/') ? customUrl : `/${customUrl}`}`
    : `${SITE_URL}/makes/${toSlug(v.make)}/${toSlug(v.model)}/${v.year}`;

  const additionalProps: Array<{ '@type': string; name: string; value: string | number }> = [
    {
      '@type': 'PropertyValue',
      name: 'Testing Standard',
      value: 'NRCan EnerGuide 5-Cycle Laboratory Testing',
    },
    {
      '@type': 'PropertyValue',
      name: 'Target Market',
      value: 'Canada (CAD $ Pricing & Metric Standards)',
    },
  ];

  if (hwyRange) {
    additionalProps.push({
      '@type': 'PropertyValue',
      name: 'Estimated Highway Cruising Range',
      value: `${hwyRange} km`,
    });
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${v.year} ${v.make} ${v.model} ${v.trim}`,
    brand: {
      '@type': 'Brand',
      name: v.make,
    },
    manufacturer: {
      '@type': 'Organization',
      name: v.make,
    },
    model: v.model,
    vehicleModelDate: String(v.year),
    bodyType: v.vehicleClass,
    driveWheelConfiguration: driveTypeSchema(v.driveType),
    numberOfForwardGears: transmissionGears(v.transmission),
    fuelType: fuelTypeLabel(v.fuelType),
    vehicleTransmission: v.transmission,
    itemCondition: 'https://schema.org/NewCondition',
    description: buildVehicleDescription(v),
    url: pageUrl,
    additionalProperty: additionalProps,
  };

  if (v.engineSize > 0) {
    schema['engineDisplacement'] = {
      '@type': 'QuantitativeValue',
      value: v.engineSize,
      unitCode: 'LTR',
    };
    schema['vehicleEngine'] = {
      '@type': 'EngineSpecification',
      name: `${v.engineSize}L ${v.cylinders}-Cylinder`,
      engineDisplacement: {
        '@type': 'QuantitativeValue',
        value: v.engineSize,
        unitCode: 'LTR',
      },
    };
  }

  if (v.fuelTankLitres && v.fuelTankLitres > 0) {
    schema['fuelCapacity'] = {
      '@type': 'QuantitativeValue',
      value: v.fuelTankLitres,
      unitCode: 'LTR',
      unitText: 'Litres',
    };
  }

  if (v.combinedL100km) {
    schema['fuelConsumption'] = {
      '@type': 'QuantitativeValue',
      value: v.combinedL100km,
      unitCode: 'L/100km',
      unitText: 'L/100km (Combined NRCan)',
    };
    schema['fuelEfficiency'] = {
      '@type': 'QuantitativeValue',
      value: v.cityL100km ?? v.combinedL100km,
      unitCode: 'L/100km',
      unitText: 'L/100km (City NRCan)',
    };
  }

  if (v.kwhPer100km) {
    schema['powerConsumption'] = {
      '@type': 'QuantitativeValue',
      value: v.kwhPer100km,
      unitCode: 'KWH',
      unitText: 'kWh/100km',
    };
  }

  if (isEV && v.electricRangeKm) {
    schema['vehicleRange'] = {
      '@type': 'QuantitativeValue',
      value: v.electricRangeKm,
      unitCode: 'KMT',
      unitText: 'km (Official NRCan Range)',
    };
  }

  if (v.co2GPerKm > 0) {
    schema['emissionsCO2'] = {
      '@type': 'QuantitativeValue',
      value: v.co2GPerKm,
      unitText: 'g CO₂/km',
    };
  }

  if (v.msrpCAD) {
    schema['offers'] = {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      price: v.msrpCAD,
      priceValidUntil: `${v.year + 2}-12-31`,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Authorized Canadian Automotive Dealers',
        areaServed: { '@type': 'Country', name: 'Canada' },
      },
    };
  }

  return schema;
}

// ── FAQPage Schema ────────────────────────────────────────────────────────────
export function faqSchema(vehicle: Vehicle, provinceName = 'Ontario') {
  const isBEV = vehicle.fuelType === 'BEV';
  const isPHEV = vehicle.fuelType === 'PHEV';
  const hwyRange = calcHwyRange(vehicle);

  const faqs = [
    {
      q: `What is the official NRCan fuel consumption rating for the ${vehicle.year} ${vehicle.make} ${vehicle.model}?`,
      a: vehicle.combinedL100km
        ? `The ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} achieves an official Natural Resources Canada (NRCan) EnerGuide rating of ${vehicle.combinedL100km} L/100km combined (${vehicle.cityL100km} L/100km city, ${vehicle.hwyL100km} L/100km highway).`
        : isBEV
        ? `The ${vehicle.year} ${vehicle.make} ${vehicle.model} is a pure battery electric vehicle (BEV) with an energy efficiency rating of ${vehicle.kwhPer100km} kWh/100km combined, delivering an estimated ${vehicle.electricRangeKm} km of all-electric range.`
        : `Please refer to the telemetry cards above for complete EnerGuide 5-cycle testing ratings.`,
    },
    {
      q: `How much does it cost to fuel or charge a ${vehicle.year} ${vehicle.make} ${vehicle.model} annually in ${provinceName}?`,
      a: `Based on current ${provinceName} energy tariffs and an average Canadian driving distance of 20,000 km per year, estimated annual operational energy costs range between $950 CAD and $2,600 CAD depending on regional pump prices or residential hydro tariffs.`,
    },
    {
      q: `What is the realistic winter cold weather range of the ${vehicle.year} ${vehicle.make} ${vehicle.model} at -15°C?`,
      a: isBEV
        ? `In Canadian sub-zero conditions (-15°C), the ${vehicle.year} ${vehicle.make} ${vehicle.model} experiences approximately 32% degradation in battery range due to cabin thermal heating and electrolyte viscosity, delivering ~${Math.round((vehicle.electricRangeKm ?? 400) * 0.68)} km of realistic winter range.`
        : isPHEV
        ? `At -15°C, pure EV battery range is reduced by ~35%, with the onboard internal combustion engine kicking in to support cabin thermal conditioning and maintain performance.`
        : `At -15°C, cold engine start cycles and increased air density introduce a 12% to 15% winter fuel consumption penalty across Canadian provinces.`,
    },
    {
      q: `Are there any open Transport Canada safety recalls on the ${vehicle.year} ${vehicle.make} ${vehicle.model}?`,
      a: `Transport Canada actively catalogs defect investigations under the Motor Vehicle Safety Act (MVSA). Check our dedicated Safety Recalls tab for active bulletins or verify with your 17-digit VIN at tc.canada.ca.`,
    },
    {
      q: `What is the cruising highway range of the ${vehicle.year} ${vehicle.make} ${vehicle.model}?`,
      a: hwyRange
        ? `The ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} achieves a calculated continuous highway range of ~${hwyRange} km on a full ${vehicle.fuelTankLitres ? `${vehicle.fuelTankLitres}L` : ''} tank based on its ${vehicle.hwyL100km} L/100km highway rating.`
        : isBEV
        ? `The ${vehicle.year} ${vehicle.make} ${vehicle.model} delivers up to ${vehicle.electricRangeKm} km of rated range on a 100% state of charge under optimal temperatures.`
        : `Cruising range is dynamically calculated from tank volume and NRCan highway consumption figures.`,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

// ── Make Hub schema ───────────────────────────────────────────────────────────
export function makeHubSchema(make: string, models: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${make} Vehicle Fuel Consumption Ratings — Canada`,
    description: `Complete NRCan fuel consumption ratings (L/100km) and provincial fuel cost estimates for all ${make} vehicles sold in Canada.`,
    numberOfItems: models.length,
    itemListElement: models.map((model, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${make} ${model}`,
      url: `${SITE_URL}/makes/${toSlug(make)}/${toSlug(model)}`,
    })),
  };
}

// ── Recall page schema ────────────────────────────────────────────────────────
export interface RecallData {
  recallId: string;
  make: string;
  model: string;
  years: number[];
  system: string;
  component: string;
  defectSummary: string;
  correctiveAction: string;
  recallDate: string;
  cmvssNumber: string;
  safetyRisk: string;
  affectedUnits: number;
}

export function recallSchema(recall: RecallData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: `Transport Canada Safety Recall ${recall.cmvssNumber} — ${recall.make} ${recall.model}`,
    description: recall.defectSummary,
    serviceType: 'Vehicle Safety Recall',
    provider: {
      '@type': 'GovernmentOrganization',
      name: 'Transport Canada',
      url: 'https://tc.canada.ca',
    },
    areaServed: { '@type': 'Country', name: 'Canada' },
    dateModified: recall.recallDate,
  };
}

// ── ContactPage schema ───────────────────────────────────────────────────────
export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact Us — Editorial Bureau & Data Verification | ${SITE_NAME}`,
    description: `Official contact and editorial desk for ${SITE_NAME}. Submit NRCan data inquiries, safety recall bulletins, and media requests.`,
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'editorial',
          email: 'editorial@rangeandfuel.ca',
          areaServed: 'CA',
          availableLanguage: ['English', 'French'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'technical support',
          email: 'data@rangeandfuel.ca',
          areaServed: 'CA',
          availableLanguage: ['English'],
        },
      ],
    },
  };
}

// ── Dataset schema (NRCan Government Ratings Authority) ───────────────────────
export function nrcanDatasetSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Canadian Comprehensive Motor Vehicle Fuel Consumption & Range Dataset',
    description: 'Natural Resources Canada (NRCan) 5-cycle laboratory testing dataset covering L/100km, kWh/100km, CO₂ emissions, and Transport Canada safety bulletins for light-duty vehicles.',
    url: SITE_URL,
    license: 'https://open.canada.ca/en/open-government-licence-canada',
    isAccessibleForFree: true,
    creator: {
      '@type': 'GovernmentOrganization',
      name: 'Natural Resources Canada (NRCan)',
      url: 'https://natural-resources.canada.ca',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    spatialCoverage: {
      '@type': 'Place',
      name: 'Canada',
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function driveTypeSchema(driveType: string): string {
  const map: Record<string, string> = {
    FWD: 'FrontWheelDriveConfiguration',
    RWD: 'RearWheelDriveConfiguration',
    AWD: 'AllWheelDriveConfiguration',
    '4WD': 'FourWheelDriveConfiguration',
  };
  return map[driveType] ?? driveType;
}

function transmissionGears(tx: string): number {
  if (!tx) return 1;
  if (/cvt|ecvt|direct|single|1-speed|a1/i.test(tx)) return 1;
  const match = tx.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

function buildVehicleDescription(v: Vehicle): string {
  const isBEV = v.fuelType === 'BEV';
  const eff = isBEV
    ? `${v.kwhPer100km} kWh/100km with ${v.electricRangeKm} km range`
    : `${v.combinedL100km} L/100km combined`;
  return `The ${v.year} ${v.make} ${v.model} ${v.trim} is a ${v.vehicleClass} sold in Canada with ${eff} according to NRCan fuel consumption ratings. It features a ${v.driveType} drivetrain and ${v.transmission} transmission. CO₂ emissions: ${v.co2GPerKm} g/km.`;
}
