import type { APIRoute } from 'astro';
import vehicles from '../data/vehicles.json';
import { toSlug } from '../lib/calculations.ts';
import type { Vehicle } from '../lib/calculations.ts';

export async function getStaticPaths() {
  const all = vehicles as unknown as Vehicle[];
  const makes = [...new Set(all.map(v => toSlug(v.make)))];
  return makes.map(make => ({ params: { make } }));
}

export const GET: APIRoute = ({ params }) => {
  const { make } = params;
  const all = vehicles as unknown as Vehicle[];
  const makeVehicles = all.filter(v => toSlug(v.make) === make);
  const models = [...new Set(makeVehicles.map(v => toSlug(v.model)))];
  const today = new Date().toISOString().split('T')[0];

  const urls: Array<{ loc: string; priority: string; changefreq: string }> = [];

  // Make hub
  urls.push({ loc: `https://rangeandfuel.ca/makes/${make}`, priority: '0.9', changefreq: 'weekly' });

  // Model hubs
  for (const model of models) {
    urls.push({ loc: `https://rangeandfuel.ca/makes/${make}/${model}`, priority: '0.8', changefreq: 'weekly' });
  }

  // Deduplicate Unique Model + Year combinations
  const modelYears = [...new Set(makeVehicles.map(v => `${toSlug(v.model)}|${v.year}`))];
  for (const item of modelYears) {
    const [model, yr] = item.split('|');
    urls.push({
      loc: `https://rangeandfuel.ca/makes/${make}/${model}/${yr}`,
      priority: '0.9',
      changefreq: 'monthly',
    });
  }

  // Trim pages
  for (const v of makeVehicles) {
    const model = toSlug(v.model);
    urls.push({
      loc: `https://rangeandfuel.ca/makes/${make}/${model}/${v.year}/${toSlug(v.trim)}`,
      priority: '0.7',
      changefreq: 'monthly',
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
