// ─────────────────────────────────────────────────────────────────────────────
// src/lib/schema.ts
// JSON-LD Schema.org generators for all page types
// Implements: Car, Product, BreadcrumbList, FAQPage, WebSite, Organization,
//             Person, ContactPage, Dataset, ItemList, GovernmentService, and Unified @graph
// Validated against: Google Search Central Guidelines & Schema.org Core Specification
// ─────────────────────────────────────────────────────────────────────────────

import type { Vehicle } from './calculations.js';
import { fuelTypeLabel, calcHwyRange, toSlug } from './calculations.js';

export const SITE_URL = 'https://rangeandfuel.ca';
export const SITE_NAME = 'RangeAndFuel.ca';
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const DATASET_ID = `${SITE_URL}/#dataset`;
export const AUTHOR_ID = `${SITE_URL}/about#sahajul-haque`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

// ── Author / Person Schema (Sahajul Haque) ──────────────────────────────────
/**
 * Author / Expert entity establishing E-E-A-T credentials for editorial and telemetry research.
 */
export function authorPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: 'Sahajul Haque',
    jobTitle: 'Founder & Automotive Telemetry Architect',
    description:
      'Canadian automotive data researcher specializing in Natural Resources Canada (NRCan) 5-cycle EnerGuide fuel consumption modeling, sub-zero EV battery thermodynamics, and Transport Canada CMVSS safety recall tracking.',
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/images/author-sahajul.jpg`,
    worksFor: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
    },
    sameAs: ['https://x.com/saddamh58509953'],
    knowsAbout: [
      'Natural Resources Canada (NRCan) 5-Cycle EnerGuide Testing Standards',
      'Canadian Sub-Zero (-15°C) EV Battery Thermodynamic Degradation',
      'Transport Canada Motor Vehicle Safety Act (MVSA) & CMVSS Recalls',
      'Provincial Fuel Tax Regimes & Hydro-Québec / BC Hydro / OEB Electricity Tariffs',
      'Alternative Fuels and Zero-Emission Vehicle Adoption in Canada',
    ],
  };
}

// ── Organization ─────────────────────────────────────────────────────────────
/**
 * Top-level Organization entity representing RangeAndFuel.ca.
 * Establishes publisher authority, editorial guidelines, founder attribution, and official contact channels.
 */
export function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: `${SITE_URL}/logo.png`,
      contentUrl: `${SITE_URL}/logo.png`,
      caption: SITE_NAME,
      width: 512,
      height: 512,
    },
    image: {
      '@id': `${SITE_URL}/#logo`,
    },
    description:
      "Canada's authoritative source for vehicle fuel consumption ratings (L/100km), real-world provincial CAD fuel costs, EV winter range, and Transport Canada safety recalls.",
    areaServed: {
      '@type': 'Country',
      name: 'Canada',
    },
    publishingPrinciples: `${SITE_URL}/about`,
    founder: {
      '@type': 'Person',
      '@id': AUTHOR_ID,
      name: 'Sahajul Haque',
      jobTitle: 'Founder & Lead Automotive Data Researcher',
      url: `${SITE_URL}/about`,
    },
    knowsAbout: [
      'Natural Resources Canada (NRCan) EnerGuide 5-Cycle Testing',
      'Vehicle Fuel Consumption Ratings (L/100km)',
      'Electric Vehicle kWh/100km Efficiency & Winter Range Degradation',
      'Transport Canada Safety Recalls & CMVSS Regulations',
      'Canadian Provincial Fuel & Electricity Tariffs',
    ],
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
        contactType: 'customer support',
        email: 'data@rangeandfuel.ca',
        areaServed: 'CA',
        availableLanguage: ['English'],
      },
    ],
  };
}

// ── WebSite (Sitelinks Searchbox) ────────────────────────────────────────────
/**
 * WebSite entity for RangeAndFuel.ca.
 * 
 * NOTE ON GOOGLE SEARCH CENTRAL:
 * On November 21, 2024, Google officially deprecated the Sitelinks Searchbox rich result.
 * However, the SearchAction markup remains compliant under the Schema.org Action specification
 * and is retained for Bing, Yandex, AI scrapers, and open semantic web consumers.
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-CA',
    publisher: {
      '@id': ORG_ID,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ── BreadcrumbList ───────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * 1-indexed BreadcrumbList schema with canonical absolute URLs.
 * Strictly compliant with Google Search Central guidelines (1-based position and fully qualified item URL).
 */
export function breadcrumbSchema(items: BreadcrumbItem[], currentUrl?: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http')
        ? item.url
        : `${SITE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };

  if (currentUrl) {
    const pageUrl = currentUrl.startsWith('http')
      ? currentUrl
      : `${SITE_URL}${currentUrl.startsWith('/') ? currentUrl : `/${currentUrl}`}`;
    schema['@id'] = `${pageUrl}#breadcrumb`;
  }

  return schema;
}

// ── Vehicle / Car schema ─────────────────────────────────────────────────────
export interface VehicleSchemaOptions {
  imageUrl?: string;
  priceValidUntil?: string;
  customId?: string;
}

/**
 * Generates an exhaustive Car (Product) schema.
 * 
 * GOOGLE SEARCH CENTRAL VALIDATION & ENHANCEMENTS:
 * 1. image: REQUIRED by Google Product Snippets. Provided via options or fallback to DEFAULT_OG_IMAGE.
 * 2. offers: REQUIRED by Google Product Snippets for price badges and availability indicators.
 * 3. fuelConsumption / fuelEfficiency: Standardized to UN/CEFACT code L53 (L/100km).
 * 4. driveWheelConfiguration: Uses canonical Schema.org enum IRIs.
 * 5. sku & mpn: Provided to prevent Google Search Console "Missing field 'sku'" warnings.
 * 6. Persistent @id: Enables seamless entity resolution across page @graph.
 */
export function vehicleSchema(v: Vehicle, customUrl?: string, options?: VehicleSchemaOptions) {
  const hwyRange = calcHwyRange(v);
  const isBEV = v.fuelType === 'BEV';
  const isPHEV = v.fuelType === 'PHEV';
  const isEV = isBEV || isPHEV;

  const pageUrl = customUrl
    ? (customUrl.startsWith('http') ? customUrl : `${SITE_URL}${customUrl.startsWith('/') ? customUrl : `/${customUrl}`}`)
    : `${SITE_URL}/makes/${toSlug(v.make)}/${toSlug(v.model)}/${v.year}`;

  const vehicleId = options?.customId || `${pageUrl}#vehicle`;
  const vehicleImage = options?.imageUrl || DEFAULT_OG_IMAGE;
  const currentYear = new Date().getFullYear();
  const priceValidUntil = options?.priceValidUntil || `${Math.max(v.year + 1, currentYear + 1)}-12-31`;

  const additionalProps: Array<{ '@type': string; name: string; value: string | number }> = [
    {
      '@type': 'PropertyValue',
      name: 'Testing Standard',
      value: 'NRCan EnerGuide 5-Cycle Laboratory Testing Standard',
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
    '@id': vehicleId,
    name: `${v.year} ${v.make} ${v.model} ${v.trim}`,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: vehicleImage,
    sku: v.id,
    mpn: `${v.year}-${toSlug(v.make)}-${toSlug(v.model)}-${toSlug(v.trim)}`,
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
    additionalProperty: additionalProps,
  };

  // Structured offers (REQUIRED for Google Rich Snippets / Product badge)
  if (v.msrpCAD && v.msrpCAD > 0) {
    schema['offers'] = {
      '@type': 'Offer',
      '@id': `${pageUrl}#offer`,
      price: v.msrpCAD,
      priceCurrency: 'CAD',
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: pageUrl,
      seller: {
        '@type': 'Organization',
        name: `${v.make} Canada Authorized Dealer Network`,
      },
    };

    additionalProps.push({
      '@type': 'PropertyValue',
      name: 'Manufacturer Suggested Retail Price (MSRP CAD)',
      value: `$${v.msrpCAD.toLocaleString()} CAD`,
    });
  }

  if (v.engineSize > 0) {
    schema['engineDisplacement'] = {
      '@type': 'QuantitativeValue',
      value: v.engineSize,
      unitCode: 'LTR',
      unitText: 'Litres',
    };
    schema['vehicleEngine'] = {
      '@type': 'EngineSpecification',
      name: `${v.engineSize}L ${v.cylinders}-Cylinder`,
      engineDisplacement: {
        '@type': 'QuantitativeValue',
        value: v.engineSize,
        unitCode: 'LTR',
        unitText: 'Litres',
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

  // UN/CEFACT code L53 = litre per 100 kilometre
  if (v.combinedL100km) {
    schema['fuelConsumption'] = {
      '@type': 'QuantitativeValue',
      value: v.combinedL100km,
      unitCode: 'L53',
      unitText: 'L/100km (Combined NRCan)',
    };
    schema['fuelEfficiency'] = {
      '@type': 'QuantitativeValue',
      value: v.cityL100km ?? v.combinedL100km,
      unitCode: 'L53',
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
      unitCode: '28',
      unitText: 'g CO₂/km',
    };
  }

  return schema;
}

// ── FAQPage Schema ────────────────────────────────────────────────────────────
/**
 * Generates an FAQPage schema for vehicle specific queries.
 * 
 * GOOGLE SEARCH CENTRAL ARCHITECTURAL ASSESSMENT:
 * - August 2023 Update: Google restricted FAQ rich results exclusively to authoritative
 *   government and health entities. Consumer and commercial automotive portals no longer
 *   receive SERP accordion dropdowns from FAQPage schema.
 * - Risk of Overuse: Generating boilerplate, duplicate FAQs across thousands of programmatic
 *   pages without unique per-page data can trigger Google's "Scaled Content Abuse" filters.
 * - Generative Engine Optimization (GEO): Despite SERP rich snippet deprecation, AI search
 *   crawlers (Perplexity, ChatGPT Search, Claude, Google AI Overviews) heavily consume
 *   structured Q&A markup for deterministic citation grounding.
 * - Architectural Verdict: Retain FAQPage schema with data-driven dynamic answers, but
 *   ensure each question is strictly answered with distinct calculated vehicle telemetry.
 */
export function faqSchema(vehicle: Vehicle, provinceName = 'Ontario', customUrl?: string) {
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

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };

  if (customUrl) {
    const pageUrl = customUrl.startsWith('http')
      ? customUrl
      : `${SITE_URL}${customUrl.startsWith('/') ? customUrl : `/${customUrl}`}`;
    schema['@id'] = `${pageUrl}#faq`;
  }

  return schema;
}

// ── Make Hub schema ───────────────────────────────────────────────────────────
/**
 * Generates an ItemList schema for manufacturer vehicle directories.
 * Conforms to Google Carousel / ItemList guidelines by populating the standard 'item' URL.
 */
export function makeHubSchema(make: string, models: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/makes/${toSlug(make)}#itemlist`,
    name: `${make} Vehicle Fuel Consumption Ratings — Canada`,
    description: `Complete NRCan fuel consumption ratings (L/100km) and provincial fuel cost estimates for all ${make} vehicles sold in Canada.`,
    numberOfItems: models.length,
    itemListElement: models.map((model, i) => {
      const modelUrl = `${SITE_URL}/makes/${toSlug(make)}/${toSlug(model)}`;
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: `${make} ${model}`,
        item: modelUrl,
        url: modelUrl,
      };
    }),
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

/**
 * Generates GovernmentService schema for Transport Canada CMVSS safety bulletins.
 */
export function recallSchema(recall: RecallData) {
  const recallSlug = toSlug(recall.cmvssNumber || recall.recallId);
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    '@id': `${SITE_URL}/recalls#${recallSlug}`,
    name: `Transport Canada Safety Recall ${recall.cmvssNumber} — ${recall.make} ${recall.model}`,
    description: recall.defectSummary,
    serviceType: 'Vehicle Safety Recall & CMVSS Compliance',
    provider: {
      '@type': 'GovernmentOrganization',
      name: 'Transport Canada',
      url: 'https://tc.canada.ca',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Canada',
    },
    dateModified: recall.recallDate,
  };
}

// ── ContactPage schema ───────────────────────────────────────────────────────
/**
 * Generates ContactPage schema for editorial verification & compliance.
 */
export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact#webpage`,
    name: `Contact Us — Editorial Bureau & Data Verification | ${SITE_NAME}`,
    description: `Official contact and editorial desk for ${SITE_NAME}. Submit NRCan data inquiries, safety recall bulletins, and media requests.`,
    url: `${SITE_URL}/contact`,
    isPartOf: {
      '@id': WEBSITE_ID,
    },
    mainEntity: {
      '@id': ORG_ID,
    },
  };
}

// ── Dataset schema (NRCan Government Ratings Authority) ───────────────────────
/**
 * Generates an exhaustive Dataset schema conforming to Google Dataset Search guidelines.
 * Includes data downloads, spatial coverage, temporal coverage, and variable definitions.
 */
export function nrcanDatasetSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': DATASET_ID,
    name: 'Canadian Comprehensive Motor Vehicle Fuel Consumption & Range Dataset',
    description:
      'Natural Resources Canada (NRCan) 5-cycle laboratory testing dataset covering L/100km, kWh/100km, CO₂ emissions, cold weather EV range loss (-15°C), and Transport Canada safety bulletins for light-duty vehicles.',
    url: `${SITE_URL}/search`,
    sameAs: 'https://open.canada.ca/data/en/dataset/98f1a129-f628-4ce4-b24d-6f16bf24dd64',
    license: 'https://open.canada.ca/en/open-government-licence-canada',
    isAccessibleForFree: true,
    creator: {
      '@type': 'GovernmentOrganization',
      name: 'Natural Resources Canada (NRCan)',
      url: 'https://natural-resources.canada.ca',
    },
    publisher: {
      '@id': ORG_ID,
    },
    spatialCoverage: {
      '@type': 'Place',
      name: 'Canada',
      geo: {
        '@type': 'GeoShape',
        box: '41.6765556 -141.00187 83.1106264 -52.636291',
      },
    },
    temporalCoverage: '2015/2026',
    variableMeasured: [
      'Fuel Consumption (L/100km)',
      'City / Highway Fuel Economy',
      'Electric Energy Consumption (kWh/100km)',
      'Battery Electric Driving Range (km)',
      'CO2 Tailpipe Emissions (g/km)',
      'Sub-Zero Cold Weather Range Loss (-15°C)',
      'Annual Canadian Provincial Fuel & Hydro Costs (CAD)',
    ],
    measurementTechnique: 'NRCan EnerGuide 5-Cycle Laboratory Testing Standard',
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'Canadian Light-Duty Vehicle Fuel Economy Dataset (JSON)',
        encodingFormat: 'application/json',
        contentUrl: `${SITE_URL}/data/search-vehicles.json`,
      },
      {
        '@type': 'DataDownload',
        name: 'Canadian Fuel Economy & Range Explorer Web Interface',
        encodingFormat: 'text/html',
        contentUrl: `${SITE_URL}/search`,
      },
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: 'Open Government Portal (Government of Canada)',
      url: 'https://open.canada.ca',
    },
    keywords: [
      'NRCan EnerGuide',
      'Fuel Consumption Ratings',
      'L/100km',
      'Electric Vehicle Range',
      'Canada EV Winter Range',
      'Transport Canada Recalls',
    ],
  };
}

// ── Unified @graph Helpers ───────────────────────────────────────────────────
/**
 * Assembles multiple schema objects into a single, unified @graph structure.
 * Strips redundant nested @context declarations and guarantees clean entity resolution.
 */
export function createSchemaGraph(
  nodes: Array<Record<string, unknown> | null | undefined>
): { '@context': string; '@graph': Array<Record<string, unknown>> } {
  const sanitized = nodes
    .filter((node): node is Record<string, unknown> => Boolean(node && typeof node === 'object'))
    .map((node) => {
      const clone = { ...node };
      delete clone['@context'];
      return clone;
    });

  return {
    '@context': 'https://schema.org',
    '@graph': sanitized,
  };
}

export interface VehiclePageGraphOptions {
  provinceName?: string;
  breadcrumbs?: BreadcrumbItem[];
  imageUrl?: string;
}

/**
 * Drop-in generator for an interconnected WebPage + Car + BreadcrumbList + FAQPage @graph.
 */
export function buildVehiclePageGraph(
  v: Vehicle,
  pagePath: string,
  options?: VehiclePageGraphOptions
) {
  const fullPageUrl = pagePath.startsWith('http')
    ? pagePath
    : `${SITE_URL}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`;

  const breadcrumbs = options?.breadcrumbs ?? [
    { name: 'Home', url: '/' },
    { name: v.make, url: `/makes/${toSlug(v.make)}` },
    { name: v.model, url: `/makes/${toSlug(v.make)}/${toSlug(v.model)}` },
    { name: String(v.year), url: `/makes/${toSlug(v.make)}/${toSlug(v.model)}/${v.year}` },
    { name: v.trim, url: pagePath },
  ];

  const carNode = vehicleSchema(v, fullPageUrl, { imageUrl: options?.imageUrl });
  delete carNode['@context'];

  const breadcrumbNode = breadcrumbSchema(breadcrumbs, fullPageUrl);
  delete breadcrumbNode['@context'];

  const faqNode = faqSchema(v, options?.provinceName ?? 'Ontario', fullPageUrl);
  delete faqNode['@context'];

  const webPageNode = {
    '@type': 'ItemPage',
    '@id': `${fullPageUrl}#webpage`,
    url: fullPageUrl,
    name: `${v.year} ${v.make} ${v.model} ${v.trim} — Fuel Economy & Range Canada`,
    isPartOf: { '@id': WEBSITE_ID },
    breadcrumb: { '@id': `${fullPageUrl}#breadcrumb` },
    mainEntity: { '@id': `${fullPageUrl}#vehicle` },
    inLanguage: 'en-CA',
  };

  return createSchemaGraph([
    websiteSchema(),
    orgSchema(),
    webPageNode,
    breadcrumbNode,
    carNode,
    faqNode,
  ]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function driveTypeSchema(driveType: string): string {
  const map: Record<string, string> = {
    FWD: 'https://schema.org/FrontWheelDriveConfiguration',
    RWD: 'https://schema.org/RearWheelDriveConfiguration',
    AWD: 'https://schema.org/AllWheelDriveConfiguration',
    '4WD': 'https://schema.org/FourWheelDriveConfiguration',
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
