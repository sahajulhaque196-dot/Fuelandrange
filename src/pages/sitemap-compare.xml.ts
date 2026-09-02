import vehicles from '../data/vehicles.json';
import { classSlug } from '../lib/calculations.ts';

export const GET = () => {
  const all = vehicles as any[];
  const classes = [...new Set(all.map((v: any) => v.vehicleClass))];
  const baseUrl = 'https://rangeandfuel.ca';
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `  <url>
    <loc>${baseUrl}/compare</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`,
    ...classes.map(cls => {
      const slug = classSlug(cls);
      return `  <url>
    <loc>${baseUrl}/compare/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }),
  ].join('\n');

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
