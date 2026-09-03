// src/pages/sitemap-provinces.xml.ts
import fuelPrices from '../data/fuel-prices.json';

export const GET = () => {
  const provinces = fuelPrices.provinces;
  const baseUrl = 'https://rangeandfuel.ca';
  const today = new Date().toISOString().split('T')[0];

  const urls = provinces.map(p => `  <url>
    <loc>${baseUrl}/provinces/${p.code.toLowerCase()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
