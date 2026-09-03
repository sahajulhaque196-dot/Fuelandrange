// src/pages/sitemap-index.xml.ts
// Partitioned Sitemap Index — prevents crawl budget exhaustion
import vehicles from '../data/vehicles.json';
import { toSlug } from '../lib/calculations.ts';

export const GET = () => {
  const all   = vehicles as any[];
  const makes = [...new Set(all.map((v: any) => toSlug(v.make)))].sort();
  const today = new Date().toISOString().split('T')[0];

  const sitemapEntries = makes.map((make: string) =>
    `  <sitemap>
    <loc>https://rangeandfuel.ca/sitemap-${make}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://rangeandfuel.ca/sitemap-main.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://rangeandfuel.ca/sitemap-provinces.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://rangeandfuel.ca/sitemap-compare.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
${sitemapEntries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
